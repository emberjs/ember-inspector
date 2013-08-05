import PortMixin from 'mixins/port_mixin';

var classify = Ember.String.classify, get = Ember.get;


var DataDebug = Ember.Object.extend(PortMixin, {
  init: function() {
    var self = this;
    this._super();
  },

  namespace: null,

  port: Ember.computed.alias('namespace.port'),
  application: Ember.computed.alias('namespace.application'),
  objectInspector: Ember.computed.alias('namespace.objectInspector'),

  portNamespace: 'data',


  // THIS WILL BE PULLED INTO AN ADAPTER ==============

  getModelTypes: function() {
    var modelTypes = this.findModelTypes(), self = this;
    return modelTypes.map(function(ModelType) {
      var attributes = [ { name: 'id' } ];
      get(ModelType, 'attributes').forEach(function(name, meta) {
        attributes.push({ name: name });
      });
      return {
        name: ModelType.toString(),
        count: self.getCountRecords(ModelType),
        attributes: attributes
      };
    });
  },

  getCountRecords: function(ModelType) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.all(ModelType).get('length');
  },

  findModelTypes: function() {
    var self = this;
    var namespaces = Ember.Namespace.NAMESPACES;
    var ModelTypes = [];
    namespaces.forEach(function(namespace) {
      if (namespace === self.get('namespace') || namespace === Ember || namespace === window.DS) {
        return true;
      }
      for (var key in namespace) {
        var ModelType = namespace[key];
        if (window.DS.Model.detect(ModelType)) {
          ModelTypes.push(ModelType);
        }
      }
    });
    return ModelTypes;
  },

  findRecords: function(typeName) {
    var store = this.get('application.__container__').lookup('store:main');

    var recordArray = store.all(get(Ember.lookup, typeName));
    return recordArray.map(function(record) {
      var obj = {
        id: get(record, 'id')
      };
      record.eachAttribute(function(name) {
        obj[name] = get(record, name);
      });
      return obj;
    });
  },

  findRecord: function(typeName, id) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.find(get(Ember.lookup, typeName), id);
  },

  //==================================================

  messages: {
    getModelTypes: function() {
      this.sendMessage('modelTypes', {
        modelTypes: this.getModelTypes()
      });
    },

    getRecords: function(message) {
      var records = this.findRecords(message.modelType);
      this.sendMessage('records', {
        records: records
      });
    },

    inspectModel: function(message) {
      var record = this.findRecord(message.modelType, message.id);
      this.get('objectInspector').sendObject(record);
    }
  }
});

export default DataDebug;
