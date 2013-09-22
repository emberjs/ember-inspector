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
      setTimeout(completed);
    } else {
      document.addEventListener( "DOMContentLoaded", completed, false);
      // For some reason DOMContentLoaded doesn't always work
      window.addEventListener( "load", completed, false );
    }

    function completed() {
      document.removeEventListener( "DOMContentLoaded", completed, false );
      window.removeEventListener( "load", completed, false );
      onApplicationStart(callback);
    }
  }

  // There's probably a better way
  // to determine when the application starts
  // but this definitely works
  function onApplicationStart(callback) {
    if (typeof Ember === 'undefined') {
      return;
    }
    var body = document.body;
    var interval = setInterval(function() {
      if (body.dataset.emberExtension && Ember.BOOTED) {
       clearInterval(interval);
       callback();
      }
    }, 10);
  }

}());

define("data_debug",
  ["mixins/port_mixin"],
  function(PortMixin) {
    "use strict";

    var DataDebug = Ember.Object.extend(PortMixin, {
      init: function() {
        this._super();
        this.sentTypes = {};
        this.sentRecords = {};
      },

      sentTypes: {},
      sentRecords: {},

      releaseTypesMethod: null,
      releaseRecordsMethod: null,

      adapter: Ember.computed(function() {
        return this.get('application').__container__.lookup('dataAdapter:main');
      }).property('application'),

      namespace: null,

      port: Ember.computed.alias('namespace.port'),
      application: Ember.computed.alias('namespace.application'),
      objectInspector: Ember.computed.alias('namespace.objectInspector'),

      portNamespace: 'data',

      modelTypesAdded: function(types) {
        var self = this, typesToSend;
        typesToSend = types.map(function(type) {
          return self.wrapType(type);
        });
        this.sendMessage('modelTypesAdded', {
          modelTypes: typesToSend
        });
      },

      modelTypesUpdated: function(types) {
        var self = this;
        var typesToSend = types.map(function(type) {
          return self.wrapType(type);
        });
        self.sendMessage('modelTypesUpdated', {
          modelTypes: typesToSend
        });
      },

      wrapType: function(type) {
        var objectId = Ember.guidFor(type.object);
        this.sentTypes[objectId] = type;

        return {
          columns: type.columns,
          count: type.count,
          name: type.name,
          objectId: objectId
        };
      },


      recordsAdded: function(recordsReceived) {
        var self = this, records;
        records = recordsReceived.map(function(record) {
          return self.wrapRecord(record);
        });
        self.sendMessage('recordsAdded', {
          records: records
        });
      },

      recordsUpdated: function(recordsReceived) {
        var self = this;
        var records = recordsReceived.map(function(record) {
          return self.wrapRecord(record);
        });
        self.sendMessage('recordsUpdated', {
          records: records
        });
      },

      recordsRemoved: function(idx, count) {
        this.sendMessage('recordsRemoved', {
          index: idx,
          count: count
        });
      },

      wrapRecord: function(record) {
        var objectId = Ember.guidFor(record.object);
        this.sentRecords[objectId] = record;
        return {
          columnValues: record.columnValues,
          searchKeywords: record.searchKeywords,
          filterValues: record.filterValues,
          color: record.color,
          objectId: objectId
        };
      },

      releaseTypes: function() {
        if(this.releaseTypesMethod) {
          this.releaseTypesMethod();
          this.releaseTypesMethod = null;
          this.sentTypes = {};
        }
      },

      releaseRecords: function(typeObjectId) {
        if (this.releaseRecordsMethod) {
          this.releaseRecordsMethod();
          this.releaseRecordsMethod = null;
          this.sentRecords = {};
        }
      },

      willDestroy: function() {
        this._super();
        this.releaseRecords();
        this.releaseTypes();
      },

      messages: {
        checkAdapter: function() {
          this.sendMessage('hasAdapter', { hasAdapter: !!this.get('adapter') });
        },

        getModelTypes: function() {
          var self = this;
          this.releaseTypes();
          this.releaseTypesMethod = this.get('adapter').watchModelTypes(
            function(types) {
              self.modelTypesAdded(types);
            }, function(types) {
            self.modelTypesUpdated(types);
          });
        },

        releaseModelTypes: function() {
          this.releaseTypes();
        },

        getRecords: function(message) {
          var type = this.sentTypes[message.objectId], self = this;
          this.releaseRecords();

          var releaseMethod = this.get('adapter').watchRecords(type.object,
            function(recordsReceived) {
              self.recordsAdded(recordsReceived);
            },
            function(recordsUpdated) {
              self.recordsUpdated(recordsUpdated);
            },
            function() {
              self.recordsRemoved.apply(self, arguments);
            }
          );
          this.releaseRecordsMethod = releaseMethod;
        },

        releaseRecords: function() {
          this.releaseRecords();
        },

        inspectModel: function(message) {
          this.get('objectInspector').sendObject(this.sentRecords[message.objectId].object);
        },

        getFilters: function() {
          this.sendMessage('filters', {
            filters: this.get('adapter').getFilters()
          });
        }
      }
    });


    return DataDebug;
  });
