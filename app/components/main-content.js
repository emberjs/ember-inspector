import Ember from "ember";
const { Component, run: { schedule, debounce, cancel }, $ } = Ember;
// Currently used to determine the height of list-views
export default Component.extend({
  /**
   * Action that indicates this
   * component's height has changed.
   *
   * @property updateHeight
   * @type {Function|String}
   */
  updateHeight: null,

  didInsertElement() {
    $(window).on(`resize.view-${this.get('elementId')}`, () => {
      this._updateHeightDebounce = debounce(this, '_updateHeight', 200);
    });
    schedule('afterRender', this, '_updateHeight');
    return this._super(...arguments);
  },

  _updateHeight() {
    this.sendAction('updateHeight', this.$().height());
  },

  willDestroyElement() {
    $(window).off(`.view-${this.get('elementId')}`);
    cancel(this._updateHeightDebounce);
    return this._super(...arguments);
  }
});
