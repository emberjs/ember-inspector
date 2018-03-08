import Component from '@ember/component';
export default Component.extend({
  tagName: 'button',
  classNames: ['send-to-console', 'js-send-to-console-btn'],
  action: 'sendValueToConsole',
  click() {
    this.sendAction('action', this.get('param'));
  }
});
