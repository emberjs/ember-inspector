import Ember from "ember";
const { run } = Ember;

// Currently used to determine the height of list-views
export default Ember.View.extend({
  height: Ember.computed.alias('controller.contentHeight'),

  didInsertElement() {
    this._super(...arguments);

    Ember.$(window).on('resize.view-' + this.get('elementId'), () => {
      run.debounce(this, 'updateHeight', 200);
    });

    run.schedule('afterRender', () => {
      this.updateHeight();
    });
  },

  updateHeight() {
    // could be destroyed but with debounce pending
    if (this.$()) {
      this.set('height', this.$().height());
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.$(window).off('.view-' + this.get('elementId'));
  }
});
