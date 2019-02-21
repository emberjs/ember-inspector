import Component from '@ember/component';
import layout from '../templates/components/sidebar-toggle';

export default Component.extend({
  layout,
  tagName: 'button',
  classNames: 'sidebar-toggle',
  classNameBindings: ['isExpanded:flip'],
  isExpanded: false,

  click() {
    this.sendAction();
  }
});
