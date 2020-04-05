import Controller from '@ember/controller';
import { action, get, computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';

const HIDE_EMPTY_MODELS_KEY = 'are-model-types-hidden';
const ORDER_MODELS_BY_COUNT_KEY = 'are-models-ordered-by-record-count';

export default Controller.extend({
  navWidth: 180,
  storage: service(),

  init() {
    this._super(...arguments);
    this.sortByNameProp = ['name'];
    this.sortByDescCountProp = ['count:desc'];
  },

  hideEmptyModelTypes: computed({
    get() {
      return getStoredPropertyValue(this.storage, HIDE_EMPTY_MODELS_KEY);
    },
    set(key, value) {
      return handleSettingProperty(this.storage, HIDE_EMPTY_MODELS_KEY, value);
    }
  }),

  orderByRecordCount: computed({
    get() {
      return getStoredPropertyValue(this.storage, ORDER_MODELS_BY_COUNT_KEY);
    },
    set(key, value) {
      return handleSettingProperty(this.storage, ORDER_MODELS_BY_COUNT_KEY, value);
    }
  }),

  sortByName: sort('filtered', 'sortByNameProp'),

  sortByDescCount: sort('filtered', 'sortByDescCountProp'),

  filtered: computed('model.@each.count', 'hideEmptyModelTypes', function() {
    return this.model.filter(item => {
      let hideEmptyModels = this.hideEmptyModelTypes;

      if (hideEmptyModels) {
        return !!get(item, 'count');
      } else {
        return true;
      }
    });
  }),

  getStore: action(function() {
    this.port.send('objectInspector:inspectByContainerLookup', {
      name: 'service:store'
    });
  }),
});
/**
 * Returns whether or not a given key has been set in storage.
 * @param {*} storage
 * @param {string} key
 * @returns {boolean}
 */
function getStoredPropertyValue(storage, key) {
  return !!storage.getItem(key);
}

function handleSettingProperty(storage, key, value) {
  if (!value) {
    storage.removeItem(key);
  } else {
    storage.setItem(key, value);
  }
  return value;
}
