import BasicAdapter from "./basic";
var Ember = window.Ember;
var computed = Ember.computed;
var Promise = Ember.RSVP.Promise;
var $ = Ember.$;

var WebsocketAdapter = BasicAdapter.extend({

  sendMessage: function(options) {
    options = options || {};
    this.get('socket').emit('emberInspectorMessage', options);
  },

  socket: computed(function() {
    return window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket;
  }).property(),

  _listen: function() {
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

  connect: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      $(function() {
        if (self.isDestroyed) { reject(); }
        var EMBER_INSPECTOR_CONFIG = window.EMBER_INSPECTOR_CONFIG;
        if (typeof EMBER_INSPECTOR_CONFIG === 'object' && EMBER_INSPECTOR_CONFIG.remoteDebugSocket) {
          resolve();
        }
      });
    }).then(function() {
      self._listen();
    });
  },

  willDestroy: function() {
    this._disconnect();
  }
});

export default WebsocketAdapter;
