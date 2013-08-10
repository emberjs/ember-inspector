define("application",
  ["router","resolver"],
  function(Router, resolver) {
    "use strict";

    var App = Ember.Application.extend({
      modulePrefix: '',
      resolver: resolver,
      Router: Router
    });


    return App;
  });
define("components/drag_handle",
  [],
  function() {
    "use strict";
    var DragHandleComponent = Ember.Component.extend({
      classNames: ['drag-handle'],
      isDragging: false,
      positionLeft: null,
      positionRight: null,

      startDragging: function() {
        var self = this,
            body = Ember.$('body'),
            namespace = 'drag-' + this.get('elementId');

        this.set('isDragging', true);
        body.on('mousemove.' + namespace, function(e){
          self.setProperties({
            positionRight: body.width() - e.pageX,
            positionLeft: e.pageX
          });
        })
        .on('mouseup.' + namespace + ' mouseleave.' + namespace, function(){
          self.stopDragging();
        });
      },

      stopDragging: function() {
        this.set('isDragging', false);
        Ember.$('body').off('.drag-' + this.get('elementId'));
      },

      willDestroyElement: function() {
        this._super();
        this.stopDragging();
      },

      mouseDown: function() {
        this.startDragging();
        return false;
      }
    });


    return DragHandleComponent;
  });
