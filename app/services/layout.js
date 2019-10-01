/**
 * Layout service used to broadcast changes to the application's
 * layout due to resizing of the main nav or the object inspector toggling.
 *
 * Whenever something resizes it triggers an event on this service. For example
 * when the main nav is resized.
 * Elements dependant on the app's layout listen to events on this service. For
 * example the `list` component.
 *
 * @class Layout
 * @extends Service
 */
import Service from '@ember/service';

import Evented from '@ember/object/evented';
export default Service.extend(Evented, {
  /**
   * Stores the app's content height. This property is kept up-to-date
   * by the `monitor-content-height` component.
   *
   * @property contentHeight
   * @type {Number}
   */
  contentHeight: null,

  /**
   * This is called by `monitor-content-height` whenever a window resize is detected
   * and the app's content height has changed. We therefore update the
   * `contentHeight` property and notify all listeners (mostly lists).
   *
   * @method updateContentHeight
   * @param  {Number} height The new app content height
   */
  updateContentHeight(height) {
    this.set('contentHeight', height);
    this.trigger('content-height-update', height);
  }
});
