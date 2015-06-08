import PortMixin from 'ember-debug/mixins/port-mixin';
const Ember = window.Ember;
const { Object: EmberObject, computed, guidFor, A } = Ember;
const { alias } = computed;

export default EmberObject.extend(PortMixin, {
  init() {
    this._super();
    this.sentTypes = {};
    this.sentRecords = {};
  },

  sentTypes: {},
  sentRecords: {},

  releaseTypesMethod: null,
  releaseRecordsMethod: null,

  adapter: computed('application', function() {
    const container = this.get('application').__container__;

    // dataAdapter:main is deprecated
    return (this._resolve('data-adapter:main') && container.lookup('data-adapter:main')) ||
    (this._resolve('dataAdapter:main') && container.lookup('dataAdapter:main'));
  }),

  _resolve(name) {
    const container = this.get('application').__container__;
    let registry = this.get('application.registry');
    if (registry) {
      // Ember >= 1.11
      return registry.resolve(name);
    } else {
      // Ember < 1.11
      return container.resolve(name);
    }

  },

  namespace: null,

  port: alias('namespace.port'),
  application: alias('namespace.application'),
  objectInspector: alias('namespace.objectInspector'),

  portNamespace: 'data',

  modelTypesAdded(types) {
    let typesToSend;
    typesToSend = types.map(type => this.wrapType(type));
    this.sendMessage('modelTypesAdded', {
      modelTypes: typesToSend
    });
  },

  modelTypesUpdated(types) {
    let typesToSend = types.map(type => this.wrapType(type));
    this.sendMessage('modelTypesUpdated', {
      modelTypes: typesToSend
    });
  },

  wrapType(type) {
    const objectId = guidFor(type.object);
    this.sentTypes[objectId] = type;

    return {
      columns: type.columns,
      count: type.count,
      name: type.name,
      objectId: objectId
    };
  },


  recordsAdded(recordsReceived) {
    let records;
    records = recordsReceived.map(record => this.wrapRecord(record));
    this.sendMessage('recordsAdded', {
      records: records
    });
  },

  recordsUpdated(recordsReceived) {
    let records = recordsReceived.map(record => this.wrapRecord(record));
    this.sendMessage('recordsUpdated', {
      records: records
    });
  },

  recordsRemoved(idx, count) {
    this.sendMessage('recordsRemoved', {
      index: idx,
      count: count
    });
  },

  wrapRecord(record) {
    const objectId = guidFor(record.object);
    let columnValues = {};
    let searchKeywords = [];
    this.sentRecords[objectId] = record;
    // make objects clonable
    for (let i in record.columnValues) {
      columnValues[i] = this.get('objectInspector').inspect(record.columnValues[i]);
    }
    // make sure keywords can be searched and clonable
    searchKeywords = A(record.searchKeywords).filter(keyword =>
      (typeof keyword === 'string' || typeof keyword === 'number')
    );
    return {
      columnValues: columnValues,
      searchKeywords: searchKeywords,
      filterValues: record.filterValues,
      color: record.color,
      objectId: objectId
    };
  },

  releaseTypes() {
    if (this.releaseTypesMethod) {
      this.releaseTypesMethod();
      this.releaseTypesMethod = null;
      this.sentTypes = {};
    }
  },

  releaseRecords() {
    if (this.releaseRecordsMethod) {
      this.releaseRecordsMethod();
      this.releaseRecordsMethod = null;
      this.sentRecords = {};
    }
  },

  willDestroy() {
    this._super();
    this.releaseRecords();
    this.releaseTypes();
  },

  messages: {
    checkAdapter() {
      this.sendMessage('hasAdapter', { hasAdapter: !!this.get('adapter') });
    },

    getModelTypes() {
      this.releaseTypes();
      this.releaseTypesMethod = this.get('adapter').watchModelTypes(types => {
        this.modelTypesAdded(types);
      }, types => {
        this.modelTypesUpdated(types);
      });
    },

    releaseModelTypes() {
      this.releaseTypes();
    },

    getRecords(message) {
      const type = this.sentTypes[message.objectId];
      this.releaseRecords();

      const releaseMethod = this.get('adapter').watchRecords(type.object,
        (recordsReceived) => {
          this.recordsAdded(recordsReceived);
        },
        (recordsUpdated) => {
          this.recordsUpdated(recordsUpdated);
        },
        () => {
          this.recordsRemoved(...arguments);
        }
      );
      this.releaseRecordsMethod = releaseMethod;
    },

    releaseRecords() {
      this.releaseRecords();
    },

    inspectModel(message) {
      this.get('objectInspector').sendObject(this.sentRecords[message.objectId].object);
    },

    getFilters() {
      this.sendMessage('filters', {
        filters: this.get('adapter').getFilters()
      });
    }
  }
});

