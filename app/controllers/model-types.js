import Controller, { inject as controller } from '@ember/controller';
import { get, computed } from '@ember/object';
import LocalStorageService from 'ember-inspector/services/storage/local';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { HIDE_EMPTY_MODELS_KEY, ORDER_MODELS_BY_COUNT_KEY } from 'ember-inspector/utils/local-storage-keys';

export default Controller.extend({
  application: controller(),
  navWidth: 180,
  storage: service(`storage/${LocalStorageService.STORAGE_TYPE_TO_USE}`),

  init() {
    this._super(...arguments);
    this.sortByNameProp = ['name'];
    this.sortByDescCountProp = ['count:desc'];
  },

  hideEmptyModelTypes: computed({
    get() {
      return getStoredPropertyValue(this.get('storage'), HIDE_EMPTY_MODELS_KEY);
    },
    set(key, value) {
      return handleSettingProperty(this.get('storage'), HIDE_EMPTY_MODELS_KEY, value);
    }
  }),

  orderByRecordCount: computed({
    get() {
      return getStoredPropertyValue(this.get('storage'), ORDER_MODELS_BY_COUNT_KEY);
    },
    set(key, value) {
      return handleSettingProperty(this.get('storage'), ORDER_MODELS_BY_COUNT_KEY, value);
    }
  }),

  sortByName: sort('filtered', 'sortByNameProp'),

  sortByDescCount: sort('filtered', 'sortByDescCountProp'),

  filtered: computed('model.@each.count', 'hideEmptyModelTypes', function() {
    return this.get('model').filter(item => {
      let hideEmptyModels = get(this, 'hideEmptyModelTypes');

      if (hideEmptyModels) {
        return !!get(item, 'count');
      } else {
        return true;
      }
    });
  })
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
