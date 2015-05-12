import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";
var $ = Ember.$;

export default TabRoute.extend({
  model() {
    return [];
  },

  setupController: function() {
    this._super(...arguments);
    this.get('port').on('view:viewTree', this, this.setViewTree);
    this.get('port').on('view:stopInspecting', this, this.stopInspecting);
    this.get('port').on('view:startInspecting', this, this.startInspecting);
    this.get('port').on('view:pinView', this, this.pinView);
    this.get('port').on('view:unpinView', this, this.unpinView);
    this.get('port').send('view:getTree');
  },

  deactivate: function() {
    this.get('port').off('view:viewTree', this, this.setViewTree);
    this.get('port').off('view:stopInspecting', this, this.stopInspecting);
    this.get('port').off('view:startInspecting', this, this.startInspecting);
    this.get('port').off('view:pinView', this, this.pinView);
    this.get('port').off('view:unpinView', this, this.unpinView);
  },

  setViewTree: function(options) {
    var viewArray = topSort(options.tree);
    this.set('controller.model', viewArray);
  },

  startInspecting: function() {
    this.set('controller.inspectingViews', true);
  },

  stopInspecting: function() {
    this.set('controller.inspectingViews', false);
  },

  pinView: function(message) {
    this.set('controller.pinnedObjectId', message.objectId);
  },

  unpinView: function() {
    this.set('controller.pinnedObjectId', null);
  },

  actions: {
    inspect: function(objectId) {
      if (objectId) {
        this.get('port').send('objectInspector:inspectById', { objectId: objectId });
      }
    },
    inspectElement: function(objectId) {
      this.get('port').send('view:inspectElement', { objectId: objectId });
    }
  }

});

function topSort(tree, list) {
  list = list || [];
  var view = $.extend({}, tree);
  view.parentCount = view.parentCount || 0;
  delete view.children;
  list.push(view);
  tree.children.forEach(function(child) {
    child.parentCount = view.parentCount + 1;
    topSort(child, list);
  });
  return list;
}
