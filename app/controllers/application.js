var ApplicationController = Ember.Controller.extend({
  needs: ['mixinStack', 'mixinDetails'],

  pushMixinDetails: function(name, property, objectId, details) {
    details = { name: name, property: property, objectId: objectId, mixins: details };
    this.get('controllers.mixinStack').pushObject(details);
    this.set('controllers.mixinDetails.model', details);
  },

  popMixinDetails: function() {
    var mixinStack = this.get('controllers.mixinStack');
    var item = mixinStack.popObject();
    this.set('controllers.mixinDetails.model', mixinStack.get('lastObject'));
    window.releaseObject(item.objectId);
  },

  activateMixinDetails: function(name, details, objectId) {
    var objects = this.get('controllers.mixinStack').forEach(function(item) {
      window.releaseObject(item.objectId);
    });

    this.set('controllers.mixinStack.model', []);
    this.pushMixinDetails(name, undefined, objectId, details);
  }
});

export = ApplicationController;
