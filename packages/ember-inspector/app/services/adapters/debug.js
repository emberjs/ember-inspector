import BasicAdapter from './basic';

export default class DebugAdapterService extends BasicAdapter {
  name = 'debug';

  constructor() {
    super(...arguments);

    import('ember-debug/debug-debug');
  }

  sendMessage(message) {
    console.log('Inspector:sendMessage', message);
    window.postMessage(message);
  }

  _connect() {
    window.addEventListener('message', ({ data }) => {
      console.log('Inspector:messageReceived', data)
      this._messageReceived(data);
    });
  }
}
