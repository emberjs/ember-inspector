import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const HIDE_EMPTY_MODELS_KEY = 'are-model-types-hidden';
const ORDER_MODELS_BY_COUNT_KEY = 'are-models-ordered-by-record-count';

export default class ModelTypesController extends Controller {
  @service port;
  @service router;
  @service storage;

  navWidth = 180;

  get hideEmptyModelTypes() {
    return getStoredPropertyValue(this.storage, HIDE_EMPTY_MODELS_KEY);
  }

  set hideEmptyModelTypes(value) {
    handleSettingProperty(this.storage, HIDE_EMPTY_MODELS_KEY, value);
  }

  get orderByRecordCount() {
    return getStoredPropertyValue(this.storage, ORDER_MODELS_BY_COUNT_KEY);
  }

  set orderByRecordCount(value) {
    handleSettingProperty(this.storage, ORDER_MODELS_BY_COUNT_KEY, value);
  }

  get sortByName() {
    return this.filtered.toSorted((a, b) => a.name.localeCompare(b.name));
  }

  get sortByDescCount() {
    return this.filtered.toSorted((a, b) => b.count - a.count);
  }

  get filtered() {
    return this.model.filter((item) => {
      let hideEmptyModels = this.hideEmptyModelTypes;

      if (hideEmptyModels) {
        return !!item.count;
      } else {
        return true;
      }
    });
  }

  @action
  getStore() {
    this.port.send('objectInspector:inspectByContainerLookup', {
      name: 'service:store',
    });
  }

  @action
  refresh() {
    this.router.refresh('model-types');
  }
}

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
