var ViewTreeRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.get('port').on('viewTree', this, this.setViewTree);
  },

  deactivate: function() {
    this.get('port').off('viewTree', this, this.setViewTree);
  },

  setViewTree: function(options) {
    this.set('controller.node', { children: [ arrayizeTree(options.tree) ] });
  }

});


function arrayizeTree(tree) {
  Ember.NativeArray.apply(tree.children);
  tree.children.forEach(arrayizeTree);
  return tree;
}


export = ViewTreeRoute;
