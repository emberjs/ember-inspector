import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../templates/components/sidebar-toggle';

export default Component.extend({
  layout,

  tagName: 'button',

  side: 'right',

  isExpanded: false,

  isRight: equal('side', 'right'),

  classNames: 'sidebar-toggle',

  classNameBindings: 'isRight:sidebar-toggle--right:sidebar-toggle--left',

  click() {
    this.sendAction();
  }

});
