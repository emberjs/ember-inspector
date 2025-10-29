import Service, { inject as service } from '@ember/service';
import { LOCAL_STORAGE_SUPPORTED } from './storage/local';
import type LocalStorageService from './storage/local';
import type MemoryStorageService from './storage/memory';
import { tracked } from '@glimmer/tracking';


/**
 * Service that wraps either the LocalStorageService or
 * MemoryStorageService (depending on availability) and
 * provide support for storing (JSON-serializable) objects
 * on top of the lower level backends.
 */
export default class StorageService extends Service {
  @service(LOCAL_STORAGE_SUPPORTED ? 'storage/local' : 'storage/memory')
  declare backend: LocalStorageService | MemoryStorageService;
  @tracked trackedBackend = {
    setItem: (k: string, v: string) => {
      this.backend.setItem(k, v);
      this.trackedBackend = { ...this.trackedBackend };
    },
    removeItem: (k: string) => {
      this.backend.removeItem(k);
      this.trackedBackend = { ...this.trackedBackend };
    },
    getItem: (k: string) => this.backend.getItem(k),
    keys: () => this.backend.keys(),
  };

  /**
   * Reads a stored object for a give key, if any.
   *
   * @return {Option<String>} The value, if found
   */
  getItem(key: keyof object) {
    const serialized = this.trackedBackend.getItem(key);

    if (serialized === null) {
      // Actual `null` values would have been serialized as `"null"`
      return undefined;
    } else {
      return JSON.parse(serialized as string) as string;
    }
  }

  /**
   * Store a string for a given key.
   */
  setItem(key: keyof object, value: string) {
    if (value === undefined) {
      this.removeItem(key);
    } else {
      const serialized = JSON.stringify(value);
      this.trackedBackend.set(key, serialized);
    }
  }

  /**
   * Deletes the stored string for a given key.
   */
  removeItem(key: keyof object) {
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
