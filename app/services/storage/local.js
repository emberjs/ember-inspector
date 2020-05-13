import Service from '@ember/service';

export let LOCAL_STORAGE_SUPPORTED = false;

/**
 * Service that wraps local storage. Only store strings. This
 * is not intended to be used directly, use StorageServeice
 * instead.
 *
 * @class LocalStorageService
 * @extends Service
 */
export default class LocalStorageService extends Service {
  /**
   * Reads a stored string for a give key, if any.
   *
   * @method getItem
   * @param  {String} key
   * @return {Option<String>} The value, if found
   */
  getItem(key) {
    return localStorage.getItem(key);
  }

  /**
   * Store a string for a given key.
   *
   * @method setItem
   * @param {String} key
   * @param {String} value
   */
  setItem(key, value) {
    localStorage.setItem(key, value);
  }

  /**
   * Deletes the stored string for a given key.
   *
   * @method removeItem
   * @param  {String} key
   */
  removeItem(key) {
    localStorage.removeItem(key);
  }

  /**
   * Returns the list of stored keys.
   *
   * @method keys
   * @return {Array<String>} The array of keys
   */
  keys() {
    let keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  }
}

try {
  localStorage.setItem('test', 'testing');
  LOCAL_STORAGE_SUPPORTED = localStorage.getItem('test') === 'testing';
} catch (e) {
  // ignore
} finally {
  try {
    localStorage.removeItem('test');
  } catch (e) {
    // ignore
  }
}
