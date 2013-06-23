define("application",
  ["resolver"],
  function(Resolver) {
    "use strict";

    var App = Ember.Application.extend({
      modulePrefix: '',
      resolver: Resolver
    });


    return App;
  });
define("controllers/application",
  [],
  function() {
    "use strict";
    var ApplicationController = Ember.Controller.extend({
      needs: ['mixinStack', 'mixinDetails'],

      pushMixinDetails: function(name, property, objectId, details) {
        details = { name: name, property: property, objectId: objectId, mixins: details };
        this.get('controllers.mixinStack').pushObject(details);
        this.set('controllers.mixinDetails.model', details);
      },

      popMixinDetails: function() {
        var mixinStack = this.get('controllers.mixinStack');
        var item = mixinStack.popObject();
        this.set('controllers.mixinDetails.model', mixinStack.get('lastObject'));
        window.releaseObject(item.objectId);
      },

      activateMixinDetails: function(name, details, objectId) {
        var objects = this.get('controllers.mixinStack').forEach(function(item) {
          window.releaseObject(item.objectId);
        });

        this.set('controllers.mixinStack.model', []);
        this.pushMixinDetails(name, undefined, objectId, details);
      }
    });


    return ApplicationController;
  });
define("controllers/mixin_detail",
  [],
  function() {
    "use strict";
    var MixinDetailController = Ember.ObjectController.extend({
      needs: ['mixinDetails'],

      isExpanded: function() {
        return this.get('model.name') === 'Own Properties';
      }.property('model.name'),

      digDeeper: function(property) {
        var objectId = this.get('controllers.mixinDetails.objectId');
        window.digDeeper(objectId, property);
      },

      calculate: function(property) {
        var objectId = this.get('controllers.mixinDetails.objectId');
        var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
        window.calculate(objectId, property, mixinIndex);
      }
    });


    return MixinDetailController;
  });
define("controllers/mixin_details",
  [],
  function() {
    "use strict";
    var MixinDetailsController = Ember.ObjectController.extend();


    return MixinDetailsController;
  });
define("controllers/mixin_stack",
  [],
  function() {
    "use strict";
    var MixinStackController = Ember.ArrayController.extend({
      needs: ['application'],

      trail: function() {
        var nested = this.slice(1);
        if (nested.length === 0) { return ""; }
        return "." + nested.mapProperty('property').join(".");
      }.property('[]'),

      isNested: function() {
        return this.get('length') > 1;
      }.property('[]'),

      popStack: function() {
        this.get('controllers.application').popMixinDetails();
      }
    });


    return MixinStackController;
  });
define("controllers/view_tree",
  [],
  function() {
    "use strict";
    var ViewTreeController = Ember.Controller.extend({
      showLayer: function(node) {
        this.set('pinnedNode', null);
        window.showLayer(node.value.objectId);
      },

      hideLayer: function(node) {
        if (!this.get('pinnedNode')) {
          window.hideLayer(node.value.objectId);
        }
      },

      pinLayer: function(node) {
        this.set('pinnedNode', node);
      }
    });


    return ViewTreeController;
  });
define("controllers/view_tree_item",
  [],
  function() {
    "use strict";
    var ViewTreeItemController = Ember.Controller.extend();


    return ViewTreeItemController;
  });
define("main",
  ["application","views/tree_node","views/tree_node_controller","exports"],
  function(App, TreeNodeView, TreeNodeControllerView, __exports__) {
    "use strict";

    var EmberExtension;

    window.resetDebugger = function() {
      EmberExtension.__container__.lookup('controller:mixinStack').set('model', []);
    };

    window.activate = function() {
      EmberExtension = App.create();
      EmberExtension.TreeNodeView = TreeNodeView;
      EmberExtension.TreeNodeControllerView = TreeNodeControllerView;
      window.resetDebugger();
    };

    window.updateObject = function(options) {
      var details = options.details,
          name = options.name,
          property = options.property,
          objectId = options.objectId;

      Ember.NativeArray.apply(details);
      details.forEach(arrayize);

      var controller = EmberExtension.__container__.lookup('controller:Application');

      if (options.parentObject) {
        controller.pushMixinDetails(name, property, objectId, details);
      } else {
        controller.activateMixinDetails(name, details, objectId);
      }
    };

    window.updateProperty = function(options) {
      var detail = EmberExtension.__container__.lookup('controller:mixinDetails').get('mixins').objectAt(options.mixinIndex);
      var property = Ember.get(detail, 'properties').findProperty('name', options.property);
      Ember.set(property, 'calculated', options.value);
    };

    window.viewTree = function(options) {
      var viewTree = EmberExtension.__container__.lookup('controller:viewTree');
      viewTree.set('node', { children: [ arrayizeTree(options.tree) ] });
    };

    function arrayize(mixin) {
      Ember.NativeArray.apply(mixin.properties);
    }

    function arrayizeTree(tree) {
      Ember.NativeArray.apply(tree.children);
      tree.children.forEach(arrayizeTree);
      return tree;
    }







    var port = chrome.extension.connect();
    port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

    port.onMessage.addListener(function(message) {
      var toSend;

      if (message.type === 'viewTree') {
        toSend = { name: 'viewTree', args: [message] };
      } else if (message.details) {
        toSend = { name: 'updateObject', args: [message] };
      } else if (message.property) {
        toSend = { name: 'updateProperty', args: [message] };
      }

      window[toSend.name].apply(window, toSend.args);
    });

    var queuedSend, panelVisible;

    window.activate();

    window.calculate = function(objectId, property, mixinIndex) {
      port.postMessage({ from: 'devtools', type: 'calculate', objectId: objectId, property: property.name, mixinIndex: mixinIndex });
    };

    window.digDeeper = function(objectId, property) {
      port.postMessage({ from: 'devtools', type: 'digDeeper', objectId: objectId, property: property.name });
    };

    window.releaseObject = function(objectId) {
      port.postMessage({ from: 'devtools', type: 'releaseObject', objectId: objectId });
    };

    window.showLayer = function(objectId) {
      port.postMessage({ from: 'devtools', type: 'showLayer', objectId: objectId });
    };

    window.hideLayer = function(objectId) {
      port.postMessage({ from: 'devtools', type: 'hideLayer', objectId: objectId });
    };

    window.getTree = function() {
      port.postMessage({ from: 'devtools', type: 'getTree' });
    };

    chrome.devtools.network.onNavigated.addListener(function() {
      location.reload(true);
    });

    function injectDebugger() {

      var xhr = new XMLHttpRequest();
      xhr.open("GET", chrome.extension.getURL('/assets/ember-debug.js'), false);
      xhr.send();
      var emberDebug = xhr.responseText;

      xhr = new XMLHttpRequest();
      xhr.open("GET", chrome.extension.getURL('/assets/startup_wrapper.js'), false);
      xhr.send();
      var startupWrapper = xhr.responseText;

      // make sure ember debug runs
      // after application has initialized
      emberDebug = startupWrapper.replace("{{emberDebug}}", emberDebug);

      chrome.devtools.inspectedWindow.eval(emberDebug);
    }

    injectDebugger();




    __exports__.EmberExtension = EmberExtension;
  });
