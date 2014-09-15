export default Ember.Component.extend({
  attributeBindings: ['dataLabel:data-label', 'title'],

  tagName: 'button',

  title: 'Clear',

  click: function () {
    this.sendAction();
  }
});