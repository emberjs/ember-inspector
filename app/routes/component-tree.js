import ViewTree from "ember-inspector/routes/view-tree";

export default ViewTree.extend({
  queryParams: {
    pinnedObjectId: {
      replace: true
    }
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

    this.get('controller').send('inspect', viewId);
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
