import Ember from "ember";
const { Component, computed, Handlebars: { SafeString } } = Ember;
export default Component.extend({
  width: null,

  attributeBindings: ['style'],

  style: computed('width', function () {
    return new SafeString(`-webkit-flex: none; flex: none; width: ${this.get('width')}px;`);
  }),

  didInsertElement() {
    if (!this.get('width')) {
      this.set('width', this.$().width());
    }
  }
});
