import BasicAdapter from './basic.js';

export default class DebugAdapter extends BasicAdapter {
  constructor() {
    super(...arguments);
    this._listen();
  }

  sendMessage(message) {
    console.debug('\x1B[1;35mAdapter:send', message);
    window.postMessage(message);
  }

  _listen() {
    window.addEventListener('message', ({ data }) => {
      if (data.from === 'devtools') {
        console.debug('\x1B[1;35mAdapter:received', data);
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
