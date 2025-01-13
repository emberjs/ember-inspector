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
import { tracked } from '@glimmer/tracking';
import Evented from '@ember/object/evented';

export default class LayoutService extends Service.extend(Evented) {
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
}
