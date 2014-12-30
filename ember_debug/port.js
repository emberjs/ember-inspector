var Ember = window.Ember;
var oneWay = Ember.computed.oneWay;
var guidFor = Ember.guidFor;

export default Ember.Object.extend(Ember.Evented, {
  adapter: oneWay('namespace.adapter').readOnly(),

  application: oneWay('namespace.application').readOnly(),

  uniqueId: Ember.computed(function() {
    return guidFor(this.get('application')) + '__' + window.location.href + '__' + Date.now();
  }).property(),

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
