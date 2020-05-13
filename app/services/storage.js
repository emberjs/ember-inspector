import Service, { inject as service } from '@ember/service';
import { LOCAL_STORAGE_SUPPORTED } from './storage/local';

/**
 * Service that wraps either the LocalStorageService or
 * MemoryStorageService (depending on availability) and
 * provide support for storing (JSON-serializable) objects
 * on top of the lower level backends.
 *
 * @class StorageService
 * @extends Service
 */
export default class StorageService extends Service {
  @service(LOCAL_STORAGE_SUPPORTED ? 'storage/local' : 'storage/memory')
  backend;

  /**
   * Reads a stored object for a give key, if any.
   *
   * @method getItem
   * @param  {String} key
   * @return {Option<String>} The value, if found
   */
  getItem(key) {
    let serialized = this.backend.getItem(key);

    if (serialized === null) {
      // Actual `null` values would have been serialized as `"null"`
      return undefined;
    } else {
      return JSON.parse(serialized);
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
    if (value === undefined) {
      this.removeItem(key);
    } else {
      let serialized = JSON.stringify(value);
      this.backend.setItem(key, serialized);
    }
  }

  /**
   * Deletes the stored string for a given key.
   *
   * @method removeItem
   * @param  {String} key
   */
  removeItem(key) {
    this.backend.removeItem(key);
  }

  /**
   * Returns the list of stored keys.
   *
   * @method keys
   * @return {Array<String>} The array of keys
   */
  keys() {
    return this.backend.keys();
  }
}
