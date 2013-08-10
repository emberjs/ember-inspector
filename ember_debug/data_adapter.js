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
    @private

    Number of attributes to send
    as columns. (Enough to make the record
    identifiable).
  */
  attributeLimit: 3,

  /**
    @private

    Stores all methods that clear observers.
    These methods will be called on destruction.
  */
  releaseMethods: [],

  /**
    @private

    Clear all observers before destruction
  */
  willDestroy: function() {
    this._super();
    this.releaseMethods.forEach(function(fn) {
      fn();
    });
  },

  /**
    @private

    Detect whether a class is a model.

    Test that against the model class
    of your persistence library

    @method detect
    @param {Class} The class to test
    @return boolean Whether the class is a model class or not
  */
  detect: function(klass) {
    return klass !== DS.Model && DS.Model.detect(klass);
  },


  /**
    @public

    Specifies how records can be filtered.
    Records returned will need to have a `filterValues`
    property with a key for every name in the returned array.

    @method getFilters
    @return {Array} List of objects defining filters.
     The object should have a `name` and `desc` property.
  */
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
    @private

    Get the columns for a given model type.

    @method columnsForType
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
    @public

    Fetch the model types and observe them for changes.

    @method watchModelTypes

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
      var wrapped = self.wrapModelType(type);
      releaseMethods.push(self.observeModelType(type, typesUpdated));
      return wrapped;
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
    @private

    Adds observers to a model type class.

    @method observeModelType
    @param {Class} type The model type class
    @param {Function} typesUpdated Called when a type is modified.
    @return {Function} The function to call to remove observers
  */

  observeModelType: function(type, typesUpdated) {
    var self = this, records = this.getRecords(type);

    var onChange = function() {
      typesUpdated([self.wrapModelType(type)]);
    };
    var observer = {
      didChange: function() {
        Ember.run.scheduleOnce('actions', this, onChange);
      },
      willChange: Ember.K
    };

    records.addArrayObserver(this, observer);

    var release = function() {
      records.removeArrayObserver(self, observer);
    };

    return release;
  },


  /**
    @private

    Wraps a given model type and observes changes to it.

    @method wrapModelType
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


    return typeToSend;
  },


  /**
    @private

    Fetches all models defined in the application.
    TODO: Use the resolver instead of looping over namespaces.

    @method getModelTypes
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
    @public

    Fetch the records of a given type and observe them for changes.

    @method watchRecords

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
    @private

    Fetches all loaded records for a given type.

    @method getRecords
    @return {Array} array of records.
     This array will be observed for changes,
     so it should update when new records are added/removed.
  */
  getRecords: function(type) {
    var store = this.get('application.__container__').lookup('store:main');
    return store.all(type);
  },

  /**
    @private

    Wraps a record and observers changes to it

    @method wrapRecord
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
    recordToSend.color = this.getRecordColor(record);

    return recordToSend;
  },

  /**
    @private

    Gets the values for each column.

    @method getRecordColumnValues
    @return {Object} Keys should match column names defined
    by the model type.
  */
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

  /**
    @private

    Returns keywords to match when searching records.

    @method getRecordKeywords
    @return {Array} Relevant keywords for search.
  */
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

  /**
    @private

    Returns the values of filters defined by `getFilters`.

    @method getRecordFilterValues
    @param {Object} The record instance
    @return {Object} The filter values
  */
  getRecordFilterValues: function(record) {
    return {
      isNew: record.get('isNew'),
      isModified: record.get('isDirty') && !record.get('isNew'),
      isClean: !record.get('isDirty')
    };
  },

  /**
    @private

    Each record can have a color that represents its state.

    @method getRecordColor
    @param {Object} The record instance
    @return {String} The record's color
  */
  getRecordColor: function(record) {
    var color = '#4896ab';
    if (record.get('isNew')) {
      color = '#768573';
    } else if (record.get('isDirty')) {
      color = '#939';
    }
    return color;
  },

  /**
    @private

    Observes all relevant keywords and re-sends the wrapped record
    when a change occurs.

    @method observerRecord
    @param {Object} The record instance
    @param {Function} The callback to call when a record is updated.
    @return {Function} The function to call to remove all observers.
  */
  observeRecord: function(record, recordsUpdated) {
    var releaseMethods = [], self = this,
        keysToObserve = ['id', 'isNew', 'isDirty'];

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
