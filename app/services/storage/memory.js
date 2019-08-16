/**
 * Service that manages storage in memory. Usually as a fallback
 * for local storage.
 *
 * @class Memory
 * @extends Service
 */
import Service from '@ember/service';

const { keys } = Object;

export default Service.extend({
  init() {
    this._super(...arguments);

    /**
     * Where data is stored.
     *
     * @property hash
     * @type {Object}
     */
    this.hash = {};
  },

  /**
   * Reads a stored item.
   *
   * @method getItem
   * @param  {String} key The cache key
   * @return {Object}     The stored value
   */
  getItem(key) {
    return this.hash[key];
  },

  /**
   * Stores an item in memory.
   *
   * @method setItem
   * @param {String} key The cache key
   * @param {Object} value The item
   */
  setItem(key, value) {
    this.hash[key] = value;
  },

  /**
   * Deletes an entry from memory storage.
   *
   * @method removeItem
   * @param  {String} key The cache key
   */
  removeItem(key) {
    delete this.hash[key];
  },

  /**
   * Returns the list keys of saved entries in memory.
   *
   * @method keys
   * @return {Array}  The array of keys
   */
  keys() {
    return keys(this.hash);
  }
});
