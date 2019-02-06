import Component from '@ember/component';

export default Component.extend({
  attributeBindings: ['title'],
  classNameBindings: ['expanded:expanded:collapsed'],
  tagName: 'button',
  title: 'Click to toggle',

  expanded: false,

  click(event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggle(event.altKey);
  }
});
