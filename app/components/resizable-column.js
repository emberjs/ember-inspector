import Ember from "ember";
const { computed } = Ember;
export default Ember.Component.extend({
  width: null,

  attributeBindings: ['style'],

  style: computed('width', function () {
    return '-webkit-flex: none; flex: none; width:' + this.get('width') + 'px;';
  }),

  didInsertElement: function () {
    if (!this.get('width')) {
      this.set('width', this.$().width());
    }
  }
});
