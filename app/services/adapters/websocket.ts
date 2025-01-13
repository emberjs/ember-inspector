import { run } from '@ember/runloop';
import BasicAdapter from './basic';
import type { Message } from '../port';

export default class Websocket extends BasicAdapter {
  socket: any;

  constructor(properties?: object) {
    super(properties);
    // @ts-expect-error TODO: figure out how to type this stuff
    this.socket = window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket;
    this._connect();
  }

  sendMessage(message?: Partial<Message>) {
    this.socket.emit('emberInspectorMessage', message ?? {});
  }

  _connect() {
    this.socket.on('emberInspectorMessage', (message: Message) => {
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
