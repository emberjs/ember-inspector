import { run } from '@ember/runloop';
import BasicAdapter from './basic';

export default class Websocket extends BasicAdapter {
  constructor() {
    super(...arguments);
    this._connect();
  }

  get socket() {
    return window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket;
  }

  sendMessage(message) {
    this.socket.emit('emberInspectorMessage', message ?? {});
  }

  _connect() {
    this.socket.on('emberInspectorMessage', (message) => {
      // eslint-disable-next-line ember/no-runloop
      run(() => {
        this._messageReceived(message);
      });
    });
  }

  _disconnect() {
    this.socket.removeAllListeners('emberInspectorMessage');
  }

  willDestroy() {
    this._disconnect();
  }
}
