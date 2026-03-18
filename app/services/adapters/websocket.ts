/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { run } from '@ember/runloop';
import BasicAdapter from './basic';
import type { Message } from '../port';

export default class Websocket extends BasicAdapter {
  constructor() {
    // @ts-expect-error Using ...arguments is fine.
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    this._connect();
  }

  get socket() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return (window as any).EMBER_INSPECTOR_CONFIG.remoteDebugSocket as any;
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
