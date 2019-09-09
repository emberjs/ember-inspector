import { action, computed } from '@ember/object';
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

  sendToConsole: action(function ({ name }) {
    let objectId = this.objectId;

    this.port.send('objectInspector:sendToConsole', {
      objectId,
      property: name
    });
  }),

  calculate: action(function ({ name }) {
    let objectId = this.objectId;
    let mixinIndex = this.get('mixinDetails.model.mixins').indexOf(this.model);

    this.port.send('objectInspector:calculate', {
      objectId,
      mixinIndex,
      property: name
    });
  }),

  actions: {
    digDeeper({ name }) {
      let objectId = this.objectId;

      this.port.send('objectInspector:digDeeper', {
        objectId,
        property: name
      });
    },

    saveProperty(property, value, dataType) {
      this.port.send('objectInspector:saveProperty', {
        objectId: this.objectId,
        property,
        value,
        dataType
      });
    }
  }
});
