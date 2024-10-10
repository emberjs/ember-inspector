import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';
import Evented from '@ember/object/evented';
import { schedule } from '@ember/runloop';

/**
 * Base list view config
 *
 * @module Components
 * @extends Component
 * @class List
 * @namespace Components
 */
export default class ListContent extends Component.extend(Evented) {
  /**
   * The layout service. Used to observe the app's content height.
   *
   * @property layoutService
   * @type {Service}
   */
  @service('layout') layoutService;

  constructor() {
    super(...arguments);

    /**
     * Array of objects representing the columns to render
     * and their corresponding widths. This array is passed
     * through the template.
     *
     * Each item in the array has `width` and `id` properties.
     *
     * @property columns
     * @type {Array}
     */
    this.columns = [];
  }

  /**
   * Hook called when content element is inserted.
   *
   * @method elementInserted
   */
  @action
  elementInserted() {
    schedule('afterRender', this, this.setupHeight);
  }

  /**
   * Set up the content height and listen to any updates to that property.
   *
   * @method setupHeight
   */
  @action
  setupHeight() {
    this.set('contentHeight', this.get('layoutService.contentHeight'));
    this.layoutService.on(
      'content-height-update',
      this,
      this.updateContentHeight,
    );
  }

  /**
   * Triggered whenever the app's content height changes. This usually happens
   * when the window is resized. Once we detect a change we:
   * 1. Update this component's `contentHeight` property and consequently its `height` style.
   * 2. Check the previous height. If previous height was zero that means the inspector launched
   * in the background and was therefore not visible. Go to (a). Otherwise skip (a).
   *   a. Rerender the component. This is needed because smoke and mirrors doesn't know that the content height
   *   has changed.
   *
   * @method updateContentHeight
   * @param  {Number} height The app's new content height
   */
  updateContentHeight(height) {
    let previousHeight = this.contentHeight;
    this.set('contentHeight', height);
    if (previousHeight === 0 && height > 0) {
      this.rerender();
    }
  }

  /**
   * Hook called before destruction. Clean up events listeners.
   *
   * @method willDestroy
   */
  willDestroy() {
    this.layoutService.off(
      'content-height-update',
      this,
      this.updateContentHeight,
    );
    return super.willDestroy(...arguments);
  }

  @computed('height')
  get style() {
    return htmlSafe(`height:${this.height}px`);
  }

  /**
   * Number passed from `list`. Indicates the header height
   * in pixels.
   *
   * @property headerHeight
   * @type {Number}
   */
  headerHeight = null;

  /**
   * @property height
   * @type {Integer}
   */
  @computed('contentHeight', 'headerHeight')
  get height() {
    let headerHeight = this.headerHeight;
    let contentHeight = this.contentHeight;

    // In testing list-view is created before `contentHeight` is set
    // which will trigger an exception
    if (!contentHeight) {
      return 1;
    }
    return contentHeight - headerHeight;
  }
}
