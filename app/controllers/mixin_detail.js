var MixinDetailController = Ember.ObjectController.extend({
  needs: ['mixinDetails'],

  isExpanded: function() {
    return this.get('model.name') === 'Own Properties';
  }.property('model.name'),

  digDeeper: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    window.digDeeper(objectId, property);
  },

  calculate: function(property) {
    var objectId = this.get('controllers.mixinDetails.objectId');
    var mixinIndex = this.get('controllers.mixinDetails.mixins').indexOf(this.get('model'));
    window.calculate(objectId, property, mixinIndex);
  }
});

export = MixinDetailController;
