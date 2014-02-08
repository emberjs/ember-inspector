var SendToConsoleComponent = Ember.Component.extend({
  tagName: 'button',
  classNames: ['send-to-console'],
  attributeBindings: ['dataLabel:data-label'],
  dataLabel: 'send-to-console-btn',
  action: 'sendValueToConsole',
  click: function() {
    this.sendAction('action', this.get('param'));
  }
});

export default SendToConsoleComponent;
