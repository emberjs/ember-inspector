var ApplicationController = Ember.Controller.extend({
  needs: ['mixinStack', 'mixinDetails'],

  emberApplication: false,
  isDragging: false,
  inspectorWidth: null,

  // Indicates that the extension window is focused,
  active: true,

  inspectorExpanded: false,

  pushMixinDetails: function(name, property, objectId, details) {
    details = { name: name, property: property, objectId: objectId, mixins: details };
    this.get('controllers.mixinStack').pushObject(details);
    this.set('controllers.mixinDetails.model', details);
  },

  popMixinDetails: function() {
    var mixinStack = this.get('controllers.mixinStack');
    var item = mixinStack.popObject();
    this.set('controllers.mixinDetails.model', mixinStack.get('lastObject'));
    this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
  },

  activateMixinDetails: function(name, details, objectId) {
    var self = this;
    var objects = this.get('controllers.mixinStack').forEach(function(item) {
      self.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
    });

    this.set('controllers.mixinStack.model', []);
    this.pushMixinDetails(name, undefined, objectId, details);
  },

  droppedObject: function(objectId) {
    var mixinStack = this.get('controllers.mixinStack.model');
    var obj = mixinStack.findProperty('objectId', objectId);
    if (obj) {
      var index = mixinStack.indexOf(obj);
      var objectsToRemove = [];
      for(var i = index; i >= 0; i--) {
        objectsToRemove.pushObject(mixinStack.objectAt(i));
      }
      objectsToRemove.forEach(function(item) {
        mixinStack.removeObject(item);
      });
    }
    if (mixinStack.get('length') > 0) {
      this.set('controllers.mixinDetails.model', mixinStack.get('lastObject'));
    } else {
      this.set('controllers.mixinDetails.model', null);
    }

  }
});

export default ApplicationController;
