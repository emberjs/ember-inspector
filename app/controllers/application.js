var oneWay = Ember.computed.oneWay;

export default Ember.Controller.extend({
  needs: ['mixin-stack', 'mixin-details'],

  emberApplication: false,
  isDragging: false,
  inspectorWidth: null,
  mixinStack: oneWay('controllers.mixin-stack').readOnly(),
  mixinDetails: oneWay('controllers.mixin-details').readOnly(),

  // Indicates that the extension window is focused,
  active: true,

  inspectorExpanded: false,

  pushMixinDetails: function(name, property, objectId, details) {
    details = {
      name: name,
      property: property,
      objectId: objectId,
      mixins: details
    };

    this.get('mixinStack').pushObject(details);
    this.set('mixinDetails.model', details);
  },

  popMixinDetails: function() {
    var mixinStack = this.get('controllers.mixin-stack');
    var item = mixinStack.popObject();
    this.set('mixinDetails.model', mixinStack.get('lastObject'));
    this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
  },

  activateMixinDetails: function(name, details, objectId) {
    var self = this;
    var objects = this.get('mixinStack').forEach(function(item) {
      self.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
    });

    this.set('mixinStack.model', []);
    this.pushMixinDetails(name, undefined, objectId, details);
  },

  droppedObject: function(objectId) {
    var mixinStack = this.get('mixinStack.model');
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
      this.set('mixinDetails.model', mixinStack.get('lastObject'));
    } else {
      this.set('mixinDetails.model', null);
    }

  }
});
