if (typeof define !== 'function' && typeof requireModule !== 'function') {
  var define, requireModule;

  (function() {
    var registry = {}, seen = {};

    define = function(name, deps, callback) {
      registry[name] = { deps: deps, callback: callback };
    };

    requireModule = function(name) {
      if (seen[name]) { return seen[name]; }
      seen[name] = {};

      var mod = registry[name];

      if (!mod) {
        throw new Error("Module: '" + name + "' not found.");
      }

      var deps = mod.deps,
          callback = mod.callback,
          reified = [],
          exports;

      for (var i=0, l=deps.length; i<l; i++) {
        if (deps[i] === 'exports') {
          reified.push(exports = {});
        } else {
          reified.push(requireModule(deps[i]));
        }
      }

      var value = callback.apply(this, reified);
      return seen[name] = exports || value;
    };

    define.registry = registry;
    define.seen = seen;
  })();
}
/**
  This is a wrapper for `ember-debug.js`
  Wraps the script in a function,
  and ensures that the script is executed
  only after the dom is ready
  and the application has initialized.

  Also responsible for sending the first tree.
**/
(function() {

  function inject() {
    requireModule('ember_debug');
  }

  onReady(function() {
    // global to prevent injection
    if (window.NO_EMBER_DEBUG) {
      return;
    }
    // prevent from injecting twice
    if (!Ember.Debug) {
      inject();
    }
    Ember.Debug.start();
  });


  function onReady(callback) {
    if (document.readyState === 'complete') {
      onApplicationStart(callback);
    } else {
      document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        onApplicationStart(callback);
      }, false );
    }
  }

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (!Ember) {
      return;
    }
    var body = document.body;
    var interval = setInterval(function() {
      if (body.dataset.contentScriptLoaded && hasViews()) {
       clearInterval(interval);
       callback();
      }
    }, 10);
  }

  function hasViews() {
    var views = Ember.View.views;
    for(var i in views) {
      if (views.hasOwnProperty(i)) {
        return true;
      }
    }
    return false;
  }

}());

define("ember_debug",
  ["port","view_debug","object_inspector"],
  function(Port, ViewDebug, ObjectInspector) {
    "use strict";

    console.debug("Ember Debugger Active");

    var EmberDebug;

    EmberDebug = Ember.Namespace.create({

      application: null,
      started: false,

      Port: Port,

      start: function() {
        if (this.get('started')) {
          this.reset();
          return;
        }
        this.set('started', true);

        this.reset();

        this.set('application', getApplication());

      },

      reset: function() {
        this.set('port', this.Port.create());

        var objectInspector = this.get('objectInspector');
        if (objectInspector) {
          Ember.run(objectInspector, 'destroy');
        }
        this.set('objectInspector', ObjectInspector.create({ namespace: this }));

        var viewDebug = this.get('viewDebug');
        if (viewDebug) {
          Ember.run(viewDebug, 'destroy');
        }
        this.set('viewDebug', ViewDebug.create({ namespace: this }));

        this.viewDebug.sendTree();
      }

    });

    function getApplication() {
      var views = Ember.View.views;

      for (var i in views) {
        if (views.hasOwnProperty(i)) {
          return views[i].get('controller.namespace');
        }
      }
    }

    Ember.Debug = EmberDebug;


    return EmberDebug;
  });
define("mixins/port_mixin",
  [],
  function() {
    "use strict";
    var PortMixin = Ember.Mixin.create({
      port: null,
      messages: {},

      portNamespace: null,

      init: function() {
        this.setupPortListeners();
      },

      willDestroy: function() {
        this.removePortListeners();
      },

      sendMessage: function(name, message) {
        this.get('port').send(this.messageName(name), message);
      },

      setupPortListeners: function() {
        var port = this.get('port'),
            self = this,
            messages = this.get('messages');

        for (var name in messages) {
          if(messages.hasOwnProperty(name)) {
            port.on(this.messageName(name), this, messages[name]);
          }
        }
      },

      removePortListeners: function() {
        var port = this.get('port'),
            self = this,
            messages = this.get('messages');

        for (var name in messages) {
          if(messages.hasOwnProperty(name)) {
            port.off(this.messageName(name), this, messages[name]);
          }
        }
      },

      messageName: function(name) {
        var messageName = name;
        if (this.get('portNamespace')) {
          messageName = this.get('portNamespace') + ':' + messageName;
        }
        return messageName;
      }

    });


    return PortMixin;
  });
