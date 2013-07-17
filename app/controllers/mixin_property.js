var MixinPropertyController = Ember.ObjectController.extend({
  isCalculated: function() {
    return this.get('value.type') !== 'type-descriptor';
  }.property('value.type')
});

export = MixinPropertyController;