define("ember_debug",
  ["port","object_inspector","general_debug","view_debug","route_debug","data_debug"],
  function(Port, ObjectInspector, GeneralDebug, ViewDebug, RouteDebug, DataDebug) {
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

        this.set('application', getApplication());

        this.reset();

      },

      destroyContainer: function() {
        var self = this;
        ['dataDebug', 'viewDebug', 'routeDebug', 'objectInspector', 'generalDebug'].forEach(function(prop) {
          var handler = self.get(prop);
          if (handler) {
            Ember.run(handler, 'destroy');
            self.set(prop, null);
          }
        });
      },

      startModule: function(prop, Module) {
        this.set(prop, Module.create({ namespace: this }));
      },

      reset: function() {
        this.destroyContainer();
        Ember.run(this, function() {

          this.startModule('port', this.Port);

          this.startModule('generalDebug', GeneralDebug);
          this.startModule('objectInspector', ObjectInspector);
          this.startModule('routeDebug', RouteDebug);
          this.startModule('viewDebug', ViewDebug);
          this.startModule('dataDebug', DataDebug);

          this.generalDebug.sendBooted();
          this.viewDebug.sendTree();

        });
      }

    });

    function getApplication() {
      var namespaces = Ember.Namespace.NAMESPACES,
          application;

      namespaces.forEach(function(namespace) {
        if(namespace instanceof Ember.Application) {
          application = namespace;
          return false;
        }
      });
      return application;
    }

    Ember.Debug = EmberDebug;


    return EmberDebug;
  });