define("object_inspector",
  ["mixins/port_mixin"],
  function(PortMixin) {
    "use strict";

    var ObjectInspector = Ember.Object.extend(PortMixin, {
      namespace: null,

      port: Ember.computed.alias('namespace.port'),

      init: function() {
        this._super();
        this.set('sentObjects', {});
        this.set('boundObservers', {});
      },

      sentObjects: {},

      boundObservers: {},

      portNamespace: 'objectInspector',

      messages: {
        digDeeper: function(message) {
          this.digIntoObject(message.objectId, message.property);
        },
        releaseObject: function(message) {
          this.releaseObject(message.objectId);
        },
        calculate: function(message) {
          var value;
          value = this.valueForObjectProperty(message.objectId, message.property, message.mixinIndex);
          this.sendMessage('updateProperty', value);
          this.bindPropertyToDebugger(message);
        }
      },

      digIntoObject: function(objectId, property) {
        var parentObject = this.sentObjects[objectId],
          object = Ember.get(parentObject, property);

        if (object instanceof Ember.Object) {
          var details = this.mixinsForObject(object);

          this.sendMessage('updateObject', {
            parentObject: objectId,
            property: property,
            objectId: details.objectId,
            name: object.toString(),
            details: details.mixins
          });
        }
      },

      sendObject: function(object) {
        var details = this.mixinsForObject(object);
        this.sendMessage('updateObject', {
          objectId: details.objectId,
          name: object.toString(),
          details: details.mixins
        });
      },


      retainObject: function(object) {
        var meta = Ember.meta(object),
            guid = Ember.guidFor(object);

        meta._debugReferences = meta._debugReferences || 0;
        meta._debugReferences++;

        this.sentObjects[guid] = object;

        return guid;
      },

      releaseObject: function(objectId) {
        var object = this.sentObjects[objectId];

        var meta = Ember.meta(object),
            guid = Ember.guidFor(object);

        meta._debugReferences--;

        if (meta._debugReferences === 0) {
          this.dropObject(guid);
        }
      },

      dropObject: function(objectId) {
        var observers = this.boundObservers[objectId],
            object = this.sentObjects[objectId];

        if (observers) {
          observers.forEach(function(observer) {
            Ember.removeObserver(object, observer.property, observer.handler);
          });
        }

        delete this.boundObservers[objectId];
        delete this.sentObjects[objectId];
      },

      mixinsForObject: function(object) {
        var mixins = Ember.Mixin.mixins(object),
            mixinDetails = [];

        var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
        mixinDetails.push({ name: "Own Properties", properties: ownProps });

        mixins.forEach(function(mixin) {
          mixin.toString();
          var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
          mixinDetails.push({ name: name.toString(), properties: propertiesForMixin(mixin) });
        });

        applyMixinOverrides(mixinDetails);

        return { objectId: this.retainObject(object), mixins: mixinDetails };
      },

      valueForObjectProperty: function(objectId, property, mixinIndex) {
        var object = this.sentObjects[objectId], value;

        if (object.isDestroying) {
          value = '<DESTROYED>';
        } else {
          value = object.get(property);
        }

        return {
          objectId: objectId,
          property: property,
          value: inspect(value),
          mixinIndex: mixinIndex
        };
      },

      bindPropertyToDebugger: function(message) {
        var objectId = message.objectId,
            property = message.property,
            mixinIndex = message.mixinIndex,
            self = this;

        var object = this.sentObjects[objectId];

        function handler() {
          var value = Ember.get(object, property);

          self.sendMessage('updateProperty', {
            objectId: objectId,
            property: property,
            value: inspect(value),
            mixinIndex: mixinIndex
          });
        }

        Ember.addObserver(object, property, handler);
        this.boundObservers[objectId] = this.boundObservers[objectId] || [];
        this.boundObservers[objectId].push({ property: property, handler: handler });
      }
    });


    function propertiesForMixin(mixin) {
      var seen = {}, properties = [];

      mixin.mixins.forEach(function(mixin) {
        if (mixin.properties) {
          addProperties(properties, mixin.properties);
        }
      });

      return properties;
    }

    function addProperties(properties, hash) {
      for (var prop in hash) {
        if (!hash.hasOwnProperty(prop)) { continue; }
        if (prop.charAt(0) === '_') { continue; }
        if (isMandatorySetter(hash, prop)) { continue; }

        replaceProperty(properties, prop, hash[prop]);
      }
    }

    function applyMixinOverrides(mixinDetails) {
      var seen = {};

      mixinDetails.forEach(function(detail) {
        detail.properties.forEach(function(property) {
          if (Object.prototype.hasOwnProperty(property.name)) { return; }

          if (seen[property.name]) {
            property.overridden = seen[property.name];
            delete property.value.computed;
          }

          seen[property.name] = detail.name;
        });
      });
    }


    function isMandatorySetter(object, prop) {
      var descriptor = Object.getOwnPropertyDescriptor(object, prop);
      if (descriptor.set && descriptor.set === Ember.MANDATORY_SETTER_FUNCTION) {
        return true;
      }
    }


    function replaceProperty(properties, name, value) {
      var found, type;

      for (var i=0, l=properties.length; i<l; i++) {
        if (properties[i].name === name) {
          found = i;
          break;
        }
      }

      if (found) { properties.splice(i, 1); }

      if (name) {
        type = name.PrototypeMixin ? 'ember-class' : 'ember-mixin';
      }

      properties.push({ name: name, value: inspectValue(value) });
    }



    function inspectValue(value) {
      var string;

      if (value instanceof Ember.Object) {
        return { type: "type-ember-object", inspect: value.toString() };
      } else if (value instanceof Ember.ComputedProperty) {
        string = "<computed>";
        return { type: "type-descriptor", inspect: string, computed: true };
      } else if (value instanceof Ember.Descriptor) {
        return { type: "type-descriptor", inspect: value.toString(), computed: true };
      } else {
        return { type: "type-" + Ember.typeOf(value), inspect: inspect(value) };
      }
    }



    function inspect(value) {
      if (typeof value === 'function') {
        return "function() { ... }";
      } else if (value instanceof Ember.Object) {
        return value.toString();
      } else if (Ember.typeOf(value) === 'array') {
        if (value.length === 0) { return '[]'; }
        else if (value.length === 1) { return '[ ' + inspect(value[0]) + ' ]'; }
        else { return '[ ' + inspect(value[0]) + ', ... ]'; }
      } else {
        return Ember.inspect(value);
      }
    }

    // Not used
    function inspectController(controller) {
      return controller.get('_debugContainerKey') || controller.toString();
    }



    return ObjectInspector;
  });
