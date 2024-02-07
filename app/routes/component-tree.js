import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import TabRoute from 'ember-inspector/routes/tab';

export default class ComponentTreeRoute extends TabRoute {
  @service port;

  queryParams = {
    pinned: { replace: true },
    previewing: { replace: true },
    query: { replace: true },
  };

  model() {
    return new Promise((resolve) => {
      this.port.one('view:renderTree', resolve);
      this.port.send('view:getTree', { immediate: true });
    });
  }

  setupController(controller, message) {
    super.setupController(...arguments);

    this.setRenderTree(message);
  }

  activate() {
    super.activate(...arguments);

    this.port.on('view:renderTree', this, this.setRenderTree);
    this.port.on('view:renderTreeItem', this, this.setRenderTreeItem);
    this.port.on('view:cancelSelection', this, this.cancelSelection);
    this.port.on('view:startInspecting', this, this.startInspecting);
    this.port.on('view:stopInspecting', this, this.stopInspecting);
    this.port.on('view:inspectDOMNode', this, this.inspectDOMNode);
  }

  deactivate() {
    super.deactivate(...arguments);

    this.port.off('view:renderTree', this, this.setRenderTree);
    this.port.off('view:renderTreeItem', this, this.setRenderTreeItem);
    this.port.off('view:cancelSelection', this, this.cancelSelection);
    this.port.off('view:startInspecting', this, this.startInspecting);
    this.port.off('view:stopInspecting', this, this.stopInspecting);
    this.port.off('view:inspectDOMNode', this, this.inspectDOMNode);
  }

  setRenderTree({ tree }) {
    this.controller.renderTree = tree;
  }

  setRenderTreeItem({ treeItem }) {
    this.controller.setRenderTreeItem(treeItem);
  }

  cancelSelection({ id, pin }) {
    this.controller.cancelSelection(id, pin);
  }

  startInspecting() {
    this.controller.isInspecting = true;
  }

  stopInspecting() {
    this.controller.isInspecting = false;
  }

  inspectDOMNode({ name }) {
    this.port.adapter.inspectDOMNode(name);
  }
}
