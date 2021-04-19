import BasicAdapter from './basic';
import { typeOf } from '../utils/type-check';

const Ember = require.has('ember') ? require('ember')['default'] : window.Ember;
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
    const channel = this._channel;
    return this._super(...arguments).then(
      () => {
        window.postMessage('debugger-client', '*', [channel.port2]);
        this._listen();
      },
      null,
      'ember-inspector'
    );
  },

  sendMessage(options = {}) {
    // If prototype extensions are disabled, `Ember.A()` arrays
    // would not be considered native arrays, so it's not possible to
    // "clone" them through postMessage unless they are converted to a
    // native array.
    options = deepClone(options);
    this._chromePort.postMessage(options);
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
    // to that div and shadow the "global" inspect function with no way
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
    let chromePort = this._chromePort;

    chromePort.addEventListener('message', (event) => {
      const message = event.data;

      // We should generally not be run-wrapping here. Starting a runloop in
      // ember-debug will cause the inspected app to revalidate/rerender. We
      // are generally not intending to cause changes to the rendered output
      // of the app, so this is generally unnecessary, and in big apps this
      // could be quite slow. There is nothing special about the `view:*`
      // messages – I (GC) just happened to have reviewed all of them recently
      // and can be quite sure that they don't need the runloop. We should
      // audit the rest of them and see if we can remove the else branch. I
      // think we most likely can. In the limited cases (if any) where the
      // runloop is needed, the callback code should just do the wrapping
      // themselves.
      if (message.type.startsWith('view:')) {
        this._messageReceived(message);
      } else {
        run(() => {
          this._messageReceived(message);
        });
      }
    });

    chromePort.start();
  },
});

// On some older Ember version `Ember.ENV.EXTEND_PROTOTYPES` is not
// guarenteed to be an object. While this code only support 3.4+ (all
// of which normalizes `EXTEND_PROTOTYPES` for us), startup-wrapper.js
// eagerly require/load ember-debug modules, which ultimately causes
// this top-level code to run, even we are going to pick a different
// adapter later. See GH #1114.
const HAS_ARRAY_PROTOTYPE_EXTENSIONS = (() => {
  try {
    return Ember.ENV.EXTEND_PROTOTYPES.Array === true;
  } catch (e) {
    return false;
  }
})();

let deepClone;

if (HAS_ARRAY_PROTOTYPE_EXTENSIONS) {
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
      keys(item).forEach((key) => {
        clone[key] = deepClone(item[key]);
      });
    }
    return clone;
  };
}
