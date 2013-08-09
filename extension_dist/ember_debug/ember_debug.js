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

define("data_adapter",
  [],
  function() {
    "use strict";
    var get = Ember.get, RSVP = Ember.RSVP, DS = window.DS;

    var DataAdapter = Ember.Object.extend({
      init: function() {
        this._super();
        this.releaseMethods = Ember.A();
      },

      /**
       The application being debugged.
       This property will be injected
       on creation.
      */
      application: null,

      /**
       Number of attributes to send
       as columns. (Enough to make the record
       identifiable).
      */
      attributeLimit: 3,

      /**
       Stores all methods that clear observers.
       These methods will be called on destruction.
      */
      releaseMethods: [],


      willDestroy: function() {
        this._super();
        this.releaseMethods.forEach(function(fn) {
          fn();
        });
      },

      /**
       Detect whether a class is a model.

       Test that against the model class
       of your persistence library

       @param {Class} The class to test
       @return boolean Whether the class is a model class or not
      */
      detect: function(klass) {
        return klass !== DS.Model && DS.Model.detect(klass);
      },


      getFilters: function() {
        return [
          {
            name: 'isNew',
            desc: 'New'
          },
          {
            name: 'isModified',
            desc: 'Modified'
          },
          {
            name: 'isClean',
            desc: 'Clean'
          }
        ];
      },

      /**
       Get the columns for a given model type.

       @param {Class} type The model type
       @return {Array} An array of columns of the following format:
         name: {String} name of the column
      */
      columnsForType: function(type) {
        var columns = [{ name: 'id' }], count = 0, self = this;
        get(type, 'attributes').forEach(function(name, meta) {
            if (count++ > self.attributeLimit) { return false; }
            columns.push({ name: name });
        });
        return columns;
      },


      /**
       Fetch the model types and observe them for changes.

       @param {Function} typesAdded Callback to call to add types.
        Takes an array of objects containing wrapped types (returned from `wrapModelType`).


       @param {Function} typesUpdated Callback to call when a type has changed.
        Takes an array of objects containing wrapped types.

       @return {Function} Method to call to remove all observers
      */
      watchModelTypes: function(typesAdded, typesUpdated) {
        var modelTypes = this.getModelTypes(),
            self = this, typesToSend, releaseMethods = [];

        typesToSend = modelTypes.map(function(type) {
          var wrapped = self.wrapModelType(type, typesUpdated);
          releaseMethods.push(wrapped.release);
          return wrapped.type;
        });

        typesAdded(typesToSend);

        var release = function() {
          releaseMethods.forEach(function(fn) { fn(); });
          self.releaseMethods.removeObject(release);
        };
        this.releaseMethods.pushObject(release);
        return release;
      },

      /**
       Wraps a given model type and observes changes to it.

       @param {Class} A model type
       @param {Function} typesUpdated callback to call when the type changes
       @return {Object} contains the wrapped type and the function to remove observers
        Format:
          type: {Object} the wrapped type
            The wrapped type has the following format:
              name: {String} name of the type
              count: {Integer} number of records available
              columns: {Columns} array of columns to describe the record
              object: {Class} the actual Model type class
          release: {Function} The function to remove observers
      */
      wrapModelType: function(type, typesUpdated) {
        var release, records = this.getRecords(type),
            typeToSend, self = this;

        typeToSend = {
          name: type.toString(),
          count: get(records, 'length'),
          columns: this.columnsForType(type),
          object: type
        };

        var onChange = function() {
          typeToSend.count = get(records, 'length');
          typesUpdated([typeToSend]);
        };
        var observer = {
          didChange: function() {
            Ember.run.scheduleOnce('actions', this, onChange);
          },
          willChange: Ember.K
        };

        records.addArrayObserver(this, observer);
        release = function() {
          records.removeArrayObserver(self, observer);
        };

        return {
          type: typeToSend,
          release: release
        };
      },


      /**
       Fetches all models defined in the application.
       TODO: Use the resolver instead of looping over namespaces.

       @return {Array} Array of model types
      */
      getModelTypes: function() {
        var namespaces = Ember.Namespace.NAMESPACES, types = [], self = this;

        namespaces.forEach(function(namespace) {
          for (var key in namespace) {
            if (!namespace.hasOwnProperty(key)) { continue; }
            var klass = namespace[key];
            if (self.detect(klass)) {
              types.push(klass);
            }
          }
        });
        return types;
      },

      /**
       Fetch the records of a given type and observe them for changes.

       @param {Function} recordsAdded Callback to call to add records.
        Takes an array of objects containing wrapped records.
        The object should have the following properties:
          columnValues: {Object} key and value of a table cell
          object: {Object} the actual record object

       @param {Function} recordsUpdated Callback to call when a record has changed.
        Takes an array of objects containing wrapped records.

       @param {Function} recordsRemoved Callback to call when a record has removed.
        Takes the following parameters:
          index: the array index where the records were removed
          count: the number of records removed

       @return {Function} Method to call to remove all observers
      */
      watchRecords: function(type, recordsAdded, recordsUpdated, recordsRemoved) {
        var self = this, releaseMethods = [], records = this.getRecords(type), release;

        var recordsToSend = records.map(function(record) {
          releaseMethods.push(self.observeRecord(record, recordsUpdated));
          return self.wrapRecord(record);
        });

        recordsAdded(recordsToSend);

        var contentDidChange = function(array, idx, removedCount, addedCount) {
          for (var i = idx; i < idx + addedCount; i++) {
            var record = array.objectAt(i);
            var wrapped = self.wrapRecord(record, recordsUpdated);
            releaseMethods.push(self.observeRecord(record, recordsUpdated));
            recordsAdded([wrapped]);
          }

          if (removedCount) {
            recordsRemoved(idx, removedCount);
          }
        };

        var observer = { didChange: contentDidChange, willChange: Ember.K };
        records.addArrayObserver(self, observer);

        release = function() {
          releaseMethods.forEach(function(fn) { fn(); });
          records.removeArrayObserver(self, observer);
          self.releaseMethods.removeObject(release);
        };

        this.releaseMethods.pushObject(release);
        return release;
      },

      /**
       Fetches all loaded records for a given type.

       @return {Array} array of records.
         This array will be observed for changes,
         so it should update when new records are added/removed.
      */
      getRecords: function(type) {
        var store = this.get('application.__container__').lookup('store:main');
        return store.all(type);
      },

      /**
       Wraps a record and observers changes to it

       @param {Object} record The record instance
       @return {Object} the wrapped record. Format:
        columnValues: {Array}
        searchIndex: {Array}
      */
      wrapRecord: function(record) {
        var recordToSend = { object: record }, columnValues = {}, self = this;

        recordToSend.columnValues = this.getRecordColumnValues(record);
        recordToSend.searchIndex = this.getRecordKeywords(record);
        recordToSend.filterValues = this.getRecordFilterValues(record);

        return recordToSend;
      },

      getRecordColumnValues: function(record) {
        var self = this, count = 0,
            columnValues = { id: get(record, 'id') };

        record.eachAttribute(function(key) {
          if (count++ > self.attributeLimit) {
            return false;
          }
          var value = get(record, key);
          columnValues[key] = value;
        });
        return columnValues;
      },

      getRecordKeywords: function(record) {
        var keywords = [], keys = ['id'];
        record.eachAttribute(function(key) {
          keys.push(key);
        });
        keys.forEach(function(key) {
          keywords.push(get(record, key));
        });
        return keywords;
      },

      getRecordFilterValues: function(record) {
        return {
          isNew: record.get('isNew'),
          isModified: record.get('isDirty') && !record.get('isNew'),
          isClean: !record.get('isDirty')
        };
      },

      observeRecord: function(record, recordsUpdated) {
        var releaseMethods = [], self = this,
            keysToObserve = ['id'];

        record.eachAttribute(function(key) {
          keysToObserve.push(key);
        });

        keysToObserve.forEach(function(key) {
          var handler = function() {
            recordsUpdated([self.wrapRecord(record)]);
          };
          Ember.addObserver(record, key, handler);
          releaseMethods.push(function() {
            Ember.removeObserver(record, key, handler);
          });
        });

        var release = function() {
          releaseMethods.forEach(function(fn) { fn(); } );
        };

        return release;
      }

    });


    return DataAdapter;
  });
