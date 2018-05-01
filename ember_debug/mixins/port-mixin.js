const Ember = window.Ember;
const { Mixin } = Ember;
export default Mixin.create({
  port: null,
  messages: {},

  portNamespace: null,

  init() {
    this._super(...arguments);

    this.setupOrRemovePortListeners('on');
  },

  willDestroy() {
    this._super(...arguments);

    this.setupOrRemovePortListeners('off');
  },

  sendMessage(name, message) {
    this.get('port').send(this.messageName(name), message);
  },

  messageName(name) {
    let messageName = name;
    if (this.get('portNamespace')) {
      messageName = `${this.get('portNamespace')}:${messageName}`;
    }
    return messageName;
  },

  /**
   * Setup or tear down port listeners. Call on `init` and `willDestroy`
   * @param {String} onOrOff 'on' or 'off' the functions to call i.e. port.on or port.off for adding or removing listeners
   */
  setupOrRemovePortListeners(onOrOff) {
    let port = this.get('port');
    let messages = this.get('messages');

    for (let name in messages) {
      if (messages.hasOwnProperty(name)) {
        port[onOrOff](this.messageName(name), this, messages[name]);
      }
    }
  }
});
