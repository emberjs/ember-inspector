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
import type { AnyFn } from '@ember/-internals/utility-types';

export default class LayoutService extends Service {
  /**
   * Stores the app's content height. This property is kept up-to-date
   * by the `monitor-content-height` component.
   */
  @tracked contentHeight: number | null = null;

  /**
   * This is called by `monitor-content-height` whenever a window resize is detected
   * and the app's content height has changed. We therefore update the
   * `contentHeight` property and notify all listeners (mostly lists).
   *
   * @param height The new app content height
   */
  updateContentHeight(height: number) {
    this.contentHeight = height;
    this.trigger('content-height-update', height);
  }

  // Manually implement Evented functionality, so we can move away from the mixin

  on(eventName: string, method: AnyFn): void;
  on(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  on(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn): void {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn);
    } else {
      addListener(this, eventName, targetOrMethod as object, method);
    }
  }

  one(eventName: string, method: AnyFn): void;
  one(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  one(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn, true);
    } else {
      addListener(this, eventName, targetOrMethod as object, method, true);
    }
  }

  off(eventName: string, method: AnyFn): void;
  off(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  off(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod as AnyFn);
      } else {
        removeListener(this, eventName, targetOrMethod as object, method);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger(eventName: string, ...args: Array<any>) {
    sendEvent(this, eventName, args);
  }
}
