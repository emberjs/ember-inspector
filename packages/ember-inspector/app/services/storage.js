import Service, { service } from '@ember/service';
import { LOCAL_STORAGE_SUPPORTED } from './storage/local';
import { tracked } from '@glimmer/tracking';

/**
 * Service that wraps either the LocalStorageService or
 * MemoryStorageService (depending on availability) and
 * provide support for storing (JSON-serializable) objects
 * on top of the lower level backends.
 */
export default class StorageService extends Service {
  @service(LOCAL_STORAGE_SUPPORTED ? 'storage/local' : 'storage/memory')
  backend;
  @tracked trackedBackend = {
    setItem: (k, v) => {
      this.backend.setItem(k, v);
      this.trackedBackend = { ...this.trackedBackend };
    },
    removeItem: (k) => {
      this.backend.removeItem(k);
      this.trackedBackend = { ...this.trackedBackend };
    },
    getItem: (k) => this.backend.getItem(k),
    keys: () => this.backend.keys(),
  };

  /**
   * Reads a stored object for a give key, if any.
   *
   * @return {Option<String>} The value, if found
   */
  getItem(key) {
    const serialized = this.trackedBackend.getItem(key);

    if (serialized === null) {
      // Actual `null` values would have been serialized as `"null"`
      return undefined;
    } else {
      return JSON.parse(serialized);
    }
  }

  /**
   * Store a string for a given key.
   */
  setItem(key, value) {
    if (value === undefined) {
      this.removeItem(key);
    } else {
      const serialized = JSON.stringify(value);
      this.trackedBackend.setItem(key, serialized);
    }
  }

  /**
   * Deletes the stored string for a given key.
   */
  removeItem(key) {
    this.trackedBackend.removeItem(key);
  }

  /**
   * Returns the list of stored keys.
   *
   * @return {Array<String>} The array of keys
   */
  keys() {
    return this.trackedBackend.keys();
  }
}
