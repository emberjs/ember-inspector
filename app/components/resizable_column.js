export default Ember.Component.extend({
  width: null,

  attributeBindings: ['style'],

  style: function () {
    return '-webkit-flex: none; flex: none; width:' + this.get('width') + 'px;';
  }.property('width'),

  didInsertElement: function () {
    if (!this.get('width')) {
      this.set('width', this.$().width());
    }
  }
});