define("general_debug",
  ["mixins/port_mixin"],
  function(PortMixin) {
    "use strict";

    var GeneralDebug = Ember.Object.extend(PortMixin, {
      namespace: null,

      port: Ember.computed.alias('namespace.port'),

      application: Ember.computed.alias('namespace.application'),

      portNamespace: 'general',

      sendBooted: function() {
        this.sendMessage('applicationBooted', {
          booted: Ember.BOOTED
        });
      },

      messages: {
        applicationBooted: function() {
          this.sendBooted();
        }
      }
    });


    return GeneralDebug;
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

      application: Ember.computed.alias('namespace.application'),

      init: function() {
        this._super();
        this.set('sentObjects', {});
        this.set('boundObservers', {});
      },

      willDestroy: function() {
        this._super();
        for (var objectId in this.sentObjects) {
          this.releaseObject(objectId);
        }
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
          message.computed = true;
          this.bindPropertyToDebugger(message);
        },
        saveProperty: function(message) {
          this.saveProperty(message.objectId, message.mixinIndex, message.property, message.value);
        },
        sendToConsole: function(message) {
          this.sendToConsole(message.objectId, message.property);
        },
        inspectRoute: function(message) {
          var container = this.get('application.__container__');
          this.sendObject(container.lookup('router:main').router.getHandler(message.name));
        },
        inspectController: function(message) {
          var container = this.get('application.__container__');
          this.sendObject(container.lookup('controller:' + message.name));
        },
        inspectById: function(message) {
          var obj = this.sentObjects[message.objectId];
          this.sendObject(obj);
        }
      },

      saveProperty: function(objectId, mixinIndex, prop, val) {
        var object = this.sentObjects[objectId];
        Ember.set(object, prop, val);
      },

      sendToConsole: function(objectId, prop) {
        var object = this.sentObjects[objectId];
        var value;

        if (Ember.isNone(prop)) {
          value = this.sentObjects[objectId];
        } else {
          value =  Ember.get(object, prop);
        }

        window.$E = value;
        console.log('Ember Inspector ($E): ', value);
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
            guid = Ember.guidFor(object),
            self = this;

        meta._debugReferences = meta._debugReferences || 0;
        meta._debugReferences++;

        this.sentObjects[guid] = object;

        if (meta._debugReferences === 1 && object.reopen) {
          // drop object on destruction
          var _oldWillDestroy = object._oldWillDestroy = object.willDestroy;
          object.reopen({
            willDestroy: function() {
              self.dropObject(guid);
              return _oldWillDestroy.apply(this, arguments);
            }
          });
        }

        return guid;
      },

      releaseObject: function(objectId) {
        var object = this.sentObjects[objectId];
        if(!object) {
          return;
        }
        var meta = Ember.meta(object),
            guid = Ember.guidFor(object);

        meta._debugReferences--;

        if (meta._debugReferences === 0) {
          this.dropObject(guid);
        }

      },

      dropObject: function(objectId) {
        var object = this.sentObjects[objectId];

        if (object.reopen) {
          object.reopen({ willDestroy: object._oldWillDestroy });
          delete object._oldWillDestroy;
        }

        this.removeObservers(objectId);
        delete this.sentObjects[objectId];

        this.sendMessage('droppedObject', { objectId: objectId });
      },

      removeObservers: function(objectId) {
        var observers = this.boundObservers[objectId],
            object = this.sentObjects[objectId];

        if (observers) {
          observers.forEach(function(observer) {
            Ember.removeObserver(object, observer.property, observer.handler);
          });
        }

        delete this.boundObservers[objectId];
      },

      mixinsForObject: function(object) {
        var mixins = Ember.Mixin.mixins(object),
            mixinDetails = [],
            self = this;

        var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
        mixinDetails.push({ name: "Own Properties", properties: ownProps, expand: true });

        mixins.forEach(function(mixin) {
          var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
          mixinDetails.push({ name: name.toString(), properties: propertiesForMixin(mixin) });
        });

        fixMandatorySetters(mixinDetails);
        applyMixinOverrides(mixinDetails);

        var propertyInfo = null;
        var debugInfo = getDebugInfo(object);
        if (debugInfo) {
          propertyInfo = getDebugInfo(object).propertyInfo;
          mixinDetails = customizeProperties(mixinDetails, propertyInfo);
        }

        var expensiveProperties = null;
        if (propertyInfo) {
          expensiveProperties = propertyInfo.expensiveProperties;
        }
        calculateCPs(object, mixinDetails, expensiveProperties);

        var objectId = this.retainObject(object);

        this.bindProperties(objectId, mixinDetails);

        return { objectId: objectId, mixins: mixinDetails };
      },

      valueForObjectProperty: function(objectId, property, mixinIndex) {
        var object = this.sentObjects[objectId], value;

        if (object.isDestroying) {
          value = '<DESTROYED>';
        } else {
          value = object.get(property);
        }

        value = inspectValue(value);
        value.computed = true;

        return {
          objectId: objectId,
          property: property,
          value: value,
          mixinIndex: mixinIndex
        };
      },

      bindPropertyToDebugger: function(message) {
        var objectId = message.objectId,
            property = message.property,
            mixinIndex = message.mixinIndex,
            computed = message.computed,
            self = this;

        var object = this.sentObjects[objectId];

        function handler() {
          var value = Ember.get(object, property);
          value = inspectValue(value);
          value.computed = computed;

          self.sendMessage('updateProperty', {
            objectId: objectId,
            property: property,
            value: value,
            mixinIndex: mixinIndex
          });
        }

        Ember.addObserver(object, property, handler);
        this.boundObservers[objectId] = this.boundObservers[objectId] || [];
        this.boundObservers[objectId].push({ property: property, handler: handler });

      },

      bindProperties: function(objectId, mixinDetails) {
        var self = this;
        mixinDetails.forEach(function(mixin, mixinIndex) {
          mixin.properties.forEach(function(item) {
            if (item.overridden) {
              return true;
            }
            if (item.value.type !== 'type-descriptor' && item.value.type !== 'type-function') {
              var computed = !!item.value.computed;
              self.bindPropertyToDebugger({
                objectId: objectId,
                property: item.name,
                mixinIndex: mixinIndex,
                computed: computed
              });
            }
          });
        });
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
        // when mandatory setter is removed, an `undefined` value may be set
        if (hash[prop] === undefined) { continue; }
        var options = { isMandatorySetter: isMandatorySetter(hash, prop) };
        if (isComputed(hash[prop])) {
          options.readOnly = hash[prop]._readOnly;
        }
        replaceProperty(properties, prop, hash[prop], options);
      }
    }

    function replaceProperty(properties, name, value, options) {
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
      var prop = { name: name, value: inspectValue(value) };
      prop.isMandatorySetter = options.isMandatorySetter;
      prop.readOnly = options.readOnly;
      properties.push(prop);
    }

    function fixMandatorySetters(mixinDetails) {
      var seen = {};
      var propertiesToRemove = [];

      mixinDetails.forEach(function(detail, detailIdx) {
        detail.properties.forEach(function(property, propertyIdx) {
          if(property.isMandatorySetter) {
            seen[property.name] = {
              name: property.name,
              value: property.value.inspect,
              detailIdx: detailIdx,
              property: property
            };
          } else if(seen.hasOwnProperty(property.name) && seen[property.name] === property.value.inspect) {
            propertiesToRemove.push(seen[property.name]);
            delete seen[property.name];
          }
        });
      });

      propertiesToRemove.forEach(function(prop) {
        var detail = mixinDetails[prop.detailIdx];
        var index = detail.properties.indexOf(prop.property);
        if (index !== -1) {
          detail.properties.splice(index, 1);
        }
      });

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
      return false;
    }

    function inspectValue(value) {
      var string;

      if (value instanceof Ember.Object) {
        return { type: "type-ember-object", inspect: value.toString() };
      } else if (isComputed(value)) {
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

    function calculateCPs(object, mixinDetails, expensiveProperties) {
      expensiveProperties = expensiveProperties || [];

      mixinDetails.forEach(function(mixin) {
        mixin.properties.forEach(function(item) {
          if (item.overridden) {
            return true;
          }
          if (item.value.computed) {
            var cache = Ember.cacheFor(object, item.name);
            if (cache !== undefined || expensiveProperties.indexOf(item.name) === -1) {
              item.value = inspectValue(Ember.get(object, item.name));
              item.value.computed = true;
            }
          }
        });
      });
    }

    /**
      Customizes an object's properties
      based on the property `propertyInfo` of
      the object's `_debugInfo` method.

      Possible options:
        - `groups` An array of groups that contains the properties for each group
          For example:
          ```javascript
          groups: [
            { name: 'Attributes', properties: ['firstName', 'lastName'] },
            { name: 'Belongs To', properties: ['country'] }
          ]
          ```
        - `includeOtherProperties` Boolean,
          - `true` to include other non-listed properties,
          - `false` to only include given properties
        - `skipProperties` Array containing list of properties *not* to include
        - `skipMixins` Array containing list of mixins *not* to include
        - `expensiveProperties` An array of computed properties that are too expensive.
           Adding a property to this array makes sure the CP is not calculated automatically.

      Example:
      ```javascript
      {
        propertyInfo: {
          includeOtherProperties: true,
          skipProperties: ['toString', 'send', 'withTransaction'],
          skipMixins: [ 'Ember.Evented'],
          calculate: ['firstName', 'lastName'],
          groups: [
            {
              name: 'Attributes',
              properties: [ 'id', 'firstName', 'lastName' ],
              expand: true // open by default
            },
            {
              name: 'Belongs To',
              properties: [ 'maritalStatus', 'avatar' ],
              expand: true
            },
            {
              name: 'Has Many',
              properties: [ 'phoneNumbers' ],
              expand: true
            },
            {
              name: 'Flags',
              properties: ['isLoaded', 'isLoading', 'isNew', 'isDirty']
            }
          ]
        }
      }
      ```
    */
    function customizeProperties(mixinDetails, propertyInfo) {
      var newMixinDetails = [],
          neededProperties = {},
          groups = propertyInfo.groups || [],
          skipProperties = propertyInfo.skipProperties || [],
          skipMixins = propertyInfo.skipMixins || [];

      if(groups.length) {
        mixinDetails[0].expand = false;
      }

      groups.forEach(function(group) {
        group.properties.forEach(function(prop) {
          neededProperties[prop] = true;
        });
      });

      mixinDetails.forEach(function(mixin) {
        var newProperties = [];
        mixin.properties.forEach(function(item) {
          if (skipProperties.indexOf(item.name) !== -1) {
            return true;
          }
          if (!item.overridden && neededProperties.hasOwnProperty(item.name) && neededProperties[item.name]) {
            neededProperties[item.name] = item;
          } else {
            newProperties.push(item);
          }
        });
        mixin.properties = newProperties;
        if (skipMixins.indexOf(mixin.name) === -1) {
          newMixinDetails.push(mixin);
        }
      });

      groups.slice().reverse().forEach(function(group) {
        var newMixin = { name: group.name, expand: group.expand, properties: [] };
        group.properties.forEach(function(prop) {
          newMixin.properties.push(neededProperties[prop]);
        });
        newMixinDetails.unshift(newMixin);
      });

      return newMixinDetails;
    }


    function getDebugInfo(object) {
      var debugInfo = null;
      if (object._debugInfo && typeof object._debugInfo === 'function') {
        debugInfo = object._debugInfo();
      }
      debugInfo = debugInfo || {};
      var propertyInfo = debugInfo.propertyInfo || (debugInfo.propertyInfo = {});
      var skipProperties = propertyInfo.skipProperties = propertyInfo.skipProperties || (propertyInfo.skipProperties = []);
      skipProperties.push('isDestroyed', 'isDestroying');
      // Views have un-observable private properties.
      // These should be excluded
      if (object instanceof Ember.View) {
        skipProperties.push('currentState', 'state');
      }

      return debugInfo;
    }

    function isComputed(value) {
      return value instanceof Ember.ComputedProperty;
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
        Ember.run(function() {
          self.trigger(message.type, message);
        });
      });

      chromePort.start();
    };


    return Port;
  });
