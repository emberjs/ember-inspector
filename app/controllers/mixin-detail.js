import Ember from "ember";
const { computed } = Ember;
const { oneWay } = computed;

export default Ember.ObjectController.extend({
  needs: ['mixin-details'],

  mixinDetails: oneWay('controllers.mixin-details').readOnly(),
  objectId: oneWay('mixinDetails.model.objectId').readOnly(),

  isExpanded: computed('model.expand', 'model.properties.length', function() {
    return this.get('model.expand') && this.get('model.properties.length') > 0;
  }),

  actions: {
    calculate: function(property) {
      let objectId = this.get('objectId');
      let mixinIndex = this.get('mixinDetails.model.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:calculate', {
        objectId: objectId,
        property: property.name,
        mixinIndex: mixinIndex
      });
    },

    sendToConsole: function(property) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:sendToConsole', {
        objectId: objectId,
        property: property.name
      });
    },

    toggleExpanded: function() {
      this.toggleProperty('isExpanded');
    },

    digDeeper: function(property) {
      let objectId = this.get('objectId');

      this.get('port').send('objectInspector:digDeeper', {
        objectId: objectId,
        property: property.name
      });
    },

    saveProperty: function(prop, val, type) {
      let mixinIndex = this.get('mixinDetails.model.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:saveProperty', {
        objectId: this.get('objectId'),
        property: prop,
        value: val,
        mixinIndex: mixinIndex,
        dataType: type
      });
    }
  }
});
