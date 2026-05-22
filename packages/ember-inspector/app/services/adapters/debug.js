import BasicAdapter from './basic';

export default class DebugAdapterService extends BasicAdapter {
  name = 'debug';

  constructor() {
    super(...arguments);
    this._connect();
  }

  sendMessage = (message) => {
    console.debug('\x1B[1;91mEmberInspector:send', message);
    window.postMessage(message);
  }

  _connect() {
    window.addEventListener('message', ({ data: message }) => {
      if (message.from === 'inspectedWindow') {
        console.debug('\x1B[1;91mEmberInspector:received', message)
        this._messageReceived(message);
      }
    });
  }
}
