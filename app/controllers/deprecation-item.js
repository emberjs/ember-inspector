import Ember from "ember";
var Controller = Ember.Controller;
var notEmpty = Ember.computed.notEmpty;
export default Controller.extend({
  isExpanded: true,

  hasMap: notEmpty('model.hasSourceMap'),

  expandedClass: function() {
    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }.property('hasMap', 'isExpanded'),

  actions: {
    toggleExpand: function() {
      this.toggleProperty('isExpanded');
    }

  }
});
