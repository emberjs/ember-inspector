var MixinDetailController = Ember.ObjectController.extend({
  needs: ['mixinDetails'],

  isExpanded: function() {
    return this.get('model.name') === 'Own Properties';
  }.property('model.name'),

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
