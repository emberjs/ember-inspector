var MixinDetailController = Ember.ObjectController.extend({
  needs: ['mixinDetails'],

  isExpanded: Ember.computed.equal('model.name', 'Own Properties'),

  digDeeper: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    this.get('port').send('objectInspector:digDeeper', {
      objectId: objectId,
      property: property.name
    });
  },

  calculate: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
    this.get('port').send('objectInspector:calculate', {
      objectId: objectId,
      property: property.name,
      mixinIndex: mixinIndex
    });
  },

  sendToConsole: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    this.get('port').send('objectInspector:sendToConsole', {
      objectId: objectId,
      property: property.name
    });
  }
});

export = MixinDetailController;
