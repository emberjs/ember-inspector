import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { debounce, schedule } from '@ember/runloop';
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
  port: service(),

  isDragging: false,
  contentHeight: null,

  /**
   * Indicates if the inspector has detected an ember app.
   *
   * @type {Boolean}
   */
  isEmberApplication: false,

  _navWidthExpanded: 180,
  _navWidthCollapsed: 48,
  navIsCollapsed: false,
  navWidth: computed(
    '_navWidthExpanded',
    '_navWidthCollapsed',
    'navIsCollapsed',
    {
      get() {
        return this.navIsCollapsed
          ? this._navWidthCollapsed
          : this._navWidthExpanded;
      },
      set(key, value) {
        this.set('_navWidthExpanded', value);
        return value;
      },
    }
  ),

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

  /*
   * Called when digging deeper into object stack
   * from within the ObjectInspector
   */
  pushMixinDetails(name, property, objectId, details, errors) {
    details = {
      name,
      property,
      objectId,
      mixins: details,
      errors,
    };

    this.mixinStack.pushObject(details);
    this.set('mixinDetails', details);
  },

  popMixinDetails: action(function () {
    let mixinStack = this.mixinStack;
    let item = mixinStack.popObject();
    this.set('mixinDetails', mixinStack.get('lastObject'));
    this.port.send('objectInspector:releaseObject', {
      objectId: item.objectId,
    });
  }),

  showInspector: action(function () {
    if (this.inspectorExpanded === false) {
      this.set('inspectorExpanded', true);
      // Broadcast that tables have been resized (used by `x-list`).
      schedule('afterRender', () => {
        this.layoutService.trigger('resize', { source: 'object-inspector' });
      });
    }
  }),

  hideInspector: action(function () {
    if (this.inspectorExpanded === true) {
      this.set('inspectorExpanded', false);
      // Broadcast that tables have been resized (used by `x-list`).
      schedule('afterRender', () => {
        this.layoutService.trigger('resize', { source: 'object-inspector' });
      });
    }
  }),

  toggleInspector: action(function () {
    if (this.inspectorExpanded) {
      this.hideInspector();
    } else {
      this.showInspector();
    }
  }),

  setActive: action(function (bool) {
    schedule('afterRender', () => {
      this.set('active', bool);
    });
  }),

  setupContentElement: action(function (element) {
    this.contentElement = element;
    this.layoutService.updateContentHeight(this.contentElement.clientHeight);
  }),

  _windowDidResize: action(function () {
    schedule('afterRender', () => {
      if (!this.isDestroyed && !this.isDestroying) {
        this.layoutService.trigger('resize', {
          source: 'application-controller',
        });

        if (this.contentElement) {
          this.layoutService.updateContentHeight(
            this.contentElement.clientHeight
          );
        }
      }
    });
  }),

  windowDidResize: action(function () {
    debounce(this, this._windowDidResize, 250);
  }),

  toggleNavCollapsed: action(function () {
    this.set('navIsCollapsed', !this.navIsCollapsed);
    schedule('afterRender', () => {
      this.layoutService.trigger('resize', { source: 'navigation' });
    });
  }),

  /*
   * Called when inspecting an object from outside of the ObjectInspector
   */
  activateMixinDetails(name, objectId, details, errors) {
    this.mixinStack.forEach((item) => {
      this.port.send('objectInspector:releaseObject', {
        objectId: item.objectId,
      });
    });

    this.set('mixinStack', []);
    this.pushMixinDetails(name, undefined, objectId, details, errors);
  },

  droppedObject(objectId) {
    let mixinStack = this.mixinStack;
    let obj = mixinStack.findBy('objectId', objectId);
    if (obj) {
      let index = mixinStack.indexOf(obj);
      let objectsToRemove = [];
      for (let i = index; i >= 0; i--) {
        objectsToRemove.pushObject(mixinStack.objectAt(i));
      }
      objectsToRemove.forEach((item) => {
        mixinStack.removeObject(item);
      });
    }
    if (mixinStack.get('length') > 0) {
      this.set('mixinDetails', mixinStack.get('lastObject'));
    } else {
      this.set('mixinDetails', null);
    }
  },
});
