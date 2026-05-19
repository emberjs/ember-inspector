/**
 * Layout service used to broadcast changes to the application's
 * layout due to resizing of the main nav or the object inspector toggling.
 *
 * Whenever something resizes it triggers an event on this service. For example
 * when the main nav is resized.
 * Elements dependant on the app's layout listen to events on this service. For
 * example the `list` component.
 */
import Service from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
import { schedule } from '@ember/runloop';

export default class LayoutService extends Service {
  @tracked inspectorExpanded = false;

  /**
   * Stores the app's content height. This property is kept up-to-date
   * by the `monitor-content-height` component.
   */
  @tracked contentHeight = null;

  /**
   * This is called by `monitor-content-height` whenever a window resize is detected
   * and the app's content height has changed. We therefore update the
   * `contentHeight` property and notify all listeners (mostly lists).
   *
   * @param height The new app content height
   */
  updateContentHeight(height) {
    this.contentHeight = height;
    this.trigger('content-height-update', height);
  }

  // Manually implement Evented functionality, so we can move away from the mixin

  @action
  on(eventName, targetOrMethod, method) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod);
    } else {
      addListener(this, eventName, targetOrMethod, method);
    }
  }

  @action
  one(eventName, targetOrMethod, method) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod, true);
    } else {
      addListener(this, eventName, targetOrMethod, method, true);
    }
  }

  @action
  off(eventName, targetOrMethod, method) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod);
      } else {
        removeListener(this, eventName, targetOrMethod, method);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName, ...args) {
    sendEvent(this, eventName, args);
  }

  @action
  showInspector() {
    if (this.inspectorExpanded === false) {
      this.inspectorExpanded = true;
      // Broadcast that tables have been resized (used by `x-list`).
      // eslint-disable-next-line ember/no-runloop
      schedule('afterRender', () => {
        this.trigger('resize', { source: 'object-inspector' });
      });
    }
  }

  @action
  hideInspector() {
    if (this.inspectorExpanded === true) {
      this.inspectorExpanded = false;
      // Broadcast that tables have been resized (used by `x-list`).
      // eslint-disable-next-line ember/no-runloop
      schedule('afterRender', () => {
        this.trigger('resize', { source: 'object-inspector' });
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
}