define("controllers/application",
  [],
  function() {
    "use strict";
    var ApplicationController = Ember.Controller.extend({
      needs: ['mixinStack', 'mixinDetails'],

      emberApplication: false,
      isDragging: false,
      inspectorWidth: null,

      // Indicates that the extension window is focused,
      active: true,

      inspectorExpanded: false,

      pushMixinDetails: function(name, property, objectId, details) {
        details = { name: name, property: property, objectId: objectId, mixins: details };
        this.get('controllers.mixinStack').pushObject(details);
        this.set('controllers.mixinDetails.model', details);
      },

      popMixinDetails: function() {
        var mixinStack = this.get('controllers.mixinStack');
        var item = mixinStack.popObject();
        this.set('controllers.mixinDetails.model', mixinStack.get('lastObject'));
        this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
      },

      activateMixinDetails: function(name, details, objectId) {
        var self = this;
        var objects = this.get('controllers.mixinStack').forEach(function(item) {
          self.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
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
        return this.get('model.expand') && this.get('model.properties.length') > 0;
      }.property('model.expand', 'model.properties.length'),

      objectId: Ember.computed.alias('controllers.mixinDetails.objectId'),

      digDeeper: function(property) {
        var objectId = this.get('objectId');
        this.get('port').send('objectInspector:digDeeper', {
          objectId: objectId,
          property: property.name
        });
      },

      calculate: function(property) {
        var objectId = this.get('objectId');
        var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
        this.get('port').send('objectInspector:calculate', {
          objectId: objectId,
          property: property.name,
          mixinIndex: mixinIndex
        });
      },

      sendToConsole: function(property) {
        var objectId = this.get('objectId');
        this.get('port').send('objectInspector:sendToConsole', {
          objectId: objectId,
          property: property.name
        });
      },

      saveProperty: function(prop, val) {
        var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
        this.get('port').send('objectInspector:saveProperty', {
          objectId: this.get('objectId'),
          property: prop,
          value: val,
          mixinIndex: mixinIndex
        });
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
define("controllers/mixin_property",
  [],
  function() {
    "use strict";
    var MixinPropertyController = Ember.ObjectController.extend({
      isEdit: false,

      // Bound to editing textbox
      txtValue: null,

      isCalculated: function() {
        return this.get('value.type') !== 'type-descriptor';
      }.property('value.type'),

      isEmberObject: Ember.computed.equal('value.type', 'type-ember-object'),

      isComputedProperty: Ember.computed.alias('value.computed'),

      isFunction: Ember.computed.equal('value.type', 'type-function'),

      isArray: Ember.computed.equal('value.type', 'type-array'),

      valueClick: function() {
        if (this.get('isEmberObject')) {
          this.get('target').send('digDeeper', this.get('model'));
          return;
        }

        if (this.get('isComputedProperty') && !this.get('isCalculated')) {
          this.get('target').send('calculate', this.get('model'));
          return;
        }

        if (this.get('isFunction') || this.get('isArray') || this.get('overridden')) {
          return;
        }

        var value = this.get('value.inspect');
        var type = this.get('value.type');
        if (type === 'type-string') {
          value = '"' + value + '"';
        }
        this.set('txtValue', value);
        this.set('isEdit', true);

      },

      saveProperty: function() {
        var txtValue = this.get('txtValue');
        var realValue;
        try {
          realValue = eval('(' + txtValue + ')');
        } catch(e) {
          realValue = txtValue;
        }
        this.get('target').send('saveProperty', this.get('name'), realValue);
      }


    });


    return MixinPropertyController;
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
        if(this.get('isNested')) {
          this.get('controllers.application').popMixinDetails();
        }
      }
    });


    return MixinStackController;
  });
define("controllers/model_type_item",
  [],
  function() {
    "use strict";
    var ModelTypeItemController = Ember.ObjectController.extend({
      needs: ['model_types'],

      selected: function() {
        return this.get('model') === this.get('controllers.model_types.selected');
      }.property('controllers.model_types.selected'),

      collapsed: Ember.computed.alias('controllers.model_types.collapsed')

    });


    return ModelTypeItemController;
  });
define("controllers/model_types",
  [],
  function() {
    "use strict";
    var ModelTypesController = Ember.ArrayController.extend({
      collapsed: Ember.computed.bool('selected')
    });


    return ModelTypesController;
  });
define("controllers/record",
  [],
  function() {
    "use strict";
    var RecordController = Ember.ObjectController.extend({

      modelTypeColumns: Ember.computed.alias('target.target.columns'),

      // TODO: Color record based on `color` property.
      style: function() {
        return '';
      }.property('color'),

      columns: function() {
        var self = this;
        return this.get('modelTypeColumns').map(function(col) {
          return { name: col.name, value: self.get('columnValues.' + col.name) };
        });
      }.property('modelTypeColumns.@each', 'model.columnValues')
    });


    return RecordController;
  });
define("controllers/record_filter",
  [],
  function() {
    "use strict";
    var RecordFilterController = Ember.ObjectController.extend({
      init: function() {
        this._super();
        this.valueChanged();
      },

      needs: ['records'],

      checked: true,

      labelStyle: function() {
        if (!this.get('checked')) { return 'text-decoration: line-through;'; }
        return '';
      }.property('checked'),

      toggleCheck: function() {
        this.toggleProperty('checked');
      },

      valueChanged: function() {
        if (!this.get('name')) { return; }
        this.set('controllers.records.filterValues.' + this.get('name'), this.get('checked'));
        this.get('controllers.records').notifyPropertyChange('filterValues');
      }.observes('checked', 'name')
    });


    return RecordFilterController;
  });
define("controllers/records",
  [],
  function() {
    "use strict";
    var RecordsController = Ember.ArrayController.extend({
      init: function() {
        this._super();
        this.set('filters', []);
        this.set('filterValues', {});
      },

      columns: Ember.computed.alias('modelType.columns'),

      filters: [],

      filterValues: {},

      search: '',

      modelChanged: function() {
        this.set('search', '');
      }.observes('model'),

      recordToString: function(record) {
        var search = Ember.get(record, 'searchIndex').join(' ');
        return search.toLowerCase();
      },

      filtered: function() {
        var self = this, search = this.get('search');
        return this.get('model').filter(function(item) {
          var filters = self.get('filterValues');
          for(var key in filters) {
            if (!filters[key] && Ember.get(item, 'filterValues.' + key)) {
              return false;
            }
          }
          if (!Ember.isEmpty(search)) {
            var searchString = self.recordToString(item);
            return !!searchString.toLowerCase().match(new RegExp('.*' + search + '.*'));
          }
          return true;
        });
      }.property('search', 'model.@each.columnValues', 'model.@each.filterValues', 'filterValues')

    });


    return RecordsController;
  });
define("controllers/route_node",
  [],
  function() {
    "use strict";
    var get = Ember.get;

    var RouteNodeController = Ember.ObjectController.extend({
      needs: 'routeTree',

      details: null,

      withDetails: false,

      hasChildren: Ember.computed.gt('children.length', 0),

      style: function() {
        return 'padding-left: ' + ((this.get('numParents') * 5) + 5) + 'px';
      }.property('numParents'),


      numParents: function() {
        var numParents = this.get('target.target.numParents');
        if (numParents === undefined) {
          numParents = -1;
        }
        return numParents + 1;
      }.property("target.target.numParents"),

      isCurrent: function() {
        var currentRoute = this.get('controllers.routeTree.currentRoute');
        if (!currentRoute) {
          return false;
        }
        if (this.get('value.name') === 'application') {
          return true;
        }
        var regName = this.get('value.name').replace('.', '\\.');
        return !!currentRoute.match(new RegExp('(^|\\.)' + regName + '(\\.|$)'));
      }.property('controllers.routeTree.currentRoute', 'value.name')

    });


    return RouteNodeController;
  });
define("controllers/route_tree",
  [],
  function() {
    "use strict";
    var RouteTreeController = Ember.ObjectController.extend({
      currentRoute: null
    });


    return RouteTreeController;
  });
define("controllers/view_tree",
  [],
  function() {
    "use strict";
    var ViewTreeController = Ember.Controller.extend({
      pinnedNode: null,

      showLayer: function(node) {
        this.set('pinnedNode', null);
        this.get('port').send('view:showLayer', { objectId: node.value.objectId });
        this.set('pinnedNode', node);
      },

      hideLayer: function(node) {
        this.get('port').send('view:hideLayer', { objectId: node.value.objectId });
      },

      previewLayer: function(node) {
        if (node !== this.get('pinnedNode')) {
          this.get('port').send('view:previewLayer', { objectId: node.value.objectId });
        }
      },

      hidePreview: function(node) {
        this.get('port').send('view:hidePreview', { objectId: node.value.objectId });
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
  ["application","views/tree_node_controller","views/property_field","components/drag_handle","port"],
  function(App, TreeNodeControllerView, PropertyFieldView, DragHandleComponent, Port) {
    "use strict";

    var EmberExtension;

    EmberExtension = App.create();
    EmberExtension.TreeNodeControllerView = TreeNodeControllerView;
    EmberExtension.PropertyFieldView = PropertyFieldView;
    EmberExtension.DragHandleComponent = DragHandleComponent;
    EmberExtension.Port = Port;


    if (typeof chrome !== 'undefined' && chrome.devtools) {
      chrome.devtools.network.onNavigated.addListener(function() {
        location.reload(true);
      });

      injectDebugger();
    }

    function injectDebugger() {

      var xhr = new XMLHttpRequest();
      xhr.open("GET", chrome.extension.getURL('/ember_debug/ember_debug.js'), false);
      xhr.send();
      var emberDebug = '(function() { ' + xhr.responseText + ' }());';

      chrome.devtools.inspectedWindow.eval(emberDebug);
    }



    return EmberExtension;
  });
define("port",
  [],
  function() {
    "use strict";
    var chromePort;


    /**
      Possible messages:

      calculate:
       objectId: objectId,
       property: property.name,
       mixinIndex: mixinIndex

      digDeeper:
        objectId: objectId,
        property: property.name

      releaseObject:
        objectId: objectId

      showLayer:
        objectId: objectId

      hideLayer:
        objectId: objectId

      getTree:
    */

    var Port = Ember.Object.extend(Ember.Evented, {
      init: function() {
        connect.apply(this);
      },
      send: function(messageType, options) {
        options = options || {};
        options.from = 'devtools';
        options.type = messageType;
        chromePort.postMessage(options);
      }
    });


    var connect = function() {
      var self = this;
      chromePort = chrome.extension.connect();
      chromePort.postMessage({ appId: chrome.devtools.inspectedWindow.tabId });

      chromePort.onMessage.addListener(function(message) {
        self.trigger(message.type, message);
      });
    };


    Ember.Application.initializer({
      name: "port",

      initialize: function(container, application) {
        container.register('port:main', application.Port);
        container.lookup('port:main');
      }
    });

    Ember.Application.initializer({
      name: "injectPort",

      initialize: function(container) {
        container.typeInjection('controller', 'port', 'port:main');
        container.typeInjection('route', 'port', 'port:main');
      }
    });


    return Port;
  });
define("router",
  [],
  function() {
    "use strict";
    var Router = Ember.Router.extend({
      location: 'none'
    });

    Router.map(function() {
      this.route('view_tree', { path: '/' });
      this.route('route_tree');

      this.resource('data', function() {
        this.resource('model_types', function() {
          this.resource('model_type', { path: '/:type_id'}, function() {
            this.resource('records');
          });
        });
      });

    });


    return Router;
  });
define("routes/application",
  [],
  function() {
    "use strict";
    var ApplicationRoute = Ember.Route.extend({

      setupController: function(controller, model) {
        this.controllerFor('mixinStack').set('model', []);

        this.get('port').on('objectInspector:updateObject', this, this.updateObject);
        this.get('port').on('objectInspector:updateProperty', this, this.updateProperty);

        this.get('port').one('view:viewTree', this, function() {
          controller.set('emberApplication', true);
        });
        this._super(controller, model);
      },

      deactivate: function() {
        this.get('port').off('objectInspector:updateObject', this, this.updateObject);
        this.get('port').off('objectInspector:updateProperty', this, this.updateProperty);
      },

      updateObject: function(options) {
        var details = options.details,
          name = options.name,
          property = options.property,
          objectId = options.objectId;

        Ember.NativeArray.apply(details);
        details.forEach(arrayize);

        var controller = this.get('controller');

        if (options.parentObject) {
          controller.pushMixinDetails(name, property, objectId, details);
        } else {
          controller.activateMixinDetails(name, details, objectId);
        }

        this.send('expandInspector');
      },

      updateProperty: function(options) {
        var detail = this.controllerFor('mixinDetails').get('mixins').objectAt(options.mixinIndex);
        var property = Ember.get(detail, 'properties').findProperty('name', options.property);
        Ember.set(property, 'value', options.value);
      },

      events: {
        expandInspector: function() {
          this.set("controller.inspectorExpanded", true);
        },
        toggleInspector: function() {
          this.toggleProperty("controller.inspectorExpanded");
        }
      }

    });

    function arrayize(mixin) {
      Ember.NativeArray.apply(mixin.properties);
    }


    return ApplicationRoute;
  });
define("routes/data_index",
  [],
  function() {
    "use strict";
    var DataIndexRoute = Ember.Route.extend({
      beforeModel: function() {
        this.transitionTo('model_types');
      }
    });


    return DataIndexRoute;
  });
define("routes/model_type",
  [],
  function() {
    "use strict";
    var ModelTypeRoute = Ember.Route.extend({
      setupController: function(controller, model) {
        this._super(controller, model);
        this.controllerFor('model_types').set('selected', model);
      },

      deactivate: function() {
        this.controllerFor('model_types').set('selected', null);
      }
    });


    return ModelTypeRoute;
  });
define("routes/model_types",
  [],
  function() {
    "use strict";
    var Promise = Ember.RSVP.Promise;

    var ModelTypesRoute = Ember.Route.extend({
      setupController: function(controller, model) {
        this._super(controller, model);
        this.get('port').on('data:modelTypesAdded', this, this.addModelTypes);
        this.get('port').on('data:modelTypesUpdated', this, this.updateModelTypes);
        this.get('port').send('data:getModelTypes');
      },

      model: function() {
        return [];
      },

      deactivate: function() {
        this.get('port').off('data:modelTypesUpdated', this, this.updateModelType);
        this.get('port').off('data:modelTypesAdded', this, this.updateModelType);
        this.get('port').send('data:releaseModelTypes');
      },

      addModelTypes: function(message) {
        this.get('currentModel').pushObjects(message.modelTypes);
      },

      updateModelTypes: function(message) {
        var self = this;
        message.modelTypes.forEach(function(modelType) {
          var currentType = self.get('currentModel').findProperty('objectId', modelType.objectId);
          Ember.set(currentType, 'count', modelType.count);
        });
      },

      events: {
        viewRecords: function(type) {
          this.transitionTo('records', type);
        }
      }
    });


    return ModelTypesRoute;
  });
define("routes/records",
  [],
  function() {
    "use strict";
    var Promise = Ember.RSVP.Promise, set = Ember.set;

    var RecordsRoute = Ember.Route.extend({
      setupController: function(controller, model) {
        this._super(controller, model);

        var type = this.modelFor('model_type');

        controller.set('modelType', this.modelFor('model_type'));

        this.get('port').on('data:recordsAdded', this, this.addRecords);
        this.get('port').on('data:recordUpdated', this, this.updateRecord);
        this.get('port').on('data:recordsRemoved', this, this.removeRecords);
        this.get('port').one('data:filters', this, function(message) {
          this.set('controller.filters', message.filters);
        });
        this.get('port').send('data:getFilters');
        this.get('port').send('data:getRecords', { objectId: type.objectId });
      },

      model: function() {
        return [];
      },

      deactivate: function() {
        this.get('port').off('data:recordsAdded', this, this.addRecords);
        this.get('port').off('data:recordUpdated', this, this.updateRecord);
        this.get('port').off('data:recordsRemoved', this, this.removeRecords);
        this.get('port').send('data:releaseRecords');
      },

      updateRecord: function(message) {
        var currentRecord = this.get('currentModel').findProperty('objectId', message.record.objectId);
        set(currentRecord, 'columnValues', message.record.columnValues);
        set(currentRecord, 'filterValues', message.record.filterValues);
        set(currentRecord, 'searchIndex', message.record.searchIndex);
        set(currentRecord, 'color', message.record.color);
      },

      addRecords: function(message) {
        this.get('currentModel').pushObjects(message.records);
      },

      removeRecords: function(message) {
        this.get('currentModel').removeAt(message.index, message.count);
      },

      events: {
        inspectModel: function(model) {
          this.get('port').send('data:inspectModel', { objectId: Ember.get(model, 'objectId') });
        }
      }
    });


    return RecordsRoute;
  });
define("routes/route_tree",
  [],
  function() {
    "use strict";
    var RouteTreeRoute = Ember.Route.extend({
      setupController: function(controller, model) {
        this._super(controller, model);
        this.get('port').on('route:currentRoute', this, this.setCurrentRoute);
        this.get('port').send('route:getCurrentRoute');
        this.get('port').on('route:routeTree', this, this.setTree);
        this.get('port').send('route:getTree');
      },

      deactivate: function() {
        this.get('port').off('route:currentRoute');
        this.get('port').off('route:routeTree', this, this.setViewTree);
      },

      setCurrentRoute: function(message) {
        this.get('controller').set('currentRoute', message.name);
      },

      setTree: function(options) {
        this.set('controller.model', { children: [ arrayizeTree(options.tree) ] });
      },

      events: {
        inspectRoute: function(name) {
          this.get('port').send('objectInspector:inspectRoute', { name: name } );
        },

        inspectController: function(controller) {
          if (!controller.exists) {
            return;
          }
          this.get('port').send('objectInspector:inspectController', { name: controller.name } );
        }
      }
    });

    function arrayizeTree(tree) {
      if(tree.children) {
        Ember.NativeArray.apply(tree.children);
        tree.children.forEach(arrayizeTree);
      }
      return tree;
    }


    return RouteTreeRoute;
  });
define("routes/view_tree",
  [],
  function() {
    "use strict";
    var ViewTreeRoute = Ember.Route.extend({
      setupController: function() {
        this.get('port').on('view:viewTree', this, this.setViewTree);
        this.get('port').send('view:getTree');
      },

      deactivate: function() {
        this.get('port').off('view:viewTree', this, this.setViewTree);
      },

      setViewTree: function(options) {
        this.set('controller.node', { children: [ arrayizeTree(options.tree) ] });
      }

    });


    function arrayizeTree(tree) {
      Ember.NativeArray.apply(tree.children);
      tree.children.forEach(arrayizeTree);
      return tree;
    }



    return ViewTreeRoute;
  });
this["Ember"] = this["Ember"] || {};
this["Ember"]["TEMPLATES"] = this["Ember"]["TEMPLATES"] || {};

this["Ember"]["TEMPLATES"]["_route_node"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <tr data-label=\"route-node\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': ("isCurrent")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n    <td ");
  hashContexts = {'class': depth0,'style': depth0};
  hashTypes = {'class': "STRING",'style': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': (":table-tree__main-cell isCurrent:table-tree__main-cell_state_current"),
    'style': ("style")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"route-name\">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </td>\n    <td class=\"table-tree__clickable\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "inspectRoute", "value.routeHandler.name", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"route-handler\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.routeHandler.className", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "value.controller.exists", {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <td data-label=\"route-template\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.template.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n    <td class=\"table-tree__minor\" data-label=\"route-url\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.url", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n  </tr>\n\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial),stack1 ? stack1.call(depth0, "route_node", options) : helperMissing.call(depth0, "partial", "route_node", options))));
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      <td class=\"table-tree__clickable\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "inspectController", "value.controller", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"route-controller\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.controller.className", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      <td data-label=\"route-controller\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.controller.className", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n    ");
  return buffer;
  }

  hashContexts = {'itemController': depth0};
  hashTypes = {'itemController': "STRING"};
  stack1 = helpers.each.call(depth0, "children", {hash:{
    'itemController': ("routeNode")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["_view_node"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n    <li class=\"tree__node-child\" data-label=\"tree-view\">\n      <p class=\"tree__node-header\">\n        ");
  hashContexts = {'nodeBinding': depth0,'label': depth0};
  hashTypes = {'nodeBinding': "STRING",'label': "STRING"};
  stack1 = helpers.view.call(depth0, "EmberExtension.TreeNodeControllerView", {hash:{
    'nodeBinding': ("node"),
    'label': ("tree-view-controller")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <span class='tree__node-hint' data-label=\"tree-view-template\">template:");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "node.value.template", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n      </p>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "node.children.length", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </li>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "node.value.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program4(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial),stack1 ? stack1.call(depth0, "view_node", options) : helperMissing.call(depth0, "partial", "view_node", options))));
  data.buffer.push("\n      ");
  return buffer;
  }

  data.buffer.push("<ul class=\"tree__node\" data-label=\"tree-node\">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "node", "in", "node.children", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n\n  <div class=\"app__nav-holder\">\n    <nav ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': (":main-nav view.inactive:main-nav_state_inactive")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n      <ul class=\"main-nav__list\">\n        <li class=\"main-nav__item\">\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "view_tree", options) : helperMissing.call(depth0, "linkTo", "view_tree", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </li>\n        <li class=\"main-nav__item\">\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "route_tree", options) : helperMissing.call(depth0, "linkTo", "route_tree", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </li>\n        <li class=\"main-nav__item\">\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "data", options) : helperMissing.call(depth0, "linkTo", "data", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </li>\n      </ul>\n    </nav>\n  </div>\n\n\n  <div class=\"app__main\">\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "inspectorExpanded", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n  <div class=\"app__right-col\" ");
  hashContexts = {'style': depth0};
  hashTypes = {'style': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'style': ("view.inspectorStyle")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "inspectorExpanded", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n    <div class=\"app__inspector-container\">\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.render),stack1 ? stack1.call(depth0, "mixinStack", options) : helperMissing.call(depth0, "render", "mixinStack", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n\n");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n            View Tree\n            <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" enable-background=\"new 0 0 19 19\" xml:space=\"preserve\">\n              <path fill=\"#454545\" d=\"M0,0v19h19V0H0z M6.109,17.445h-4.57V5.297h4.57V17.445z M17.461,17.445H6.83V5.297h10.63v12.148H17.461z M17.461,4.543H1.539V1.506h15.922V4.543z\"/>\n            </svg>\n          ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n            Routes\n            <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"19px\" height=\"19px\" viewBox=\"0 0 19 19\" enable-background=\"new 0 0 19 19\" xml:space=\"preserve\">\n              <g>\n                <polygon fill=\"#454545\" points=\"0.591,17.012 2.36,17.012 6.841,2.086 5.07,2.086   \"/>\n                <path fill=\"#454545\" d=\"M18.117,8.495l0.292-1.494h-2.242l0.874-3.507h-1.544l-0.874,3.507h-1.88l0.874-3.507h-1.536l-0.883,3.507 H8.668L8.375,8.495h2.449l-0.616,2.474H7.875l-0.292,1.495h2.252l-0.883,3.515h1.544l0.874-3.515h1.888l-0.883,3.515h1.544 l0.874-3.515h2.53l0.303-1.495h-2.459l0.625-2.474H18.117z M14.249,8.495l-0.617,2.474h-1.888l0.625-2.474H14.249z\"/>\n              </g>\n            </svg>\n          ");
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n           Data\n          ");
  }

function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <div class=\"app__toggle-inspector-btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleInspector", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&laquo;</div>\n  ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n      <div class=\"app__right-col-drag\">\n        ");
  hashContexts = {'isDragging': depth0,'positionRight': depth0};
  hashTypes = {'isDragging': "ID",'positionRight': "ID"};
  options = {hash:{
    'isDragging': ("isDragging"),
    'positionRight': ("inspectorWidth")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['drag-handle']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "drag-handle", options))));
  data.buffer.push("\n      </div>\n\n      <div class=\"app__toggle-inspector-btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleInspector", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&raquo;</div>\n    ");
  return buffer;
  }

function program12(depth0,data) {
  
  
  data.buffer.push("\n  No Ember Application Detected.\n");
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "emberApplication", {hash:{},inverse:self.program(12, program12, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["components/drag-handle"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '';


  return buffer;
  
});

this["Ember"]["TEMPLATES"]["data"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["mixin_details"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': (":mixin mixin.type mixin.isExpanded:mixin_state_expanded mixin.properties.length:mixin_props_yes:mixin_props_no")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"object-detail\" >\n  ");
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
  data.buffer.push("\n    <h2 class=\"mixin__name\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "ID"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleProperty", "isExpanded", {hash:{
    'target': ("mixin")
  },contexts:[depth0,depth0],types:["ID","STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"object-detail-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "mixin.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n  ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <h2 class=\"mixin__name\" data-label=\"object-detail-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "mixin.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n  ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n  <ul class=\"mixin__properties\">\n    ");
  hashContexts = {'itemController': depth0};
  hashTypes = {'itemController': "STRING"};
  stack1 = helpers.each.call(depth0, "mixin.properties", {hash:{
    'itemController': ("mixinProperty")
  },inverse:self.program(16, program16, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
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
    'class': ("overridden:mixin__property_state_overridden :mixin__property")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"object-property\">\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "value.computed", {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <span class='mixin__property-name' data-label=\"object-property-name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span><span class='mixin__property-value-separator'>: </span>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isEdit", {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <span class='mixin__property-overridden-by'>(Overridden by ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "overridden", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(")</span>\n      <button class=\"mixin__send-btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendToConsole", "model", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"send-to-console-btn\"><img src=\"/images/send.png\" title=\"Send to console\"></button>\n    </li>\n    ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <button ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': (":mixin__calc-btn isCalculated:mixin__calc-btn_calculated")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'bubbles': depth0};
  hashTypes = {'bubbles': "BOOLEAN"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "calculate", "model", {hash:{
    'bubbles': (false)
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"calculate\"><img src=\"/images/calculate.svg\"></button>\n      ");
  return buffer;
  }

function program10(depth0,data) {
  
  
  data.buffer.push("\n        <span class='pad'></span>\n      ");
  }

function program12(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <span  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "valueClick", "model", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': ("value.type :mixin__property-value")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"object-property-value\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value.inspect", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n      ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        ");
  hashContexts = {'classNames': depth0,'valueBinding': depth0,'label': depth0};
  hashTypes = {'classNames': "STRING",'valueBinding': "ID",'label': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "EmberExtension.PropertyFieldView", {hash:{
    'classNames': ("mixin__property-value-txt"),
    'valueBinding': ("txtValue"),
    'label': ("object-property-value-txt")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  return buffer;
  }

function program16(depth0,data) {
  
  
  data.buffer.push("\n    <li class=\"mixin__property\">No Properties</li>\n    ");
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

this["Ember"]["TEMPLATES"]["mixin_stack"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "popStack", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"object-inspector-back\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': (":object-inspector__back isNested:object-inspector__back_state_enabled:object-inspector__back_state_disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></button>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <h2 class=\"object-inspector__header-trail\" data-label=\"object-trail\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "trail", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"object-inspector__header\">\n  <h1 class=\"object-inspector__header-main\">\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "length", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <span data-label=\"object-name\" class=\"object-inspector__name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "firstObject.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n  </h1>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "trail", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n<div class=\"object-inspector__mixins\">\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.render),stack1 ? stack1.call(depth0, "mixinDetails", options) : helperMissing.call(depth0, "render", "mixinDetails", options))));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["model_type"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["model_types"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n            <th><div class=\"table-tree__th-inner\"># Records</div></th>\n            ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n            <tr ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': ("selected:table-tree__row_selected")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" data-label=\"model-type-row\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "viewRecords", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n\n              <td data-label=\"model-type-name\" class=\"table-tree__clickable\" >\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n              </td>\n\n              ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "collapsed", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </tr>\n          ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              <td data-label=\"model-type-name\" class=\"table-tree__clickable\" >\n                ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "count", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n              </td>\n              ");
  return buffer;
  }

  data.buffer.push("<div class=\"split__parent\">\n  <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'class': (":table-tree collapsed:table-tree_state_collapsed")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n    <div class=\"table-tree__table-container\">\n      <table cellspacing=\"0\" border-collapse=\"collapse\">\n        <thead>\n          <tr>\n            <th><div class=\"table-tree__th-inner\">Model Type</div></th>\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "collapsed", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </tr>\n        </thead>\n        <tbody>\n          ");
  hashContexts = {'itemController': depth0};
  hashTypes = {'itemController': "STRING"};
  stack1 = helpers.each.call(depth0, {hash:{
    'itemController': ("modelTypeItem")
  },inverse:self.noop,fn:self.program(3, program3, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n<div class=\"split__child\">\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["records"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            <th><div class=\"table-tree__th-inner\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div></th>\n          ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n          <tr data-label=\"record-row\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "inspectModel", "model", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "columns", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </tr>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n            <td data-label=\"record-name\" class=\"table-tree__clickable\" ");
  hashContexts = {'style': depth0};
  hashTypes = {'style': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'style': ("controller.style")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("  >\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "value", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </td>\n            ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n        <div class=\"filter-bar__checkbox\">");
  hashContexts = {'type': depth0,'checked': depth0};
  hashTypes = {'type': "STRING",'checked': "ID"};
  options = {hash:{
    'type': ("checkbox"),
    'checked': ("checked")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        <label ");
  hashContexts = {'style': depth0};
  hashTypes = {'style': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'style': ("labelStyle")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCheck", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "desc", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label></div>\n      ");
  return buffer;
  }

  data.buffer.push("<div class=\"table-tree table-tree_type_advanced\">\n  <div class=\"table-tree__table-container\">\n    <table cellspacing=\"0\" border-collapse=\"collapse\">\n      <thead>\n        <tr>\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "columns", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </tr>\n      </thead>\n      <tbody>\n        ");
  hashContexts = {'itemController': depth0};
  hashTypes = {'itemController': "STRING"};
  stack1 = helpers.each.call(depth0, "filtered", {hash:{
    'itemController': ("record")
  },inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </tbody>\n    </table>\n  </div>\n\n  <div class=\"table-tree__filter\">\n    <div class=\"filter-bar\">\n      <div class=\"filter-bar__search\">\n        ");
  hashContexts = {'value': depth0,'placeholder': depth0};
  hashTypes = {'value': "ID",'placeholder': "STRING"};
  options = {hash:{
    'value': ("search"),
    'placeholder': ("Search")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      </div>\n      ");
  hashContexts = {'itemController': depth0};
  hashTypes = {'itemController': "STRING"};
  stack2 = helpers.each.call(depth0, "filters", {hash:{
    'itemController': ("recordFilter")
  },inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </div>\n  </div>\n\n</div>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["route_tree"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"table-tree table-tree_color_faded\">\n  <div class=\"table-tree__table-container\">\n    <table cellspacing=\"0\" border-collapse=\"collapse\">\n      <thead>\n        <tr>\n          <th>\n            <div class=\"table-tree__th-inner\">Route Name</div>\n          </th>\n          <th>\n            <div class=\"table-tree__th-inner\">Route</div>\n          </th>\n          <th>\n            <div class=\"table-tree__th-inner\">Controller</div>\n          </th>\n          <th>\n            <div class=\"table-tree__th-inner\">Template</div>\n          </th>\n          <th>\n            <div class=\"table-tree__th-inner\">URL</div>\n          </th>\n        </tr>\n      </thead>\n      <tbody>\n        ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial),stack1 ? stack1.call(depth0, "route_node", options) : helperMissing.call(depth0, "partial", "route_node", options))));
  data.buffer.push("\n      </tbody>\n    </table>\n  </div>\n</div>\n");
  return buffer;
  
});

this["Ember"]["TEMPLATES"]["view_tree"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [3,'>= 1.0.0-rc.4'];
helpers = helpers || Ember.Handlebars.helpers; data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"tree\">\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial),stack1 ? stack1.call(depth0, "view_node", options) : helperMissing.call(depth0, "partial", "view_node", options))));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
define("views/application",
  [],
  function() {
    "use strict";
    var ApplicationView = Ember.View.extend({
      classNames: ['app'],

      classNameBindings: [
        'inactive:app_state_inactive',
        'controller.inspectorExpanded:app_inspector_expanded',
        'controller.isDragging:app_state_dragging'
      ],

      inactive: Ember.computed.not('controller.active'),

      attributeBindings: ['tabindex'],
      tabindex: 1,

      focusIn: function() {
        if (!this.get('controller.active')) {
          this.set('controller.active', true);
        }
      },

      focusOut: function() {
        if (this.get('controller.active')) {
          this.set('controller.active', false);
        }
      },

      inspectorStyle: function() {
        if (this.get('controller.inspectorExpanded')) {
          return 'width: ' + this.get('controller.inspectorWidth') + 'px;';
        } else {
          return '';
        }
      }.property('controller.inspectorWidth', 'controller.inspectorExpanded')
    });


    return ApplicationView;
  });
define("views/mixin_stack",
  [],
  function() {
    "use strict";
    var MixinStackView = Ember.View.extend({
      classNames: ['object-inspector']
    });


    return MixinStackView;
  });
define("views/model_types",
  [],
  function() {
    "use strict";
    var ModelTypesView = Ember.View.extend({
      classNames: ['split'],
      classNameBindings: ['controller.collapsed:split_state_collapsed']
    });


    return ModelTypesView;
  });
define("views/property_field",
  [],
  function() {
    "use strict";
    var PropertyFieldView = Ember.TextField.extend({
      attributeBindings: ['label:data-label'],

      didInsertElement: function() {
        this._super();
        this.$().select();
      },


      insertNewline: function() {
        this.get('controller').send('saveProperty');
        this.set('controller.isEdit', false);
      },

      cancel: function() {
        this.set('controller.isEdit', false);
      },

      focusOut: function() {
        this.set('controller.isEdit', false);
      }

    });


    return PropertyFieldView;
  });
define("views/tree_node_controller",
  [],
  function() {
    "use strict";
    var TreeNodeControllerView = Ember.View.extend({
      tagName: 'span',
      classNames: [ 'view-tree__node-controller', 'tree__node-controller'],
      classNameBindings: 'isPinned',

      isPinned: function() {
        return this.get('node') === this.get('controller.pinnedNode');
      }.property('node', 'controller.pinnedNode'),

      mouseEnter: function() {
        this.get('controller').send('previewLayer', this.get('node'));
      },

      mouseLeave: function() {
        this.get('controller').send('hidePreview', this.get('node'));
      },

      click: function() {
        this.get('controller').send('showLayer', this.get('node'));
      }
    });


    return TreeNodeControllerView;
  });