import TabRoute from "ember-inspector/routes/tab";

export default TabRoute.extend({
  queryParams: {
    pinnedObjectId: {
      replace: true
    }
  },

  setupController() {
    this._super(...arguments);
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').on('view:stopInspecting', this, this.stopInspecting);
    this.get('port').on('view:startInspecting', this, this.startInspecting);
    this.get('port').on('view:inspectDOMElement', this, this.inspectDOMElement);

    this.set('controller.viewTreeLoaded', false);
    this.get('port').send('view:setOptions', { options: this.get('controller.options') });
    this.get('port').send('view:getTree');
  },

  deactivate() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
    this.get('port').off('view:stopInspecting', this, this.stopInspecting);
    this.get('port').off('view:startInspecting', this, this.startInspecting);
    this.get('port').off('view:inspectDOMElement', this, this.inspectDOMElement);
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

  startInspecting() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting() {
    this.set('controller.inspectingViews', false);
  },

  inspectComponent(viewId) {
    if (!this.get('controller.viewTreeLoaded')) {
      return;
    }

    this.get('controller').send('inspect', viewId);
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
