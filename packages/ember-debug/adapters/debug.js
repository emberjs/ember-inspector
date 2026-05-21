import BasicAdapter from './basic.js';

export default class DebugAdapter extends BasicAdapter {
  constructor() {
    super(...arguments);
    this._listen();
  }

  sendMessage(message) {
    console.debug('DebugAdapter:sendMessage', message);
    window.postMessage(message);
  }

  _listen() {
    window.addEventListener('message', ({ data }) => {
      if (data.from === 'devtools') {
        console.debug('DebugAdapter:messageReceived', data);
        this._messageReceived(data);
      }
    });

    window.addEventListener('unload', () => {
      this.sendMessage({
        unloading: true,
      });
    }, { once: true });
  }
}
