import PortMixin from 'mixins/port_mixin';
import DataAdapter from "data_adapter";

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
      searchIndex: record.searchIndex,
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

export default DataDebug;
