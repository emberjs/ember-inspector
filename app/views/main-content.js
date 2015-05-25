import Ember from "ember";
// Currently used to determine the height of list-views
export default Ember.View.extend({
  height: Ember.computed.alias('controller.contentHeight'),

  didInsertElement: function() {
    this._super();

    Ember.$(window).on('resize.view-' + this.get('elementId'), () => {
      Ember.run.debounce(this, 'updateHeight', 200);
    });
    this.updateHeight();
  },

  updateHeight: function() {
    // could be destroyed but with debounce pending
    if (this.$()) {
      this.set('height', this.$().height());
    }
  },

  willDestroyElement: function() {
    Ember.$(window).off('.view-' + this.get('elementId'));
  }
});
