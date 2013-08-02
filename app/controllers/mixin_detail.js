var MixinDetailController = Ember.ObjectController.extend({
  needs: ['mixinDetails'],

  isExpanded: function() {
    return this.get('model.expand') && this.get('model.properties.length') > 0;
  }.property('model.expand', 'model.properties.length'),

  objectId: Ember.computed.alias('controllers.mixinDetails.objectId'),

  digDeeper: function(property) {
    var objectId = this.get('objectId');
    this.get('port').send('objectInspector:digDeeper', {
      objectId: objectId,
      property: property.name
    });
  },

  calculate: function(property) {
    var objectId = this.get('objectId');
    var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
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

  saveProperty: function(prop, val) {
    var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
    this.get('port').send('objectInspector:saveProperty', {
      objectId: this.get('objectId'),
      property: prop,
      value: val,
      mixinIndex: mixinIndex
    });
  }
});

export = MixinDetailController;
