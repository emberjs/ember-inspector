import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { equal } from '@ember/object/computed';
import { debounce, schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';

import { TrackedArray } from 'tracked-built-ins';

export default class ApplicationController extends Controller {
  /**
   * Service used to broadcast changes to the application's layout
   * such as toggling of the object inspector.
   *
   * @property layoutService
   * @type {Service}
   */
  @service('layout') layoutService;
  @service port;

  // Indicates that the extension window is focused,
  @tracked active = true;
  @tracked isDragging = false;
  @tracked contentHeight = null;
  @tracked deprecationCount = 0;
  @tracked inspectorExpanded = false;
  @tracked inspectorWidth = 360;
  /**
   * Indicates if the inspector has detected an ember app.
   *
   * @type {Boolean}
   */
  isEmberApplication = false;
  @tracked _navWidthExpanded = 180;
  @tracked _navWidthCollapsed = 48;
  @tracked navIsCollapsed = false;

  get navWidth() {
    return this.navIsCollapsed
      ? this._navWidthCollapsed
      : this._navWidthExpanded;
  }

  set navWidth(value) {
    this._navWidthExpanded = value;
  }

  @equal('port.adapter.name', 'chrome')
  isChrome;

  constructor() {
    super(...arguments);

    this.mixinStack = new TrackedArray([]);
    this.mixinDetails = [];
  }

  /*
   * Called when digging deeper into object stack
   * from within the ObjectInspector
   */
  @action
  pushMixinDetails(name, property, objectId, details, errors) {
    details = {
      name,
      property,
      objectId,
      mixins: details,
      errors,
    };

    this.mixinStack.push(details);
    this.set('mixinDetails', details);
  }

  @action
  popMixinDetails() {
    const item = this.mixinStack.pop();
    this.set('mixinDetails', this.mixinStack.at(-1));
    this.port.send('objectInspector:releaseObject', {
      objectId: item.objectId,
    });
  }

  @action
  showInspector() {
    if (this.inspectorExpanded === false) {
      this.set('inspectorExpanded', true);
      // Broadcast that tables have been resized (used by `x-list`).
      schedule('afterRender', () => {
        this.layoutService.trigger('resize', { source: 'object-inspector' });
      });
    }
  }

  @action
  hideInspector() {
    if (this.inspectorExpanded === true) {
      this.set('inspectorExpanded', false);
      // Broadcast that tables have been resized (used by `x-list`).
      schedule('afterRender', () => {
        this.layoutService.trigger('resize', { source: 'object-inspector' });
      });
    }
  }

  @action
  toggleInspector() {
    if (this.inspectorExpanded) {
      this.hideInspector();
    } else {
      this.showInspector();
    }
  }

  @action
  setActive(bool) {
    schedule('afterRender', () => {
      this.set('active', bool);
    });
  }

  @action
  setupContentElement(element) {
    this.contentElement = element;
    this.layoutService.updateContentHeight(this.contentElement.clientHeight);
  }

  @action
  _windowDidResize() {
    schedule('afterRender', () => {
      if (!this.isDestroyed && !this.isDestroying) {
        this.layoutService.trigger('resize', {
          source: 'application-controller',
        });

        if (this.contentElement) {
          this.layoutService.updateContentHeight(
            this.contentElement.clientHeight,
          );
        }
      }
    });
  }

  @action
  windowDidResize() {
    debounce(this, this._windowDidResize, 250);
  }

  @action
  toggleNavCollapsed() {
    this.set('navIsCollapsed', !this.navIsCollapsed);
    schedule('afterRender', () => {
      this.layoutService.trigger('resize', { source: 'navigation' });
    });
  }

  /*
   * Called when inspecting an object from outside of the ObjectInspector
   */
  @action
  activateMixinDetails(name, objectId, details, errors) {
    this.mixinStack.forEach((item) => {
      this.port.send('objectInspector:releaseObject', {
        objectId: item.objectId,
      });
    });

    this.set('mixinStack', new TrackedArray([]));
    this.pushMixinDetails(name, undefined, objectId, details, errors);
  }

  @action
  droppedObject(objectId) {
    let obj = this.mixinStack.find((mixin) => mixin.objectId === objectId);
    if (obj) {
      let index = this.mixinStack.indexOf(obj);
      let objectsToRemove = new TrackedArray([]);
      for (let i = index; i >= 0; i--) {
        objectsToRemove.push(this.mixinStack.at(i));
      }
      objectsToRemove.forEach((item) => {
        const index = this.mixinStack.indexOf(item);
        if (index !== -1) {
          this.mixinStack.splice(index, 1);
        }
      });
    }
    if (this.mixinStack.length > 0) {
      this.set('mixinDetails', this.mixinStack.at(-1));
    } else {
      this.set('mixinDetails', null);
    }
  }
}
