import BasicAdapter from './basic.js';

export default class DebugAdapter extends BasicAdapter {
  constructor() {
    super(...arguments);
    this._listen();
    this.onConnectionReady();
  }

  sendMessage(message) {
    window.postMessage({
      ...message,
      from: 'inspectedWindow',
    });
  }

  _listen() {
    window.addEventListener('message', ({ data }) => {
      /**
       * This check prevents an infinite loop with the debug adapter.
       * Without this the "inspector" and "app" wil keep sending back and
       * forth the same messages over and over as they are writing to the
       * same MessagePort. This check makes sure that the communication
       * remains one-way.
       * See _packages/ember-inspector/app/services/adapters/debug.js_
       * for the counterpart
       */
      if (data.from !== 'devtools') {
        return;
      }

      this._messageReceived(data);
    });

    window.addEventListener('unload', () => {
      this.sendMessage({
        unloading: true,
      });
    }, { once: true });
  }
}
