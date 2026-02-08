import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce, schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';

import { TrackedArray, TrackedObject } from 'tracked-built-ins';

export default class ApplicationController extends Controller {
  @controller('component-tree') componentTreeController;

  /**
   * Service used to broadcast changes to the application's layout
   * such as toggling of the object inspector.
   */
  @service layout;
  @service port;

  // Indicates that the extension window is focused,
  @tracked active = true;
  @tracked isDragging = false;
  @tracked contentHeight = null;
  @tracked deprecationCount = 0;
  @tracked inspectorWidth = 360;
  /**
   * Indicates if the inspector has detected an ember app.
   */
  isEmberApplication = false;
  @tracked _navWidthExpanded = 180;
  @tracked _navWidthCollapsed = 48;
  @tracked navIsCollapsed = false;
  @tracked mixinDetails = new TrackedObject({});
  @tracked mixinStack = new TrackedArray([]);

  get navWidth() {
    return this.navIsCollapsed
      ? this._navWidthCollapsed
      : this._navWidthExpanded;
  }

  set navWidth(value) {
    this._navWidthExpanded = value;
  }

  get isChrome() {
    return this.port?.adapter?.name === 'chrome';
  }

  /*
   * Called when digging deeper into object stack
   * from within the ObjectInspector
   */
  @action
  pushMixinDetails(name, property, objectId, details, errors, renderNodeId) {
    details = {
      name,
      property,
      objectId,
      mixins: details,
      errors,
      renderNodeId,
    };

    this.mixinStack.push(details);
    this.mixinDetails = details;
  }

  @action
  popMixinDetails() {
    const item = this.mixinStack.pop();
    this.mixinDetails = this.mixinStack.at(-1);
    this.port.send('objectInspector:releaseObject', {
      objectId: item.objectId,
    });
  }

  @action
  setActive(bool) {
    // eslint-disable-next-line ember/no-runloop
    schedule('afterRender', () => {
      this.active = bool;
    });
  }

  @action
  setupContentElement(element) {
    this.contentElement = element;
    this.layout.updateContentHeight(this.contentElement.clientHeight);
  }

  @action
  _windowDidResize() {
    // eslint-disable-next-line ember/no-runloop
    schedule('afterRender', () => {
      if (!this.isDestroyed && !this.isDestroying) {
        this.layout.trigger('resize', {
          source: 'application-controller',
        });

        if (this.contentElement) {
          this.layout.updateContentHeight(this.contentElement.clientHeight);
        }
      }
    });
  }

  @action
  windowDidResize() {
    // eslint-disable-next-line ember/no-runloop
    debounce(this, this._windowDidResize, 250);
  }

  @action
  toggleNavCollapsed() {
    this.navIsCollapsed = !this.navIsCollapsed;
    // eslint-disable-next-line ember/no-runloop
    schedule('afterRender', () => {
      this.layout.trigger('resize', { source: 'navigation' });
    });
  }

  /*
   * Called when inspecting an object from outside of the ObjectInspector
   */
  @action
  activateMixinDetails(name, objectId, details, errors, renderNodeId) {
    this.mixinStack.forEach((item) => {
      this.port.send('objectInspector:releaseObject', {
        objectId: item.objectId,
      });
    });

    this.mixinStack = new TrackedArray([]);
    this.pushMixinDetails(
      name,
      undefined,
      objectId,
      details,
      errors,
      renderNodeId,
    );
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
      this.mixinDetails = this.mixinStack.at(-1);
    } else {
      this.mixinDetails = null;
    }
  }
}
