import Service from '@ember/service';

export let LOCAL_STORAGE_SUPPORTED = false;

/**
 * Service that wraps local storage. Only store strings. This
 * is not intended to be used directly, use StorageServeice
 * instead.
 */
export default class LocalStorageService extends Service {
  /**
   * Reads a stored string for a give key, if any.
   *
   * @return {Option<String>} The value, if found
   */
  getItem(key: string) {
    return localStorage.getItem(key);
  }

  /**
   * Store a string for a given key.
   */
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  /**
   * Deletes the stored string for a given key.
   */
  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  /**
   * Returns the list of stored keys.
   *
   * @return The array of keys
   */
  keys() {
    const keys = [];
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
