import Service from '@ember/service';

/**
 * Service that wraps an in-memory object with the same APIs as
 * the LocalStorageService, usually as a fallback. Only store
 * strings. This is not intended to be used directly, use
 * StorageServeice instead.
 *
 * @class MemoryStorageService
 * @extends Service
 */
export default class MemoryStorageService extends Service {
  /**
   * Where data is stored.
   *
   * @property store
   * @type {Object}
   * @private
   */
  store = Object.create(null);

  /**
   * Reads a stored string for a give key, if any.
   *
   * @method getItem
   * @param  {String} key
   * @return {Option<String>} The value, if found
   */
  getItem(key) {
    if (key in this.store) {
      return this.store[key];
    } else {
      return null;
    }
  }

  /**
   * Store a string for a given key.
   *
   * @method setItem
   * @param {String} key
   * @param {String} value
   */
  setItem(key, value) {
    this.store[key] = value;
  }

  /**
   * Deletes the stored string for a given key.
   *
   * @method removeItem
   * @param  {String} key
   */
  removeItem(key) {
    delete this.store[key];
  }

  /**
   * Returns the list of stored keys.
   *
   * @method keys
   * @return {Array<String>} The array of keys
   */
  keys() {
    return Object.keys(this.store);
  }
}
