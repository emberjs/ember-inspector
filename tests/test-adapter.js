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
      if (!isNaN(expected) && actual !== expected) {
        QUnit.assert.strictEqual(actual, expected, `The correct amount of ${type} messages are sent`);
        reject(`Expecting ${expected} ${type} messages, got ${actual}`);
      }
    }
  }

  responders.length = 0;
});

export function sendMessage(response) {
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
      actual: 0,
      expected: count === false ? NaN : count,
      resolve,
      reject,
    });
  });
}

export default class extends BasicAdapter {
  name = 'test';

  constructor() {
    super(...arguments);
    adapter = this;
  }

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

    for (let responder of responders) {
      let { type, callback, actual, expected, resolve } = responder;

      if (actual === expected) {
        continue;
      }

      if (type === message.type) {
        let response = callback(message);

        if (response !== undefined) {
          responder.actual = ++actual;
        }

        let didRespond;

        if (response) {
          console.debug('Received response (inspectedWindow -> devtools)', response);
          didRespond = sendMessage(response);
        } else if (response === false) {
          console.debug('Ignoreing message (devtools -> inspectedWindow)', message);
          didRespond = Promise.resolve();
        }

        if (didRespond) {
          if (actual === expected) {
            didRespond.then(resolve);
          }

          return;
        }
      }
    }

    console.error('Unexpected message', message);

    QUnit.assert.deepEqual(message, {}, 'Unexpected message');
  }
}
