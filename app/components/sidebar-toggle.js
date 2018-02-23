import { equal } from '@ember/object/computed';
import Component from '@ember/component';
export default Component.extend({

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
