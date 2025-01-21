import { action } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { schedule } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import type { AnyFn } from 'ember/-private/type-utils';

import type LayoutService from '../services/layout';

interface ListContentSignature {
  Element: HTMLDivElement;
  Args: {
    /**
     * Array of objects representing the columns to render
     * and their corresponding widths. This array is passed
     * through the template.
     *
     * Each item in the array has `width` and `id` properties.
     */
    columns: Array<{ id: string; width: number }>;
    /**
     * Number passed from `list`. Indicates the header height
     * in pixels.
     */
    headerHeight: number;
  };
}

/**
 * Base list view config
 */
export default class ListContent extends Component<ListContentSignature> {
  /**
   * The layout service. Used to observe the app's content height.
   */
  @service('layout') declare layoutService: LayoutService;

  @tracked contentHeight: number | null = null;

  /**
   * Hook called before destruction. Clean up events listeners.
   */
  willDestroy() {
    this.layoutService.off(
      'content-height-update',
      this,
      this.updateContentHeight,
    );
    return super.willDestroy();
  }

  get height() {
    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!this.contentHeight) {
      return 1;
    }
    return this.contentHeight - this.args.headerHeight;
  }

  get style() {
    return htmlSafe(`height:${this.height}px`);
  }

  /**
   * Hook called when content element is inserted.
   */
  @action
  elementInserted() {
    schedule('afterRender', this, this.setupHeight);
  }

  /**
   * Set up the content height and listen to any updates to that property.
   */
  @action
  setupHeight() {
    this.contentHeight = this.layoutService.contentHeight;
    this.layoutService.on(
      'content-height-update',
      this,
      this.updateContentHeight,
    );
  }

  /**
   * Triggered whenever the app's content height changes. This usually happens
   * when the window is resized. Once we detect a change we update this
   * component's `contentHeight` property and consequently its `height` style.
   *
   * @param height The app's new content height
   */
  @action
  updateContentHeight(height: number) {
    this.contentHeight = height;
  }

  // Manually implement Evented functionality, so we can move away from the mixin
  // TODO: Do we even need any evented-like things in this component?

  on(eventName: string, method: AnyFn): void;
  on(eventName: string, target: unknown, method: AnyFn): void;

  @action
  on(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn): void {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn);
    } else {
      addListener(this, eventName, targetOrMethod, method!);
    }
  }

  one(eventName: string, method: AnyFn): void;
  one(eventName: string, target: unknown, method: AnyFn): void;

  @action
  one(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn, true);
    } else {
      addListener(this, eventName, targetOrMethod, method!, true);
    }
  }

  off(eventName: string, method: AnyFn): void;
  off(eventName: string, target: unknown, method: AnyFn): void;

  @action
  off(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod as AnyFn);
      } else {
        removeListener(this, eventName, targetOrMethod, method!);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName: string, ...args: Array<any>) {
    sendEvent(this, eventName, args);
  }
}
