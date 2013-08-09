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

export default DataAdapter;
