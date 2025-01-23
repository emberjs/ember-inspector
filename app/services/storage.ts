import Service, { inject as service } from '@ember/service';
import { LOCAL_STORAGE_SUPPORTED } from './storage/local';
import type LocalStorageService from './storage/local';
import type MemoryStorageService from './storage/memory';

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
  declare backend: LocalStorageService | MemoryStorageService;

  /**
   * Reads a stored object for a give key, if any.
   *
   * @return {Option<String>} The value, if found
   */
  getItem(key: string) {
    const serialized = this.backend.getItem(key);

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
  setItem(key: string, value: string) {
    if (value === undefined) {
      this.removeItem(key);
    } else {
      const serialized = JSON.stringify(value);
      this.backend.setItem(key, serialized);
    }
  }

  /**
   * Deletes the stored string for a given key.
   */
  removeItem(key: string) {
    this.backend.removeItem(key);
  }

  /**
   * Returns the list of stored keys.
   *
   * @return {Array<String>} The array of keys
   */
  keys() {
    return this.backend.keys();
  }
}
