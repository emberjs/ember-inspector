export default function filterComputed() {
  var dependentKeys, callback;

  if (arguments.length > 1) {
    var slice = [].slice;
    dependentKeys = slice.call(arguments, 0, -1);
    callback = slice.call(arguments, -1)[0];
  }
  var options = {
    initialize: function (array, changeMeta, instanceMeta) {
      instanceMeta.filteredArrayIndexes = new Ember.SubArray();
    },

    addedItem: function(array, item, changeMeta, instanceMeta) {
      var match = !!callback.call(this, item),
          filterIndex = instanceMeta.filteredArrayIndexes.addItem(changeMeta.index, match);

      if (match) {
        array.insertAt(filterIndex, item);
      }

      return array;
    },

    removedItem: function(array, item, changeMeta, instanceMeta) {
      var filterIndex = instanceMeta.filteredArrayIndexes.removeItem(changeMeta.index);

      if (filterIndex > -1) {
        array.removeAt(filterIndex);
      }

      return array;
    }
  };
  var args = dependentKeys;
  args.push(options);

  /*jshint validthis:true */
  return Ember.arrayComputed.apply(this, args);
};