define("port",
  [],
  function() {
    "use strict";
    var Port = Ember.Object.extend(Ember.Evented, {
      init: function() {
        connect.apply(this);
      },
      send: function(messageType, options) {
        options.type = messageType;
        options.from = 'inspectedWindow';
        this.get('chromePort').postMessage(options);
      },
      chromePort: null
    });


    var connect = function() {
      var channel = new MessageChannel(), self = this;
      var chromePort = channel.port1;
      this.set('chromePort', chromePort);
      window.postMessage('debugger-client', [channel.port2], '*');

      chromePort.addEventListener('message', function(event) {
        var message = event.data, value;
        self.trigger(message.type, message);
      });

      chromePort.start();
    };


    return Port;
  });
define("view_debug",
  ["mixins/port_mixin"],
  function(PortMixin) {
    "use strict";

    var layerDiv,
        previewDiv,
        highlightedElement,
        previewedElement;

    var ViewDebug = Ember.Object.extend(PortMixin, {

      namespace: null,

      port: Ember.computed.alias('namespace.port'),

      objectInspector: Ember.computed.alias('namespace.objectInspector'),

      init: function() {
        this._super();
        var self = this;

        this.viewListener();

        layerDiv = Ember.$('<div>').appendTo('body').get(0);
        layerDiv.style.display = 'none';
        layerDiv.setAttribute('data-label', 'layer-div');

        previewDiv = Ember.$('<div>').appendTo('body').get(0);
        previewDiv.style.display = 'none';
        previewDiv.setAttribute('data-label', 'preview-div');

        Ember.$(window).on('resize.' + this.get('eventNamespace'), function() {
          if (highlightedElement) {
            self.highlightView(highlightedElement);
          }
        });

      },

      eventNamespace: Ember.computed(function() {
        return 'view_debug_' + Ember.guidFor(this);
      }),

      willDestroy: function() {
        this._super();
        Ember.$(window).off(this.get('eventNamespace'));
        Ember.$(layerDiv).remove();
        Ember.$(previewDiv).remove();
        Ember.View.removeMutationListener(this.viewTreeChanged);
      },

      portNamespace: 'view',

      messages: {
        getTree: function() {
          this.sendTree();
        },
        hideLayer: function() {
          this.hideLayer();
        },
        showLayer: function(message) {
          this.showLayer(message.objectId);
        },
        previewLayer: function(message) {
          this.previewLayer(message.objectId);
        },
        hidePreview: function(message) {
          this.hidePreview(message.objectId);
        }
      },

      sendTree: function() {
        var tree = this.viewTree();
        if (tree) {
          this.sendMessage('viewTree', {
            tree: tree
          });
        }
      },

      viewListener: function() {
        var self = this;

        this.viewTreeChanged = function() {
          Em.run.schedule('afterRender', function() {
            self.sendTree();
            self.hideLayer();
          });
        };
        Ember.View.addMutationListener(this.viewTreeChanged);
      },

      viewTree: function() {
         var rootView = Ember.View.views[Ember.$('.ember-application > .ember-view').attr('id')];
          // In case of App.reset view is destroyed
          if (!rootView) {
            return false;
          }
          var retained = [];

          var children = [];
          var treeId = this.get('objectInspector').retainObject(retained);

          var tree = { value: this.inspectView(rootView, retained), children: children, treeId: treeId };

          this.appendChildren(rootView, children, retained);


          return tree;
      },

      inspectView: function(view, retained) {
        var templateName = view.get('templateName') || view.get('_debugTemplateName'),
            viewClass = view.constructor.toString(), match, name;

        if (viewClass.match(/\._/)) {
          viewClass = "virtual";
        } else if (match = viewClass.match(/\(subclass of (.*)\)/)) {
          viewClass = match[1];
        }

        var tagName = view.get('tagName');
        if (tagName === '') {
          tagName = '(virtual)';
        }

        tagName = tagName || 'div';

        if (templateName) {
          name = templateName;
        } else {
          var controller = view.get('controller'),
              key = controller.get('_debugContainerKey'),
              className = controller.constructor.toString();

          if (key) {
            name = key.split(':')[1];
          } else {
            if (className.charAt(0) === '(') {
              className = className.match(/^\(subclass of (.*)\)/)[1];
            }
            name = className.split('.')[1];
            name = name.charAt(0).toLowerCase() + name.substr(1);
          }
        }

        var viewId = this.get('objectInspector').retainObject(view);
        retained.push(viewId);

        return { viewClass: viewClass, objectId: viewId, name: name, template: templateName || '(inline)', tagName: tagName, controller: controllerName(view.get('controller')) };
      },

      appendChildren: function(view, children, retained) {
        var self = this;
        var childViews = view.get('_childViews'),
            controller = view.get('controller');

        childViews.forEach(function(childView) {
          if (!(childView instanceof Ember.Object)) { return; }

          if (childView.get('controller') !== controller) {
            var grandChildren = [];
            children.push({ value: self.inspectView(childView, retained), children: grandChildren });
            self.appendChildren(childView, grandChildren, retained);
          } else {
            self.appendChildren(childView, children, retained);
          }
        });
      },

      highlightView: function(element, preview) {
        var self = this;
        var range, view, rect, div;

        if (preview) {
          previewedElement = element;
          div = previewDiv;
        } else {
          highlightedElement = element;
          div = layerDiv;
          this.hidePreview();
        }

        if (element instanceof Ember.View && element.get('isVirtual')) {
          view = element;
          if (view.get('isVirtual')) {
            range = virtualRange(view);
            rect = range.getBoundingClientRect();
          }
        } else if (element instanceof Ember.View) {
          view = element;
          rect = view.get('element').getBoundingClientRect();
        } else {
          view = Ember.View.views[element.id];
          rect = element.getBoundingClientRect();
        }

        var templateName = view.get('templateName') || view.get('_debugTemplateName'),
            controller = view.get('controller'),
            model = controller && controller.get('model');

        Ember.$(div).css(rect);
        Ember.$(div).css({
          display: "block",
          position: "absolute",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          border: "2px solid rgb(102, 102, 102)",
          padding: "0",
          boxSizing: "border-box",
          color: "rgb(51, 51, 255)",
          fontFamily: "Menlo, sans-serif",
          minHeight: 63,
          zIndex: 10000
        });

        var output = "";

        if (!preview) {
          output = "<span class='close' data-label='layer-close'>x</span>";
        }

        if (templateName) {
          output += "<p class='template'><span>template</span>=<span data-label='layer-template'>" + escapeHTML(templateName) + "</span></p>";
        }

        output += "<p class='controller'><span>controller</span>=<span data-label='layer-controller'>" + escapeHTML(controllerName(controller)) + "</span></p>";

        if (model) {
          output += "<p class='model'><span>model</span>=<span data-label='layer-model'>" + escapeHTML(model.toString()) + "</span></p>";
        }

        Ember.$(div).html(output);

        Ember.$('p', div).css({ float: 'left', margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
        Ember.$('p.model', div).css({ clear: 'left' });
        Ember.$('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
        Ember.$('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });

        if (!preview) {
          Ember.$('span.close', div).css({
            float: 'right',
            margin: '5px',
            background: '#666',
            color: '#eee',
            fontFamily: 'Menlo',
            fontSize: '12px',
            width: 13,
            height: 13,
            lineHeight: '12px',
            borderRadius: 12,
            textAlign: 'center',
            fontWeight: 'bold',
            cursor: 'pointer'
          }).on('click', function() {
            self.hideLayer();
          });
        }

        Ember.$('p.controller span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.get('objectInspector').sendObject(controller);
        });

        Ember.$('p.model span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.get('objectInspector').sendObject(controller.get('model'));
        });
      },

      showLayer: function(objectId) {
        this.highlightView(this.get('objectInspector').sentObjects[objectId]);
      },

      previewLayer: function(objectId) {
        this.highlightView(this.get('objectInspector').sentObjects[objectId], true);
      },

      hideLayer: function() {
        layerDiv.style.display = 'none';
        highlightedElement = null;
      },

      hidePreview: function() {
        previewDiv.style.display = 'none';
        previewedElement = null;
      }
    });


    function controllerName(controller) {
      var key = controller.get('_debugContainerKey'),
          className = controller.constructor.toString(),
          name;

      if (key) {
        name = key.split(':')[1];
      } else {
        if (className.charAt(0) === '(') {
          className = className.match(/^\(subclass of (.*)\)/)[1];
        }
        name = className.split('.')[1];
        name = name.charAt(0).toLowerCase() + name.substr(1);
      }

      return name;
    }

    function escapeHTML(string) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(string));
      return div.innerHTML;
    }

    function virtualRange(view) {
      var morph = view.get('morph'),
          startId = morph.start,
          endId = morph.end;

      var range = document.createRange();
      range.setStartAfter(Ember.$('#' + startId)[0]);
      range.setEndBefore(Ember.$('#' + endId)[0]);

      return range;
    }



    return ViewDebug;
  });