define("route_debug",
  ["mixins/port_mixin"],
  function(PortMixin) {
    "use strict";

    var classify = Ember.String.classify;

    var RouteDebug = Ember.Object.extend(PortMixin, {
      namespace: null,
      port: Ember.computed.alias('namespace.port'),

      application: Ember.computed.alias('namespace.application'),

      router: Ember.computed(function() {
        return this.get('application.__container__').lookup('router:main');
      }).property('application'),

      applicationController: Ember.computed(function() {
        var container = this.get('application.__container__');
        return container.lookup('controller:application');
      }).property('application'),

      currentPath: Ember.computed.alias('applicationController.currentPath'),

      portNamespace: 'route',

      messages: {
        getTree: function() {
          this.sendTree();
        },
        getCurrentRoute: function() {
          this.sendCurrentRoute();
        }
      },

      sendCurrentRoute: Ember.observer(function() {
        this.sendMessage('currentRoute', { name: this.get('currentPath') });
      }, 'currentPath'),

      routeTree: Ember.computed(function() {
        var routeNames = this.get('router.router.recognizer.names');
        var routeTree = {};

        for(var routeName in routeNames) {
          if (!routeNames.hasOwnProperty(routeName)) {
            continue;
          }
          var route = routeNames[routeName];
          var handlers = Ember.A(route.handlers);
          buildSubTree.call(this, routeTree, route);
        }

        return arrayizeChildren({  children: routeTree }).children[0];
      }).property('router'),

      sendTree: function() {
        var routeTree = this.get('routeTree');
        this.sendMessage('routeTree', { tree: routeTree });
      }
    });


    var buildSubTree = function(routeTree, route) {
      var handlers = route.handlers;
      var subTree = routeTree, item,
          routeClassName, routeHandler, controllerName,
          controllerClassName, container, templateName,
          controller;
      for (var i = 0; i < handlers.length; i++) {
        item = handlers[i];
        var handler = item.handler;
        if (subTree[handler] === undefined) {
          routeClassName = classify(handler.replace('.', '_')) + 'Route';
          container = this.get('application.__container__');
          routeHandler = container.lookup('router:main').router.getHandler(handler);
          controllerName = routeHandler.get('controllerName') || routeHandler.get('routeName');
          controllerClassName = classify(controllerName.replace('.', '_')) + 'Controller';
          controller = container.lookup('controller:' + controllerName);
          templateName = handler.replace('.', '/');

          subTree[handler] = {
            value: {
              name: handler,
              routeHandler: {
                className: routeClassName,
                name: handler
              },
              controller: {
                className: controllerClassName,
                name: controllerName,
                exists: controller ? true : false
              },
              template: {
                name: templateName
              }
            }
          };

          if (i === handlers.length - 1) {
            // it is a route, get url
            subTree[handler].value.url = getURL(route.segments);
            subTree[handler].value.type = 'route';
          } else {
            // it is a resource, set children object
            subTree[handler].children = {};
            subTree[handler].value.type = 'resource';
          }

        }
        subTree = subTree[handler].children;
      }
    };

    function arrayizeChildren(routeTree) {
      var obj = { value: routeTree.value };

      if (routeTree.children) {
        var childrenArray = [];
        for(var i in routeTree.children) {
          var route = routeTree.children[i];
          childrenArray.push(arrayizeChildren(route));
        }
        obj.children = childrenArray;
      }

      return obj;
    }

    function getURL(segments) {
      var url = [];
      for (var i = 0; i < segments.length; i++) {
        var name = null;

        try {
          name = segments[i].generate();
        } catch (e) {
          // is dynamic
          name = ':' + segments[i].name;
        }
        if (name) {
          url.push(name);
        }
      }

      url = '/' + url.join('/');

      return url;
    }


    return RouteDebug;
  });
