import Ember from "ember";
const { computed: { readOnly, equal } } = Ember;

export default Ember.Controller.extend({
  needs: ['mixin-stack', 'mixin-details'],

  emberApplication: false,
  navWidth: 180,
  inspectorWidth: 360,
  mixinStack: readOnly('controllers.mixin-stack'),
  mixinDetails: readOnly('controllers.mixin-details'),
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

    this.get('mixinStack').pushObject(details);
    this.set('mixinDetails.model', details);
  },

  popMixinDetails() {
    let mixinStack = this.get('controllers.mixin-stack');
    let item = mixinStack.popObject();
    this.set('mixinDetails.model', mixinStack.get('lastObject'));
    this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
  },

  activateMixinDetails(name, objectId, details, errors) {
    this.get('mixinStack').forEach(item => {
      this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
    });

    this.set('mixinStack.model', []);
    this.pushMixinDetails(name, undefined, objectId, details, errors);
  },

  droppedObject(objectId) {
    let mixinStack = this.get('mixinStack.model');
    let obj = mixinStack.findProperty('objectId', objectId);
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
