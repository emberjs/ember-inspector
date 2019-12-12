import QUnit from 'qunit';
import { next } from '@ember/runloop';
import BasicAdapter from '../adapters/basic';

let adapter = null;
let responders = [];

QUnit.testDone(() => {
  adapter = null;
  responders.length = 0;
});

export function sendResponse(response) {
  if (adapter === null) {
    throw new Error('Cannot call sendResponse outside of a test');
  }

  return new Promise(resolve => {
    next(() => {
      adapter._messageReceived({ ...response, from: 'inspectedWindow' });
      resolve();
    });
  });
}

export function registerResponderFor(type, payload, options = {}) {
  return new Promise(resolve => {
    let { count } = { count: 1, ...options };

    let callback = message => {
      if (message.type === type) {
        let result;

        if (typeof payload === 'function') {
          result = payload(message);
        } else {
          result = payload;
        }

        if (result !== undefined && count !== false) {
          if (--count === 0) {
            let idx = responders.indexOf(callback);
            responders.splice(idx, 1);
            resolve();
          }
        }

        return result;
      }
    };

    responders.push(callback);
  });
}

export default BasicAdapter.extend({
  name: 'test',

  init() {
    this._super(...arguments);
    adapter = this;
  },

  sendMessage(message) {
    if (!message.type) {
      QUnit.assert.ok(false, `message has valid "type" field: ${JSON.stringify(message)}`);
      return;
    }

    if (message.from !== 'devtools') {
      QUnit.assert.equal(message.from, 'devtools', `message has valid "from" field: ${JSON.stringify(message)}`);
      return;
    }

    for (let responder of responders) {
      let response = responder(message);

      if (response) {
        sendResponse(response);
        return;
      } else if (response === false) {
        return;
      }
    }

    QUnit.assert.deepEqual(message, {}, 'Unexpected message');
  }
});
