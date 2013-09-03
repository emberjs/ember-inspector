var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    connect.apply(this);
  },
  send: function(messageType, options) {
    options.type = messageType;
    options.from = 'inspectedWindow';
    // NOTE: send message from inspectedWindow to EmberInspector addon
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("ember-debug-send", true, true, options);
    document.documentElement.dispatchEvent(event);
  }
});


var connect = function() {
  var self = this;

  window.addEventListener('ember-debug-receive', function(event) {
    var message = event.detail;
    Ember.run(function() {
      self.trigger(message.type, message);
    });
  });
};

export default Port;
