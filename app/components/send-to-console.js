import Component from '@ember/component';
export default Component.extend({
  tagName: 'button',
  classNames: ['send-to-console', 'js-send-to-console-btn'],
  attributeBindings: ['title'],
  title: 'Send to Console',
  action: 'sendValueToConsole',
  click() {
    this.sendAction('action', this.get('param'));
  }
});
