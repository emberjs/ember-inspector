import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { sort } from '@ember/object/computed';

export default Component.extend({
  /**
   * Sort the properties by name to make them easier to find in the object inspector.
   *
   * @property sortedAllProperties
   * @type {Array<Object>}
   */
  sortedAllProperties: sort('allProperties', 'sortProperties'),

  allProperties: computed('model', function () {
    const props = this.get('model.mixins').map(function (mixin) {
      return mixin.properties.filter(function (p) {
        return !p.hasOwnProperty('overridden');
      });
    });

    return props.flat();
  }),

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

  traceErrors: action(function () {
    this.get('port').send('objectInspector:traceErrors', {
      objectId: this.get('model.objectId')
    });
  }),
});