define("view_debug",
  ["mixins/port_mixin"],
  function(PortMixin) {
    "use strict";

    var layerDiv,
        previewDiv,
        highlightedElement,
        previewedElement,
        $ = Ember.$;

    var ViewDebug = Ember.Object.extend(PortMixin, {

      namespace: null,

      port: Ember.computed.alias('namespace.port'),

      objectInspector: Ember.computed.alias('namespace.objectInspector'),

      retainedObjects: [],

      options: {},

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
        },
        inspectViews: function(message) {
          if (message.inspect) {
            this.startInspecting();
          } else {
            this.stopInspecting();
          }
        },
        inspectElement: function(message) {
          this.inspectElement(message.objectId);
        },
        setOptions: function(message) {
          this.set('options', message.options);
          this.sendTree();
        }
      },

      init: function() {
        this._super();
        var self = this;

        this.viewListener();
        this.retainedObjects = [];
        this.options = {};

        layerDiv = $('<div>').appendTo('body').get(0);
        layerDiv.style.display = 'none';
        layerDiv.setAttribute('data-label', 'layer-div');

        previewDiv = $('<div>').appendTo('body').css('pointer-events', 'none').get(0);
        previewDiv.style.display = 'none';
        previewDiv.setAttribute('data-label', 'preview-div');

        $(window).on('resize.' + this.get('eventNamespace'), function() {
          if (highlightedElement) {
            self.highlightView(highlightedElement);
          }
        });
      },

      retainObject: function(object) {
        this.retainedObjects.push(object);
        return this.get('objectInspector').retainObject(object);
      },

      releaseCurrentObjects: function() {
        var self = this;
        this.retainedObjects.forEach(function(item) {
          self.get('objectInspector').releaseObject(Ember.guidFor(item));
        });
        this.retainedObjects = [];
      },

      eventNamespace: Ember.computed(function() {
        return 'view_debug_' + Ember.guidFor(this);
      }),

      willDestroy: function() {
        this._super();
        $(window).off(this.get('eventNamespace'));
        $(layerDiv).remove();
        $(previewDiv).remove();
        Ember.View.removeMutationListener(this.viewTreeChanged);
        this.releaseCurrentObjects();
        this.stopInspecting();
      },

      inspectElement: function(objectId) {
        var view = this.get('objectInspector').sentObjects[objectId];
        if (view && view.get('element')) {
          inspect(view.get('element'));
        }
      },

      sendTree: function() {
        Ember.run.scheduleOnce('afterRender', this, this.scheduledSendTree);
      },

      startInspecting: function() {
        var self = this, viewElem = null;
        this.sendMessage('startInspecting', {});

        // we don't want the preview div to intercept the mousemove event
        $(previewDiv).css('pointer-events', 'none');

        $('body').on('mousemove.inspect-' + this.get('eventNamespace'), function(e) {
          var originalTarget = $(e.target), oldViewElem = viewElem;
          viewElem = self.findNearestView(originalTarget);
          if (viewElem) {
            self.highlightView(viewElem, true);
          }
        })
        .on('mousedown.inspect-' + this.get('eventNamespace'), function() {
          // prevent app-defined clicks from being fired
          $(previewDiv).css('pointer-events', '')
          .one('mouseup', function() {
            if (viewElem) {
              self.highlightView(viewElem);
              var view = self.get('objectInspector').sentObjects[viewElem.id];
              if (view instanceof Ember.Component) {
                self.get('objectInspector').sendObject(view);
              }
            }
            self.stopInspecting();
            return false;
          });
        })
        .css('cursor', '-webkit-zoom-in');
      },

      findNearestView: function(elem) {
        var viewElem, view;
        if (!elem || elem.length === 0) { return null; }
        if (elem.hasClass('ember-view')) {
          viewElem = elem.get(0);
          view = this.get('objectInspector').sentObjects[viewElem.id];
          if (view && this.shouldShowView(view)) {
            return viewElem;
          }
        }
        return this.findNearestView($(elem).parents('.ember-view:first'));
      },

      stopInspecting: function() {
        $('body')
        .off('mousemove.inspect-' + this.get('eventNamespace'))
        .off('mousedown.inspect-' + this.get('eventNamespace'))
        .off('click.inspect-' + this.get('eventNamespace'))
        .css('cursor', '');

        this.hidePreview();
        this.sendMessage('stopInspecting', {});
      },

      scheduledSendTree: function() {
        var self = this;
        // Use next run loop because
        // some initial page loads
        // don't trigger mutation listeners
        // TODO: Look into that in Ember core
        Ember.run.next(function() {
          if (self.isDestroying) {
            return;
          }
          self.releaseCurrentObjects();
          var tree = self.viewTree();
          if (tree) {
            self.sendMessage('viewTree', {
              tree: tree
            });
          }
        });
      },

      viewListener: function() {
        var self = this;

        this.viewTreeChanged = function() {
          self.sendTree();
          self.hideLayer();
        };

        Ember.View.addMutationListener(this.viewTreeChanged);
      },

      viewTree: function() {
         var rootView = Ember.View.views[$('.ember-application > .ember-view').attr('id')];
          // In case of App.reset view is destroyed
          if (!rootView) {
            return false;
          }
          var retained = [];

          var children = [];
          var treeId = this.retainObject(retained);

          var tree = { value: this.inspectView(rootView, retained), children: children, treeId: treeId };

          this.appendChildren(rootView, children, retained);


          return tree;
      },

      inspectView: function(view, retained) {
        var templateName = view.get('templateName') || view.get('_debugTemplateName'),
            viewClass = viewName(view), name;

        var tagName = view.get('tagName');
        if (tagName === '') {
          tagName = '(virtual)';
        }

        tagName = tagName || 'div';

        var controller = view.get('controller');

        name = viewDescription(view);


        var viewId = this.retainObject(view);
        retained.push(viewId);

        var value = {
          viewClass: viewClass,
          objectId: viewId,
          name: name,
          template: templateName || '(inline)',
          tagName: tagName,
          isVirtual: view.get('isVirtual'),
          isComponent: (view instanceof Ember.Component)
        };

        if (!(view instanceof Ember.Component)) {
          value.controller = {
            name: controllerName(controller),
            objectId: this.retainObject(controller)
          };

          var model = controller.get('model');
          if (model) {
            value.model = {
              name: modelName(model),
              objectId: this.retainObject(model)
            };
          }
        }

        return value;
      },

      appendChildren: function(view, children, retained) {
        var self = this;
        var childViews = view.get('_childViews'),
            controller = view.get('controller');

        childViews.forEach(function(childView) {
          if (!(childView instanceof Ember.Object)) { return; }

          if (self.shouldShowView(childView)) {
            var grandChildren = [];
            children.push({ value: self.inspectView(childView, retained), children: grandChildren });
            self.appendChildren(childView, grandChildren, retained);
          } else {
            self.appendChildren(childView, children, retained);
          }
        });
      },

      shouldShowView: function(view) {
        return (this.options.allViews || view.get('controller') !== view.get('_parentView.controller')) &&
            (this.options.components || !(view instanceof Ember.Component)) &&
            (!view.get('isVirtual') || view.get('controller') !== view.get('_parentView.controller'));
      },

      highlightView: function(element, preview) {
        var self = this;
        var range, view, rect, div;

        if (!element) { return; }

        if (preview) {
          previewedElement = element;
          div = previewDiv;
        } else {
          this.hideLayer();
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
          element = view.get('element');
          if (!element) { return; }
          rect = element.getBoundingClientRect();
        } else {
          view = Ember.View.views[element.id];
          rect = element.getBoundingClientRect();
        }

        // take into account the scrolling position as mentioned in docs
        // https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect
        rect = $().extend({}, rect);
        rect.top = rect.top + window.scrollY;
        rect.left = rect.left + window.scrollX;

        var templateName = view.get('templateName') || view.get('_debugTemplateName'),
            controller = view.get('controller'),
            model = controller && controller.get('model');

        $(div).css(rect);
        $(div).css({
          display: "block",
          position: "absolute",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          border: "2px solid rgb(102, 102, 102)",
          padding: "0",
          right: "auto",
          direction: "ltr",
          boxSizing: "border-box",
          color: "rgb(51, 51, 255)",
          fontFamily: "Menlo, sans-serif",
          minHeight: 63,
          zIndex: 10000
        });

        var output = "";

        if (!preview) {
          output = "<span class='close' data-label='layer-close'>&times;</span>";
        }

        if (templateName) {
          output += "<p class='template'><span>template</span>=<span data-label='layer-template'>" + escapeHTML(templateName) + "</span></p>";
        }

        if (!(view instanceof Ember.Component)) {
          output += "<p class='controller'><span>controller</span>=<span data-label='layer-controller'>" + escapeHTML(controllerName(controller)) + "</span></p>";
          output += "<p class='view'><span>view</span>=<span data-label='layer-view'>" + escapeHTML(viewName(view)) + "</span></p>";
        } else {
          output += "<p class='component'><span>component</span>=<span data-label='layer-component'>" + escapeHTML(viewName(view)) + "</span></p>";
        }

        if (model) {
          output += "<p class='model'><span>model</span>=<span data-label='layer-model'>" + escapeHTML(model.toString()) + "</span></p>";
        }

        $(div).html(output);

        $('p', div).css({ float: 'left', margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
        $('p.model', div).css({ clear: 'left' });
        $('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
        $('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });

        if (!preview) {
          $('span.close', div).css({
            float: 'right',
            margin: '5px',
            background: '#666',
            color: '#eee',
            fontFamily: 'helvetica, sans-serif',
            fontSize: '12px',
            width: 16,
            height: 16,
            lineHeight: '14px',
            borderRadius: 16,
            textAlign: 'center',
            cursor: 'pointer'
          }).on('click', function() {
            self.hideLayer();
          });
        }

        $('p.view span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.get('objectInspector').sendObject(view);
        });

        $('p.controller span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.get('objectInspector').sendObject(controller);
        });

        $('p.component span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.get('objectInspector').sendObject(view);
        });

        $('p.template span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.inspectElement(Ember.guidFor(view));
        });

        $('p.model span:last-child', div).css({ cursor: 'pointer' }).click(function() {
          self.get('objectInspector').sendObject(controller.get('model'));
        });

        if (!preview) {
          this.sendMessage('pinView', { objectId: Ember.guidFor(view) });
        }
      },

      showLayer: function(objectId) {
        this.highlightView(this.get('objectInspector').sentObjects[objectId]);
      },

      previewLayer: function(objectId) {
        this.highlightView(this.get('objectInspector').sentObjects[objectId], true);
      },

      hideLayer: function() {
        this.sendMessage('unpinView', {});
        layerDiv.style.display = 'none';
        highlightedElement = null;
      },

      hidePreview: function() {
        previewDiv.style.display = 'none';
        previewedElement = null;
      }
    });

    function viewName(view) {
      var name = view.constructor.toString(), match;
      if (name.match(/\._/)) {
        name = "virtual";
      } else if (match = name.match(/\(subclass of (.*)\)/)) {
        name = match[1];
      }
      return name;
    }

    function modelName(model) {
      var name = '<Unkown model>';
      if (model.toString) {
        name = model.toString();
      }
      if (name.length > 50) {
        name = name.substr(0, 50) + '...';
      }
      return name;
    }

    function controllerName(controller) {
      var key = controller.get('_debugContainerKey'),
          className = controller.constructor.toString(),
          name;

      if (className.charAt(0) === '(') {
        className = className.match(/^\(subclass of (.*)\)/)[1];
      }
      return className;
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
      range.setStartAfter($('#' + startId)[0]);
      range.setEndBefore($('#' + endId)[0]);

      return range;
    }

    function viewDescription(view) {
      var templateName = view.get('templateName') || view.get('_debugTemplateName'),
          name, viewClass = viewName(view), controller = view.get('controller');

      if (templateName) {
          name = templateName;
        } else if (view instanceof Ember.LinkView) {
          name = 'link';
        } else if (view.get('_parentView.controller') === controller || view instanceof Ember.Component) {
            var viewClassName = view.get('_debugContainerKey');
            if (viewClassName) {
              viewClassName = viewClassName.match(/\:(.*)/);
              if (viewClassName) {
                viewClassName = viewClassName[1];
              }
            }
            if (!viewClassName && viewClass) {
              viewClassName = viewClass.match(/\.(.*)/);
              if (viewClassName) {
                viewClassName = viewClassName[1];
              } else {
                viewClassName = viewClass;
              }

              var shortName = viewClassName.match(/(.*)(View|Component)$/);
              if (shortName) {
                viewClassName = shortName[1];
              }
            }
            if (viewClassName) {
              name = Ember.String.camelize(viewClassName);
            }
        } else if (view.get('_parentView.controller') !== controller) {
          var key = controller.get('_debugContainerKey'),
          className = controller.constructor.toString();

          if (key) {
            name = key.split(':')[1];
          }  else {
            if (className.charAt(0) === '(') {
              className = className.match(/^\(subclass of (.*)\)/)[1];
            }
            name = className.split('.')[1];
            name = name.charAt(0).toLowerCase() + name.substr(1);
          }
        }

        if (!name) {
          name = '(inline view)';
        }
        return name;
    }


    return ViewDebug;
  });