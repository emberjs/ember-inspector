import BasicAdapter from "./basic";
var Ember = window.Ember;
var computed = Ember.computed;

var WebsocketAdapter = BasicAdapter.extend({
  init: function() {
    this._super();
    this._connect();
  },

  sendMessage: function(options) {
    options = options || {};
    this.get('socket').emit('emberInspectorMessage', options);
  },

  socket: computed(function() {
    return window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket;
  }).property(),

  _connect: function() {
    var self = this;
    this.get('socket').on('emberInspectorMessage', function(message) {
      Ember.run(function() {
        self._messageReceived(message);
      });
    });
  },

  _disconnect: function() {
    this.get('socket').removeAllListeners("emberInspectorMessage");
  },

  willDestroy: function() {
    this._disconnect();
  }
});

export default WebsocketAdapter;
