//NOTE: connect devtool iframe to browser devtool addon
var Port = Ember.Object.extend(Ember.Evented, {
  init: function() {
    connect.apply(this);
  },
  send: function(messageType, options) {
    options = options || {};
    options.from = 'devtools';
    options.type = messageType;
    // console.debug("ember extension app - port send", options);
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("ember-extension-send", true, true, options);
    document.documentElement.dispatchEvent(event);
  }
});

var connect = function() {
  var self = this;
  window.addEventListener("ember-extension-receive", function(evt) {
    var message = evt.detail;
    // console.debug("ember extension app - port receive", message);
    self.trigger(message.type, message);
  }, false);
};

export default Port;
