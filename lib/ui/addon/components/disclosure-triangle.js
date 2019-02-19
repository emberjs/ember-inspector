import Component from '@ember/component';
import layout from '../templates/components/disclosure-triangle';

export default Component.extend({
  layout,
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
