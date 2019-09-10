import Component from '@ember/component';
import { sort } from '@ember/object/computed';

export default Component.extend({
  tagName: '',

  /**
   * Sort the properties by name to make them easier to find in the object inspector.
   *
   * @property sortedProperties
   * @type {Array<Object>}
   */
  sortedProperties: sort('properties', 'sortProperties'),

  init() {
    this._super(...arguments);

    /**
     * Used by the `sort` computed macro.
     *
     * @property sortProperties
     * @type {Array<String>}
     */
    this.sortProperties = ['name'];
  },
});

