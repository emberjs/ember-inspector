import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  queryParams: {
    pinnedObjectId: {
      replace: true
    }
  },

  model() {
    return new Promise(resolve => {
      this.port.one('view:viewTree', resolve);
      this.port.send('view:getTree');
    });
  },

  setupController(controller, message) {
    this._super(...arguments);
    this.setViewTree(message);
  },

  activate() {
    this._super(...arguments);
    this.port.on('view:viewTree', this, this.setViewTree);
    this.port.on('view:stopInspecting', this, this.stopInspecting);
    this.port.on('view:startInspecting', this, this.startInspecting);
    this.port.on('view:inspectDOMNode', this, this.inspectDOMNode);
  },

  deactivate() {
    this._super(...arguments);
    this.port.off('view:viewTree', this, this.setViewTree);
    this.port.off('view:stopInspecting', this, this.stopInspecting);
    this.port.off('view:startInspecting', this, this.startInspecting);
    this.port.off('view:inspectDOMNode', this, this.inspectDOMNode);
  },

  setViewTree(options) {
    this.set('controller.viewTree', options.tree);

    // If we're waiting for view tree to inspect a component
    const componentToInspect = this.get('controller.pinnedObjectId');
    if (componentToInspect) {
      this.inspectComponent(componentToInspect);
    }
  },

  inspectComponent(viewId) {
    this.controller.inspect(viewId);
  },

  startInspecting() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting() {
    this.set('controller.inspectingViews', false);
  },

  inspectDOMNode({ selector }) {
    this.get('port.adapter').inspectDOMNode(selector);
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
