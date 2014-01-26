var oneWay = Ember.computed.oneWay;

export default Ember.ObjectController.extend({
  needs: ['mixin-details'],

  mixinDetails: oneWay('controllers.mixin-details').readOnly(),
  objectId: oneWay('mixinDetails.objectId').readOnly(),

  isExpanded: function() {
    return this.get('model.expand') && this.get('model.properties.length') > 0;
  }.property('model.expand', 'model.properties.length'),

  actions: {
    calculate: function(property) {
      var objectId = this.get('objectId');
      var mixinIndex = this.get('mixinDetails.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:calculate', {
        objectId: objectId,
        property: property.name,
        mixinIndex: mixinIndex
      });
    },

    sendToConsole: function(property) {
      var objectId = this.get('objectId');

      this.get('port').send('objectInspector:sendToConsole', {
        objectId: objectId,
        property: property.name
      });
    },

    toggleExpanded: function() {
      this.toggleProperty('isExpanded');
    },

    digDeeper: function(property) {
      var objectId = this.get('objectId');

      this.get('port').send('objectInspector:digDeeper', {
        objectId: objectId,
        property: property.name
      });
    },

    saveProperty: function(prop, val) {
      var mixinIndex = this.get('mixinDetails.mixins').indexOf(this.get('model'));

      this.get('port').send('objectInspector:saveProperty', {
        objectId: this.get('objectId'),
        property: prop,
        value: val,
        mixinIndex: mixinIndex
      });
    }
  }
});
