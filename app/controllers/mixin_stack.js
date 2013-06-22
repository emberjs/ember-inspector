var MixinStackController = Ember.ArrayController.extend({
  needs: ['application'],

  trail: function() {
    var nested = this.slice(1);
    if (nested.length === 0) { return ""; }
    return "." + nested.mapProperty('property').join(".");
  }.property('[]'),

  isNested: function() {
    return this.get('length') > 1;
  }.property('[]'),

  popStack: function() {
    this.get('controllers.application').popMixinDetails();
  }
});

export = MixinStackController;
