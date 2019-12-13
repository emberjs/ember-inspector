/* eslint-disable no-console */
import QUnit from 'qunit';
import { next } from '@ember/runloop';
import BasicAdapter from '../adapters/basic';

let adapter = null;
let responders = [];

QUnit.testDone(({ failed }) => {
  adapter = null;

  if (failed === 0) {
    for (let { type, actual, expected, reject } of responders) {
      if (!isNaN(expected)) {
        QUnit.assert.strictEqual(actual, expected, `The correct amount of ${type} messages are sent`);
        reject(`Expecting ${expected} ${type} messages, got ${actual}`);
      }
    }
  }

  responders.length = 0;
});

export function sendResponse(response) {
  if (adapter === null) {
    throw new Error('Cannot call sendResponse outside of a test');
  }

  return new Promise(resolve => {
    next(() => {
      let normalized = { ...response, from: 'inspectedWindow' };
      adapter._messageReceived(normalized);
      resolve(normalized);
    });
  });
}

export function registerResponderFor(type, payload, options = {}) {
  return new Promise((resolve, reject) => {
    let { count } = { count: 1, ...options };
    let callback = (typeof payload === 'function') ? payload : () => payload;

    responders.push({
      type,
      callback,
      expected: count === false ? NaN : count,
      actual: 0,
      resolve,
      reject,
    });
  });
}

export default BasicAdapter.extend({
  name: 'test',

  init() {
    this._super(...arguments);
    adapter = this;
  },

  sendMessage(message) {
    console.debug('Sending message (devtools -> inspectedWindow)', message);

    if (!message.type) {
      QUnit.assert.ok(false, `message has valid "type" field: ${JSON.stringify(message)}`);
      return;
    }

    if (message.from !== 'devtools') {
      QUnit.assert.equal(message.from, 'devtools', `message has valid "from" field: ${JSON.stringify(message)}`);
      return;
    }

    for (let [i, responder] of responders.entries()) {
      if (responder.type === message.type) {
        let response = responder.callback(message);

        if (response !== undefined) {
          responder.actual++;
        }

        let didRespond;

        if (response) {
          console.debug('Received response (inspectedWindow -> devtools)', response);
          didRespond = sendResponse(response);
        } else if (response === false) {
          console.debug('Ignoreing message (devtools -> inspectedWindow)', message);
          didRespond = Promise.resolve();
        }

        if (didRespond) {
          if (responder.expected === responder.actual) {
            responders.splice(i, 1);
            didRespond.then(responder.resolve);
          }

          return;
        }
      }
    }

    console.error('Unexpected message', message);

    QUnit.assert.deepEqual(message, {}, 'Unexpected message');
  }
});
