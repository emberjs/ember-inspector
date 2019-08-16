import TabRoute from "ember-inspector/routes/tab";

export default TabRoute.extend({
  queryParams: {
    pinnedObjectId: {
      replace: true
    }
  },

  model() {
    return [];
  },

  setupController() {
    this._super(...arguments);
    this.port.on('view:viewTree', this, this.setViewTree);
    this.port.on('view:stopInspecting', this, this.stopInspecting);
    this.port.on('view:startInspecting', this, this.startInspecting);
    this.port.on('view:inspectDOMElement', this, this.inspectDOMElement);

    this.set('controller.viewTreeLoaded', false);
    this.port.send('view:setOptions', { options: this.get('controller.options') });
    this.port.send('view:getTree');
  },

  deactivate() {
    this.port.off('view:viewTree', this, this.setViewTree);
    this.port.off('view:stopInspecting', this, this.stopInspecting);
    this.port.off('view:startInspecting', this, this.startInspecting);
    this.port.off('view:inspectDOMElement', this, this.inspectDOMElement);
  },

  setViewTree(options) {
    this.set('controller.viewTree', options.tree);
    this.set('controller.viewTreeLoaded', true);

    // If we're waiting for view tree to inspect a component
    const componentToInspect = this.get('controller.pinnedObjectId');
    if (componentToInspect) {
      this.inspectComponent(componentToInspect);
    }
  },

  inspectComponent(viewId) {
    if (!this.get('controller.viewTreeLoaded')) {
      return;
    }

    this.controller.send('inspect', viewId);
  },

  startInspecting() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting() {
    this.set('controller.inspectingViews', false);
  },

  inspectDOMElement({ elementSelector }) {
    this.get('port.adapter').inspectDOMElement(elementSelector);
  },

  actions: {
    queryParamsDidChange(params) {
      const { pinnedObjectId } = params;
      if (pinnedObjectId) {
        this.inspectComponent(pinnedObjectId);
      }
    }
  }
});