this["Ember"] = this["Ember"] || {};
this["Ember"]["TEMPLATES"] = this["Ember"]["TEMPLATES"] || {};

this["Ember"]["TEMPLATES"]["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class='main-area'>\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.render),stack1 ? stack1.call(depth0, "viewTree", options) : helperMissing.call(depth0, "render", "viewTree", options))));
  data.buffer.push("\n</div>\n\n<div class='ember-object'>\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.render),stack1 ? stack1.call(depth0, "mixinStack", options) : helperMissing.call(depth0, "render", "mixinStack", options))));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["mixinDetails"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': ("mixin.type mixin.isExpanded:expanded")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "mixin.properties.length", {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "mixin.isExpanded", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    <h2 class=\"mixin properties\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "ID"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleProperty", "isExpanded", {hash:{
    'target': ("mixin")
  },contexts:[depth0,depth0],types:["ID","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "mixin.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n  ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <h2 class=\"mixin no-properties\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "mixin.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n  ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  <ul>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "property", "in", "mixin.properties", {hash:{},inverse:self.program(16, program16, data),fn:self.program(7, program7, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </ul>\n  ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n    <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': ("property.overridden:overridden")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "digDeeper", "property", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "property.value.computed", {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <span class='property-name'>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "property.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span><span class='property-value'>: </span>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "property.calculated", {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <span class='by'>(Overridden by ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "property.overridden", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(")</span>\n    </li>\n    ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <button ");
  hashContexts = {'bubbles': depth0};
  hashTypes = {'bubbles': "BOOLEAN"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "calculate", "property", {hash:{
    'bubbles': (false)
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><img src=\"/images/calculate.svg\"></button>\n      ");
  return buffer;
  }

function program10(depth0,data) {
  
  
  data.buffer.push("\n        <span class='pad'></span>\n      ");
  }

function program12(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <span class='calculated'>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "property.calculated", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n      ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': ("property.value.type")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "property.value.inspect", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n      ");
  return buffer;
  }

function program16(depth0,data) {
  
  
  data.buffer.push("\n    <li>No Properties</li>\n    ");
  }

  hashContexts = {'itemController': depth0};
  hashTypes = {'itemController': "STRING"};
  stack1 = helpers.each.call(depth0, "mixin", "in", "mixins", {hash:{
    'itemController': ("mixinDetail")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["mixinStack"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "popStack", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">◀ Back</button>\n  ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n    <span>◀ Back</span>\n  ");
  }

  data.buffer.push("<h1>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isNested", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "firstObject.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</h1>\n<h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "trail", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.render),stack1 ? stack1.call(depth0, "mixinDetails", options) : helperMissing.call(depth0, "render", "mixinDetails", options))));
  data.buffer.push("\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["treeNode"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n    <li><p>\n      ");
  hashContexts = {'nodeBinding': depth0};
  hashTypes = {'nodeBinding': "STRING"};
  stack1 = helpers.view.call(depth0, "EmberExtension.TreeNodeControllerView", {hash:{
    'nodeBinding': ("node")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <span class='template'>template:");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "node.value.template", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    </p>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EmberExtension.TreeNodeView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </li>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "node.value.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

  data.buffer.push("<ul class='view-tree-node'>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "node", "in", "node.children", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["viewTree"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class='view-tree'>\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EmberExtension.TreeNodeView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
define("views/tree_node",
  [],
  function() {
    "use strict";
    var TreeNodeView = Ember.View.extend({
      templateName: 'treeNode'
    });


    return TreeNodeView;
  });
define("views/tree_node_controller",
  [],
  function() {
    "use strict";
    var TreeNodeControllerView = Ember.View.extend({
      tagName: 'span',
      classNames: 'controller',
      classNameBindings: 'isPinned',

      isPinned: function() {
        return this.get('node') === this.get('controller.pinnedNode');
      }.property('node', 'controller.pinnedNode'),

      mouseEnter: function() {
        this.get('controller').send('showLayer', this.get('node'));
      },

      mouseLeave: function() {
        this.get('controller').send('hideLayer', this.get('node'));
      },

      click: function() {
        this.get('controller').pinLayer(this.get('node'));
      }
    });


    return TreeNodeControllerView;
  });