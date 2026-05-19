import QUnit from 'qunit';
import { next } from '@ember/runloop';
import BasicAdapter from 'ember-inspector/services/adapters/basic';
import { settled } from '@ember/test-helpers';

let adapter = null;
let resourcesEnabled = false;
let resources = [];
let responders = [];

export function setupTestAdapter(hooks) {
  // Some default responders that are part of the normal application boot cycle
  hooks.beforeEach(function () {
    respondWith('check-version', false, { isDefault: true });

    respondWith(
      'general:applicationBooted',
      {
        type: 'general:applicationBooted',
        applicationId: 'my-app',
        applicationName: 'My App',
        booted: true,
      },
      { isDefault: true },
    );

    respondWith(
      'app-picker-loaded',
      {
        type: 'apps-loaded',
        applicationId: null,
        applicationName: null,
        apps: [
          {
            applicationId: 'my-app',
            applicationName: 'My App',
          },
        ],
      },
      { isDefault: true },
    );

    respondWith('app-selected', false, { isDefault: true });

    respondWith(
      'deprecation:getCount',
      ({ applicationId, applicationName }) => ({
        type: 'deprecation:count',
        applicationId,
        applicationName,
        count: 0,
      }),
      { isDefault: true },
    );
  });

  // Ensure all expectations are met and reset the global states
  hooks.afterEach(function (assert) {
    for (let { file, line, actual, expected, reject } of resources) {
      if (!isNaN(expected) && actual !== expected) {
        assert.strictEqual(
          actual,
          expected,
          `Expceting resouce ${file}:${line} to be opened ${expected} time(s)`,
        );
        reject(
          `Expceting resouce ${file}:${line} to be opened ${expected} time(s), was opened ${actual} time(s)`,
        );
      }
    }

    for (let { type, isDefault, actual, expected, reject } of responders) {
      if (!isDefault && !isNaN(expected) && actual !== expected) {
        assert.strictEqual(
          actual,
          expected,
          `The correct amount of ${type} messages are sent`,
        );
        reject(`Expecting ${expected} ${type} messages, got ${actual}`);
      }
    }

    adapter = null;
    resourcesEnabled = false;
    resources.length = 0;
    responders.length = 0;
  });
}

/**
 * Allow `openResouce` to be called on the adapter.
 *
 * @method enableOpenResource
 */
export function enableOpenResource() {
  resourcesEnabled = true;
}

/**
 * Expect `openResouce` to be called on the adapter with a specific filename and
 * line number. Must call `enableOpenResource` first.
 *
 * @method expectOpenResource
 * @param {String} file       The filename.
 * @param {number} line       The line number.
 * @param {Object} options
 *  - {number | false} count  How many calls to allow. `false` for unlimited.
 *                            Defaults to 1.
 * @return {Promise}          Resolves when all the expected calls are made, or
 *                            rejects at the end of the current test if not called
 *                            enough times.
 */
export function expectOpenResource(file, line, options = {}) {
  if (!resourcesEnabled) {
    throw new Error('call enableOpenResource first');
  }

  return new Promise((resolve, reject) => {
    let { count } = { count: 1, ...options };
    resources.push({
      file,
      line,
      actual: 0,
      expected: count === false ? NaN : count,
      resolve,
      reject,
    });
  });
}

/**
 * Send a message to the adapter.
 *
 * @method expectOpenResource
 * @param {Object} message    The message.
 * @return {Promise}          Resolves when the message is delivered.
 */
export async function sendMessage(message) {
  if (adapter === null) {
    throw new Error('Cannot call sendMessage outside of a test');
  }

  const msg = await new Promise((resolve, reject) => {
    // eslint-disable-next-line ember/no-runloop
    next(async () => {
      let normalized = {
        applicationId: 'my-app',
        applicationName: 'My App',
        ...message,
        from: 'inspectedWindow',
      };
      try {
        adapter._messageReceived(normalized);
      } catch (e) {
        return reject(e);
      }

      resolve(normalized);
    });
  });

  await settled();
  return msg;
}

/**
 * Expect a message from the adapter of the given type, and respond to the message
 * with the given payload.
 *
 * @method respondWith
 * @param {String} type                          The incoming message type.
 * @param { false | Object | Function } payload  The payload.
 *   - Pass `false` to acknoledge the message but don't send a response.
 *   - Pass an object to send a response (`message` parameter of `sendMessage`).
 *   - Pass a callback to dynamically respond with one of the above, or `undefined`,
 *     in which case the incoming messages is considered unhandled and the remaining
 *     responders will be tried instead. The callback is given the incoming message
 *     as an argument.
 * @param {Object} options
 *  - {number | false} count  How many calls to allow. `false` for unlimited.
 *                            Defaults to 1.
 * @return {Promise}          Resolves when all the expected calls are made, or
 *                            rejects at the end of the current test if not called
 *                            enough times.
 */
export function respondWith(type, payload, options = {}) {
  return new Promise((resolve, reject) => {
    let { count, isDefault } = { count: 1, isDefault: false, ...options };
    let callback = typeof payload === 'function' ? payload : () => payload;

    responders.push({
      type,
      isDefault,
      callback,
      actual: 0,
      expected: count === false ? NaN : count,
      resolve,
      reject,
    });
  });
}

/**
 * Disable the default responder for the given type.
 *
 * @method disableDefaultResponseFor
 */
export function disableDefaultResponseFor(type) {
  for (let [i, responder] of responders.entries()) {
    if (responder.type === type && responder.isDefault) {
      if (responder.actual > 0) {
        throw new Error(
          `Cannot remove default responder for ${type}: a response has already been sent!`,
        );
      }

      responders.splice(i, 1);
      return;
    }
  }

  throw new Error(
    `Cannot remove default responder for ${type}: no such responder!`,
  );
}

export default class TestAdapter extends BasicAdapter {
  constructor() {
    super(...arguments);
    adapter = this;
  }

  get name() {
    return 'test';
  }

  get canOpenResource() {
    return resourcesEnabled;
  }

  openResource(file, line) {
    if (!resourcesEnabled) {
      throw new Error('openResource called unexpectedly');
    }

    console.debug('Opening resource', { file, line });

    if (!file) {
      QUnit.assert.ok(
        file,
        `resource has valid "file" field: ${JSON.stringify(file)}`,
      );
      return;
    }

    if (!line) {
      QUnit.assert.ok(
        file,
        `resource has valid "line" field: ${JSON.stringify(line)}`,
      );
      return;
    }

    for (let resource of resources) {
      let { actual, expected, resolve } = resource;

      if (actual === expected) {
        continue;
      }

      if (file === resource.file && line === resource.line) {
        console.debug('Opened resource', { file, line });
        resource.actual = ++actual;
        resolve();
        return;
      }
    }

    console.error('Unknown resource', { file, line });

    QUnit.assert.deepEqual({ file, line }, {}, 'Unknown resource');
  }

  sendMessage(message) {
    console.debug('Sending message (devtools -> inspectedWindow)', message);

    if (!message.type) {
      QUnit.assert.ok(
        false,
        `message has valid "type" field: ${JSON.stringify(message)}`,
      );
      return;
    }

    if (message.from !== 'devtools') {
      QUnit.assert.strictEqual(
        message.from,
        'devtools',
        `message has valid "from" field: ${JSON.stringify(message)}`,
      );
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
          console.debug(
            'Received response (inspectedWindow -> devtools)',
            response,
          );
          didRespond = sendMessage(response);
        } else if (response === false) {
          console.debug(
            'Ignoreing message (devtools -> inspectedWindow)',
            message,
          );
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
