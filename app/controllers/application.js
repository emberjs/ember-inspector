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
    this.get('port').send('releaseObject', { objectId: item.objectId });
  },

  activateMixinDetails: function(name, details, objectId) {
    var self = this;
    var objects = this.get('controllers.mixinStack').forEach(function(item) {
      this.get('port').send('releaseObject', { objectId: objectId });
    });

    this.set('controllers.mixinStack.model', []);
    this.pushMixinDetails(name, undefined, objectId, details);
  }
});

export = ApplicationController;
