import Service, { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { schedule } from "@ember/runloop";

export default class ObjectInspectorService extends Service {
  @service("layout") layoutService;

  @tracked inspectorWidth = 360;
  @tracked inspectorExpanded = false;

  @action
  showInspector() {
    if (this.inspectorExpanded === false) {
      this.inspectorExpanded = true;
      // Broadcast that tables have been resized (used by `x-list`).
      schedule("afterRender", () => {
        this.layoutService.trigger("resize", { source: "object-inspector" });
      });
    }
  }

  @action
  hideInspector() {
    if (this.inspectorExpanded === true) {
      this.inspectorExpanded = false;
      // Broadcast that tables have been resized (used by `x-list`).
      schedule("afterRender", () => {
        this.layoutService.trigger("resize", { source: "object-inspector" });
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