define("data_debug",
  ["mixins/port_mixin","data_adapter"],
  function(PortMixin, DataAdapter) {
    "use strict";

    var classify = Ember.String.classify, get = Ember.get;


    var DataDebug = Ember.Object.extend(PortMixin, {
      init: function() {
        this._super();
        this.sentTypes = {};
        this.sentRecords = {};
        if(window.DS) {
          this.adapter = DataAdapter.create({ application: this.get('application') });
        }
      },

      sentTypes: {},
      sentRecords: {},

      releaseTypesMethod: null,
      releaseRecordsMethod: null,

      adapter: null,

      namespace: null,

      port: Ember.computed.alias('namespace.port'),
      application: Ember.computed.alias('namespace.application'),
      objectInspector: Ember.computed.alias('namespace.objectInspector'),

      portNamespace: 'data',

      modelTypesAdded: function(types) {
        var self = this, objectId, typesToSend;
        typesToSend = types.map(function(type) {
          objectId = Ember.guidFor(type);
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
        var objectId = Ember.guidFor(type);
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

      recordsUpdated: function(records) {
        var self = this;
        records.forEach(function(record) {
          var objectId = Ember.guidFor(record);
          self.sendMessage('recordUpdated', {
            record: self.wrapRecord(record)
          });
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
          searchIndex: record.searchIndex,
          filterValues: record.filterValues,
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
        getModelTypes: function() {
          var self = this;
          this.releaseTypes();
          this.releaseTypesMethod = this.adapter.watchModelTypes(
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

          var releaseMethod = this.adapter.watchRecords(type.object,
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
            filters: this.adapter.getFilters()
          });
        }
      }
    });


    return DataDebug;
  });
define("ember_debug",
  ["port","object_inspector","view_debug","route_debug","data_debug"],
  function(Port, ObjectInspector, ViewDebug, RouteDebug, DataDebug) {
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

      setDebugHandler: function(prop, Handler) {
        var handler = this.get(prop);
        if (handler) {
          Ember.run(handler, 'destroy');
        }
        this.set(prop, Handler.create({ namespace: this }));
      },

      reset: function() {
        this.set('port', this.Port.create());

        this.setDebugHandler('objectInspector', ObjectInspector);
        this.setDebugHandler('routeDebug', RouteDebug);
        this.setDebugHandler('viewDebug', ViewDebug);
        this.setDebugHandler('dataDebug', DataDebug);

        this.viewDebug.sendTree();
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
        }
      },

      saveProperty: function(objectId, mixinIndex, prop, val) {
        var object = this.sentObjects[objectId];
        Ember.set(object, prop, val);
      },

      sendToConsole: function(objectId, prop) {
        var object = this.sentObjects[objectId];
        var value = Ember.get(object, prop);
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
            mixinDetails = [],
            self = this;

        var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
        mixinDetails.push({ name: "Own Properties", properties: ownProps, expand: true });

        mixins.forEach(function(mixin) {
          var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
          mixinDetails.push({ name: name.toString(), properties: propertiesForMixin(mixin) });
        });

        applyMixinOverrides(mixinDetails);

        var propertyInfo = null;
        if (object._debugInfo && typeof object._debugInfo === 'function') {
          propertyInfo = object._debugInfo().propertyInfo;
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
        if (isMandatorySetter(hash, prop)) { continue; }
        // when mandatory setter is removed, an `undefined` value may be set
        if (hash[prop] === undefined) { continue; }

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
          if (!item.overridden && neededProperties[item.name]) {
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
          Em.run.scheduleOnce('afterRender', sendTree);
        };

        function sendTree() {
          self.sendTree();
          self.hideLayer();
        }

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
          output = "<span class='close' data-label='layer-close'>&times;</span>";
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