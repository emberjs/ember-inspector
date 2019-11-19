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
   * Open the devtools "Elements" and select an DOM node.
   *
   * @param  {Node} node The DOM node to select
   */
  inspectNode(node) {
    // NOTE:
    //
    // Basically, we are just trying to call `inspect(node)` here.
    // However, `inspect` is a special function that is in the global
    // scope but not on the global object (i.e. `window.inspect`) does
    // not work. This sometimes causes problems, because, e.g. if the
    // page has a div with the ID `inspect`, `window.inspect` will point
    // to that div and shadown the "global" inspect function with no way
    // to get it back. That causes "`inspect` is not a function" errors.
    //
    // As it turns out, however, when the extension page evals, the
    // `inspect` function does not get shadowed. So, we can ask the
    // inspector extension page to call that function for us, using
    // `inspected.Window.eval('inspect(node)')`.
    //
    // However, since we cannot just send the DOM node directly to the
    // extension, we will have to store it in a temporary global variable
    // so that the extension can find it.

    let name = `__EMBER_INSPECTOR_${(Math.random() * 100000000).toFixed(0)}`;

    window[name] = node;

    this.get('namespace.port').send('view:inspectDOMNode', { name });
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
function deepClone(item) {
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
}
