import Service from '@ember/service';

/**
 * Service that wraps an in-memory object with the same APIs as
 * the LocalStorageService, usually as a fallback. Only store
 * strings. This is not intended to be used directly, use
 * StorageService instead.
 */
export default class MemoryStorageService extends Service {
  /**
   * Where data is stored.
   *
   * @private
   */
  store = Object.create(null);

  /**
   * Reads a stored string for a give key, if any.
   *
   * @return {Option<String>} The value, if found
   */
  getItem(key: string) {
    if (key in this.store) {
      return this.store[key];
    } else {
      return null;
    }
  }

  /**
   * Store a string for a given key.
   */
  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  /**
   * Deletes the stored string for a given key.
   */
  removeItem(key: string) {
    delete this.store[key];
  }

  /**
   * Returns the list of stored keys.
   *
   * @return The array of keys
   */
  keys() {
    return Object.keys(this.store);
  }
}
