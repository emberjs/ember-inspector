/**
 * Layout state of the inspector: whether the object inspector is open,
 * and the height of the content area, which sizes the lists.
 */
import Service from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LayoutService extends Service {
  @tracked inspectorExpanded = false;

  /**
   * The height of the content area. The application template observes it.
   */
  @tracked contentHeight = null;

  @action
  showInspector() {
    this.inspectorExpanded = true;
  }

  @action
  hideInspector() {
    this.inspectorExpanded = false;
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
