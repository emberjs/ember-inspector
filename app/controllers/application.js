import Controller from '@ember/controller';
import { equal } from '@ember/object/computed';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default Controller.extend({
  /**
   * Service used to broadcast changes to the application's layout
   * such as toggling of the object inspector.
   *
   * @property layoutService
   * @type {Service}
   */
  layoutService: service('layout'),

  isDragging: false,
  contentHeight: null,

  /**
   * Indicates if the inspector has detected an ember app.
   *
   * @type {Boolean}
   */
  isEmberApplication: false,

  navWidth: 180,
  inspectorWidth: 360,
  isChrome: equal('port.adapter.name', 'chrome'),

  deprecationCount: 0,

  // Indicates that the extension window is focused,
  active: true,

  inspectorExpanded: false,

  init() {
    this._super(...arguments);

    this.mixinStack = [];
    this.mixinDetails = [];
  },

  pushMixinDetails(name, property, objectId, details, errors) {
    details = {
      name,
      property,
      objectId,
      mixins: details,
      errors
    };

    this.get('mixinStack').pushObject(details);
    this.set('mixinDetails', details);
  },

  popMixinDetails() {
    let mixinStack = this.get('mixinStack');
    let item = mixinStack.popObject();
    this.set('mixinDetails', mixinStack.get('lastObject'));
    this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
  },

  activateMixinDetails(name, objectId, details, errors) {
    this.get('mixinStack').forEach(item => {
      this.get('port').send('objectInspector:releaseObject', { objectId: item.objectId });
    });

    this.set('mixinStack', []);
    this.pushMixinDetails(name, undefined, objectId, details, errors);
  },

  droppedObject(objectId) {
    let mixinStack = this.get('mixinStack');
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
      this.set('mixinDetails', mixinStack.get('lastObject'));
    } else {
      this.set('mixinDetails', null);
    }

  },

  actions: {
    setIsDragging(isDragging) {
      this.set('isDragging', isDragging);
    },

    toggleInspector() {
      this.toggleProperty('inspectorExpanded');
      // Broadcast that tables have been resized (used by `x-list`).
      schedule('afterRender', () => {
        this.get('layoutService').trigger('resize', { source: 'object-inspector' });
      });
    }
  }
});
