import PortMixin from 'mixins/port_mixin';

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
    return (container.resolve('data-adapter:main') && container.lookup('data-adapter:main')) ||
    (container.resolve('dataAdapter:main') && container.lookup('dataAdapter:main'));
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

export default DataDebug;
