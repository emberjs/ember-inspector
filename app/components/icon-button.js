import Ember from "ember";
const { Component } = Ember;
export default Component.extend({
  attributeBindings: ['dataLabel:data-label', 'title'],

  tagName: 'button',

  title: null,

  click: function () {
    this.sendAction();
  }
});
