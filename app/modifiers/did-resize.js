import { assert } from '@ember/debug';
import { debounce as runloopDebounce, cancel } from '@ember/runloop';
import Modifier from 'ember-modifier';
import elementResizeDetector from 'element-resize-detector';

// Loosely based on gmurphey/ember-did-resize-modifier which is
// currently broken for Ember 4.0; if it's fixed, we can switch
// back (though the code isn't that involved and it's not that
// unreasonable to maintain it in-tree)
export default class DidResize extends Modifier {
  detector = elementResizeDetector({
    strategy: 'scroll',
  });

  debounceId = null;
  listener = null;

  get callback() {
    let callback = this.args.positional[0];

    assert(
      `{{did-resize}} modifier: '${callback}' is not a valid callback. Provide a function.`,
      typeof callback === 'function'
    );

    return callback;
  }

  get debounce() {
    let debounce = this.args.named.debounce ?? 0;

    assert(
      `{{did-resize}} modifier: '${debounce}' is not a valid value for the debounce argument. Provide a number.`,
      typeof debounce === 'number' && !isNaN(debounce)
    );

    return debounce;
  }

  didReceiveArguments() {
    this.teardown();
    this.setup();
  }

  willDestroy() {
    this.teardown();
  }

  setup() {
    let { callback, debounce, element } = this;
    let listener = callback;

    if (debounce !== 0) {
      listener = (...args) => {
        this.debounceId = runloopDebounce(callback, ...args, debounce);
      };
    }

    this.detector.listenTo({ callOnAdd: false }, element, listener);
  }

  teardown() {
    let { debounceId, element, listener } = this;

    if (debounceId) {
      cancel(debounceId);
    }

    if (listener) {
      this.detector.removeListener(element, listener);
    }

    this.debounceId = null;
    this.listener = null;
  }
}
