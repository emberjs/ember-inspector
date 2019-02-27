import Component from '@ember/component';
import layout from '../templates/components/send-to-console';

export default Component.extend({
  layout,
  tagName: 'button',
  classNames: ['send-to-console', 'js-send-to-console-btn'],
  attributeBindings: ['title'],
  title: 'Send to Console',
  action: 'sendValueToConsole',
  click() {
    this.action(this.get('param'));
  }
});
