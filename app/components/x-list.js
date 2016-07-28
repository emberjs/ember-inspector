import Ember from 'ember';
const { Component, run: { next } } = Ember;
export default Component.extend({
  classNames: ['list'],

  didInsertElement() {
    /* The header columns are not inside the scrollable list.  The scrollbar will
     * cause flexbox to fail to match header and content.
     * This is a hack to account for scrollbar width (if any)
     */
    next(() => {
      let outside = this.$().innerWidth();
      let inside = this.$('.list__content')[0].clientWidth;
      this.$('.list__cell_spacer').css('width', `${outside - inside}px`);
    });
    return this._super(...arguments);
  }
});
