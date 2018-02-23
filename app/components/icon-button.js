import Component from '@ember/component';
export default Component.extend({
  attributeBindings: ['title'],

  tagName: 'button',

  title: null,

  click() {
    this.sendAction();
  }
});
