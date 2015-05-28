import Ember from "ember";
export default function filterComputed() {
  let dependentKeys, callback;

  if (arguments.length > 1) {
    const slice = [].slice;
    dependentKeys = slice.call(arguments, 0, -1);
    callback = slice.call(arguments, -1)[0];
  }
  let options = {
    initialize(array, changeMeta, instanceMeta) {
      instanceMeta.filteredArrayIndexes = new Ember.SubArray();
    },

    addedItem(array, item, changeMeta, instanceMeta) {
      let match = !!callback.call(this, item),
          filterIndex = instanceMeta.filteredArrayIndexes.addItem(changeMeta.index, match);

      if (match) {
        array.insertAt(filterIndex, item);
      }

      return array;
    },

    removedItem(array, item, changeMeta, instanceMeta) {
      let filterIndex = instanceMeta.filteredArrayIndexes.removeItem(changeMeta.index);

      if (filterIndex > -1) {
        array.removeAt(filterIndex);
      }

      return array;
    }
  };
  let args = dependentKeys;
  args.push(options);

  /*jshint validthis:true */
  return Ember.arrayComputed.apply(this, args);
}
