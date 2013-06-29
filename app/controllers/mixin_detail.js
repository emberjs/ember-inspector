var MixinDetailController = Ember.ObjectController.extend({
  needs: ['mixinDetails'],

  isExpanded: Ember.computed.equal('model.name', 'Own Properties'),

  digDeeper: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    this.get('port').send('digDeeper', {
      objectId: objectId,
      property: property.name
    });
  },

  calculate: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
    this.get('port').send('calculate', {
      objectId: objectId,
      property: property.name,
      mixinIndex: mixinIndex
    });
  }
});

export = MixinDetailController;
