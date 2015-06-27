import BasicAdapter from "./basic";
const Ember = window.Ember;
const { computed, run } = Ember;

export default BasicAdapter.extend({
  connect() {
    const channel = this.get('_channel');
    return this._super(...arguments).then(() => {
      window.postMessage('debugger-client', [channel.port2], '*');
      this._listen();
    }, null, 'ember-inspector');
  },

  sendMessage(options) {
    options = options || {};
    this.get('_chromePort').postMessage(options);
  },

  inspectElement(elem) {
    /* globals inspect */
    inspect(elem);
  },

  _channel: computed(function() {
    return new MessageChannel();
  }).readOnly(),

  _chromePort: computed(function() {
    return this.get('_channel.port1');
  }).readOnly(),

  _listen() {
    let chromePort = this.get('_chromePort');

    chromePort.addEventListener('message', event => {
      const message = event.data;
      run(() => {
        this._messageReceived(message);
      });
    });

    chromePort.start();

  }
});
