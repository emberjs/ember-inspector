import BasicAdapter from './basic';
import { typeOf } from '../utils/type-check';

const Ember = window.Ember;
const { run } = Ember;
const { isArray } = Array;
const { keys } = Object;

export default BasicAdapter.extend({
  init() {
    this.set('_channel', new MessageChannel());
    this.set('_chromePort', this.get('_channel.port1'));

    this._super(...arguments);
  },

  connect() {
    const channel = this.get('_channel');
    return this._super(...arguments).then(() => {
      window.postMessage('debugger-client', '*', [channel.port2]);
      this._listen();
    }, null, 'ember-inspector');
  },

  sendMessage(options = {}) {
    // If prototype extensions are disabled, `Ember.A()` arrays
    // would not be considered native arrays, so it's not possible to
    // "clone" them through postMessage unless they are converted to a
    // native array.
    options = deepClone(options);
    this.get('_chromePort').postMessage(options);
  },

  /**
   * Open the devtools "Elements" and select an element.
   *
   * NOTE:
   * This method was supposed to call `inspect` which is a Chrome specific function
   * that can either be called from the console or from code evaled using `inspectedWindow.eval`
   * (which is how this code is executed). See https://developer.chrome.com/extensions/devtools#evaluating-js.
   * However for some reason Chrome 52+ has started throwing an Error that `inspect`
   * is not a function when called from this code. The current workaround is to
   * message the Ember Ibspector asking it to execute `inspected.Window.eval('inspect(element)')`
   * for us.
   *
   * @param  {HTMLElement} elem The element to select
   */
  inspectElement(elem) {
    /* inspect(elem); */
    this.get('namespace.port').send('view:inspectDOMNode', {
      selector: `//*[@id="${elem.getAttribute('id')}"]`
    });
  },

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

let deepClone;

if (Ember.ENV.EXTEND_PROTOTYPES.Array) {
  deepClone = function deepClone(item) {
    return item;
  };
} else {
  /**
   * Recursively clones all arrays. Needed because Chrome
   * refuses to clone Ember Arrays when extend prototypes is disabled.
   *
   * If the item passed is an array, a clone of the array is returned.
   * If the item is an object or an array, or array properties/items are cloned.
   *
   * @param {Mixed} item The item to clone
   * @return {Mixed}
   */
  deepClone = function deepClone(item) {
    let clone = item;
    if (isArray(item)) {
      clone = new Array(item.length);
      item.forEach((child, key) => {
        clone[key] = deepClone(child);
      });
    } else if (item && typeOf(item) === 'object') {
      clone = {};
      keys(item).forEach(key => {
        clone[key] = deepClone(item[key]);
      });
    }
    return clone;
  };
}
