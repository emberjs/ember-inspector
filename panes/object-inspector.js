(function() {
  /*global App:true Ember document location window chrome console XMLHttpRequest*/
  /*jshint evil:true*/

  "use strict";

  var get = Ember.get, set = Ember.set;

  window.resetDebugger = function() {
    App.__container__.lookup('controller:mixinStack').set('model', []);
  };

  window.activate = function() {
    var App = window.App = Ember.Application.create();

    App.ApplicationRoute = Ember.Route.extend({
    });

    App.ApplicationController = Ember.Controller.extend({
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

    App.MixinStackController = Ember.ArrayController.extend({
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

    App.MixinDetailsController = Ember.ObjectController.extend({
    });

    App.MixinDetailController = Ember.ObjectController.extend({
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

    App.ViewTreeController = Ember.Controller.extend({
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

    App.ViewTreeItemController = Ember.Controller.extend({

    });

    App.TreeNodeControllerView = Ember.View.extend({
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

    window.resetDebugger();
  };

  window.updateObject = function(options) {
    var details = options.details,
        name = options.name,
        property = options.property,
        objectId = options.objectId;

    Ember.NativeArray.apply(details);
    details.forEach(arrayize);

    var controller = App.__container__.lookup('controller:application');

    if (options.parentObject) {
      controller.pushMixinDetails(name, property, objectId, details);
    } else {
      controller.activateMixinDetails(name, details, objectId);
    }
  };

  window.updateProperty = function(options) {
    var detail = App.__container__.lookup('controller:mixinDetails').get('mixins').objectAt(options.mixinIndex);
    var property = Ember.get(detail, 'properties').findProperty('name', options.property);
    Ember.set(property, 'calculated', options.value);
  };

  window.viewTree = function(options) {
    var viewTree = App.__container__.lookup('controller:viewTree');
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

})();


(function() {

var port = chrome.extension.connect();
port.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

port.onMessage.addListener(function(message) {
  var toSend;

  if (message.type === 'viewTree') {
    toSend = { name: 'viewTree', args: [message] };
  } else if (message.details) {
    toSend = { name: 'updateObject', args: [message] };
    objectId = message.objectId;
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

})();
