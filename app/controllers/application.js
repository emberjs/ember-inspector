import Ember from "ember";
const { computed: { equal }, inject } = Ember;

export default Ember.Controller.extend({
  mixinStack: inject.controller('mixin-stack'),
  mixinDetails: inject.controller('mixin-details'),

  emberApplication: false,
  navWidth: 180,
  inspectorWidth: 360,
  isChrome: equal('port.adapter.name', 'chrome'),

  deprecationCount: 0,

  // Indicates that the extension window is focused,
  active: true,

  inspectorExpanded: false,

  pushMixinDetails(name, property, objectId, details, errors) {
    details = {
      name,
      property,
      objectId,
      mixins: details,
      errors
    };

    this.get('mixinStack.model').pushObject(details);
    this.set('mixinDetails.model', details);
  },

  popMixinDetails() {
    let mixinStack = this.get('mixinStack.model');
    let item = mixinStack.popObject();
    this.set('mixinDetails.model', mixinStack.get('lastObject'));
    this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
  },

  activateMixinDetails(name, objectId, details, errors) {
    this.get('mixinStack.model').forEach(item => {
      this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
    });

    this.set('mixinStack.model', []);
    this.pushMixinDetails(name, undefined, objectId, details, errors);
  },

  droppedObject(objectId) {
    let mixinStack = this.get('mixinStack.model');
    let obj = mixinStack.findBy('objectId', objectId);
    if (obj) {
      let index = mixinStack.indexOf(obj);
      let objectsToRemove = [];
      for (let i = index; i >= 0; i--) {
        objectsToRemove.pushObject(mixinStack.objectAt(i));
      }
      objectsToRemove.forEach(item => {
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
