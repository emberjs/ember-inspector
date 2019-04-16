import { computed } from '@ember/object';
import Component from '@ember/component';
import { readOnly, sort } from '@ember/object/computed';

export default Component.extend({
  /**
   * mixinDetails controller passed through the template
   *
   * @property mixinDetails
   * @type {Ember.Controller}
   */
  mixinDetails: null,

  objectId: readOnly('mixinDetails.model.objectId'),

  isExpanded: computed('model.expand', 'model.properties.length', function() {
    return this.get('model.expand') && this.get('model.properties.length') > 0;
  }),

  /**
   * Sort the properties by name to make them easier to find in the object inspector.
   *
   * @property sortedProperties
   * @type {Array<Object>}
   */
  sortedProperties: sort('model.properties', 'sortProperties'),

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

  actions: {
    calculate({ name }) {
      let objectId = this.get('objectId');
      let mixinIndex = this.get('mixinDetails.model.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:calculate', {
        objectId,
        mixinIndex,
        property: name
      });
    },

    sendToConsole({ name }) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:sendToConsole', {
        objectId,
        property: name
      });
    },

    toggleExpanded() {
      this.toggleProperty('model.expand');
    },

    digDeeper({ name }) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:digDeeper', {
        objectId,
        property: name
      });
    },

    saveProperty(property, value, dataType) {
      this.get('port').send('objectInspector:saveProperty', {
        objectId: this.get('objectId'),
        property,
        value,
        dataType
      });
    }
  }
});
