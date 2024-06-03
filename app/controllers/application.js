import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { equal } from '@ember/object/computed';
import { debounce, schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';

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
  @tracked inspectingTabOrigin = null;

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

    this.mixinStack = [];
    this.mixinDetails = [];
  }

  get targetTabOrigin() {
    if (!this.inspectingTabOrigin) {
      void this.requestTargetTabOrigin();
      return null;
    }
    return `${window.location.origin}/request.html?tabOrigin=${this.inspectingTabOrigin}`;
  }

  requestTargetTabOrigin() {
    // during tests
    if (typeof chrome === 'undefined') {
      return;
    }
    chrome.devtools.inspectedWindow.eval('window.location', (resp) => {
      const origin = resp.origin;
      this.inspectingTabOrigin = origin;
    });
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

    this.mixinStack.pushObject(details);
    this.set('mixinDetails', details);
  }

  @action
  popMixinDetails() {
    let mixinStack = this.mixinStack;
    let item = mixinStack.popObject();
    this.set('mixinDetails', mixinStack.get('lastObject'));
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
            this.contentElement.clientHeight
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

    this.set('mixinStack', []);
    this.pushMixinDetails(name, undefined, objectId, details, errors);
  }

  @action
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
  }

  @action
  requestPermissionForAll() {
    function onResponse(response) {
      if (response) {
        console.log('Permission was granted');
      } else {
        console.log('Permission was refused');
      }
      return chrome.permissions.getAll();
    }

    const permissionsToRequest = {
      origins: ['<all_urls>'],
    };

    chrome.permissions.request(permissionsToRequest).then(async (response) => {
      const currentPermissions = await onResponse(response);
      console.log(`Current permissions:`, currentPermissions);
    });
  }
}
