import BasicAdapter from './basic.js';

export default class DebugAdapter extends BasicAdapter {
  constructor() {
    super(...arguments);
    this._listen();

    /**
     * this is probably the wrong place for this call but maybe it's ok since
     * the debug adapter is intended to be used on same-page development environments.
     * If you look at the other adapters you can see that there is a connect() function
     * that resolves and calls `onConnectionReady()` once things are connected. Seems
     * overkill for a debug adapter 🤷
     */
    this.onConnectionReady();
  }

  sendMessage(message) {
    console.debug('\x1B[1;35mAdapter:send', message);
    window.postMessage(message);
  }

  _listen() {
    window.addEventListener('message', ({ data }) => {
      /**
       * this check is to prevent an infinite loop with teh debug adapter. without this the "inspector" and "app"
       * wil keep sending back and forth the same messages over and over. This check makes sure that the communication
       * remains one-way
       */
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
