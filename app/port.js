import Ember from "ember";

export default Ember.Object.extend(Ember.Evented, {
  applicationId: undefined,

  detectedApplications: function() {
    return [];
  }.property(),

  init: function() {
    var detectedApplications = this.get('detectedApplications');
    this.get('adapter').onMessageReceived(function(message) {
      if (!message.applicationId) {
        return;
      }
      if (!this.get('applicationId')) {
        this.set('applicationId', message.applicationId);
      }
      // save list of application ids
      if (detectedApplications.indexOf(message.applicationId) === -1) {
        detectedApplications.pushObject(message.applicationId);
      }

      var applicationId = this.get('applicationId');
      if (applicationId === message.applicationId) {
        this.trigger(message.type, message, applicationId);
      }
    }.bind(this));
  },
  send: function(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.get('applicationId');
    this.get('adapter').sendMessage(message);
  }
});
