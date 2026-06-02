import BasicAdapter from './basic';

export default class DebugAdapterService extends BasicAdapter {
  name = 'debug';

  constructor() {
    super(...arguments);
    this._connect();
  }

  sendMessage = (message) => {
    window.postMessage({
      ...message,
      from: 'devtools',
    });
  };

  _connect() {
    window.addEventListener('message', ({ data: message }) => {
      // Skip any message not sent by ember_debug
      if (message.from !== 'inspectedWindow') {
        return;
      }

      this._messageReceived(message);
    });
  }
}
