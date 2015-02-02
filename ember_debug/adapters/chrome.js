import BasicAdapter from "./basic";
var Ember = window.Ember;

var ChromeAdapter = BasicAdapter.extend({
  connect: function() {
    var channel = this.get('_channel');
    var self = this;
    return this._super.apply(this, arguments).then(function() {
      window.postMessage('debugger-client', [channel.port2], '*');
      self._listen();
    }, null, 'ember-inspector');
  },

  sendMessage: function(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  inspectElement: function(elem) {
    /* globals inspect */
    inspect(elem);
  },

  _channel: Ember.computed(function() {
    return new MessageChannel();
  }).property().readOnly(),

  _chromePort: Ember.computed(function() {
    return this.get('_channel.port1');
  }).property().readOnly(),

  _listen: function() {
    var self = this,
        chromePort = this.get('_chromePort');

    chromePort.addEventListener('message', function(event) {
      var message = event.data;
      Ember.run(function() {
        self._messageReceived(message);
      });
    });

    chromePort.start();

  }
});

export default ChromeAdapter;
