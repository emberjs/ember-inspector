import Ember from "ember";
var Component = Ember.Component;
export default Component.extend({
  attributeBindings: ['dataLabel:data-label', 'title'],

  tagName: 'button',

  title: null,

  click: function () {
    this.sendAction();
  }
});
