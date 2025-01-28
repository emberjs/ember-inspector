/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { run } from '@ember/runloop';
import BasicAdapter from './basic';
import type { Message } from '../port';

export default class Websocket extends BasicAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;

  constructor() {
    // @ts-expect-error Using ...arguments is fine.
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    // @ts-expect-error TODO: figure out how to type this stuff
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.socket = window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket;
    this._connect();
  }

  sendMessage(message?: Partial<Message>) {
    this.socket.emit('emberInspectorMessage', message ?? {});
  }

  _connect() {
    this.socket.on('emberInspectorMessage', (message: Message) => {
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
