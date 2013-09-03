var ViewTreeItemController = Ember.ObjectController.extend({
  hasView: function() {
    return this.get('model.value.viewClass') !== 'virtual';
  }.property('model.value.viewClass'),

  hasController: function() {
    return !!this.get('model.value.controller');
  }.property('model.value.controller'),

  hasModel: function() {
    return !!this.get('model.value.model');
  }.property('model.value.model'),

  style: function() {
    return 'padding-left: ' + ((this.get('numParents') * 5) + 5) + 'px';
  }.property('numParents'),

  numParents: function() {
    var numParents = this.get('target.target.numParents');
    if (numParents === undefined) {
      numParents = -1;
    }
    return numParents + 1;
  }.property("target.target.numParents")

});

export default ViewTreeItemController;
