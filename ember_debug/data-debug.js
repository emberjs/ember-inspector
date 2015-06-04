import PortMixin from 'ember-debug/mixins/port-mixin';
var Ember = window.Ember;
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
    var container = this.get('application').__container__;

    // dataAdapter:main is deprecated
    return (this._resolve('data-adapter:main') && container.lookup('data-adapter:main')) ||
    (this._resolve('dataAdapter:main') && container.lookup('dataAdapter:main'));
  }).property('application'),

  _resolve: function(name) {
    var container = this.get('application').__container__;
    var registry = this.get('application.registry');
    if (registry) {
      // Ember >= 1.11
      return registry.resolve(name);
    } else {
      // Ember < 1.11
      return container.resolve(name);
    }

  },

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
    var columnValues = {};
    var searchKeywords = [];
    this.sentRecords[objectId] = record;
    // make objects clonable
    for (var i in record.columnValues) {
      columnValues[i] = this.get('objectInspector').inspect(record.columnValues[i]);
    }
    // make sure keywords can be searched and clonable
    searchKeywords = Ember.A(record.searchKeywords).filter(function(keyword) {
      return (typeof keyword === 'string' || typeof keyword === 'number');
    });
    return {
      columnValues: columnValues,
      searchKeywords: searchKeywords,
      filterValues: record.filterValues,
      color: record.color,
      objectId: objectId
    };
  },

  releaseTypes: function() {
    if (this.releaseTypesMethod) {
      this.releaseTypesMethod();
      this.releaseTypesMethod = null;
      this.sentTypes = {};
    }
  },

  releaseRecords: function() {
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

      let typeOrName;
      if (this.get('adapter.acceptsModelName')) {
        // Ember >= 1.3
        typeOrName = type.name;
      } else {
        // support for legacy Ember < 1.3
        typeOrName = type.object;
      }
      var releaseMethod = this.get('adapter').watchRecords(typeOrName,
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

export default DataDebug;
