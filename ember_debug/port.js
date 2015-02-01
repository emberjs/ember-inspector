var Ember = window.Ember;
var readOnly = Ember.computed.readOnly;
var guidFor = Ember.guidFor;

export default Ember.Object.extend(Ember.Evented, {
  adapter: readOnly('namespace.adapter'),

  application: readOnly('namespace.application'),

  uniqueId: Ember.computed(function() {
    return guidFor(this.get('application')) + '__' + window.location.href + '__' + Date.now();
  }).property('application'),

  init: function() {
    var self = this;
    this.get('adapter').onMessageReceived(function(message) {
      if(self.get('uniqueId') === message.applicationId || !message.applicationId) {
        self.trigger(message.type, message);
      }
    });
  },
  send: function(messageType, options) {
    options.type = messageType;
    options.from = 'inspectedWindow';
    options.applicationId = this.get('uniqueId');
    this.get('adapter').send(options);
  }
});
