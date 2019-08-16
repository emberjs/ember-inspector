import { run } from '@ember/runloop';
import BasicAdapter from './basic';

export default BasicAdapter.extend({
  init() {
    this._super();
    this.socket = window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket;
    this._connect();
  },

  sendMessage(options) {
    options = options || {};
    this.socket.emit('emberInspectorMessage', options);
  },

  _connect() {
    this.socket.on('emberInspectorMessage', message => {
      run(() => {
        this._messageReceived(message);
      });
    });
  },

  _disconnect() {
    this.socket.removeAllListeners('emberInspectorMessage');
  },

  willDestroy() {
    this._disconnect();
  }
});

