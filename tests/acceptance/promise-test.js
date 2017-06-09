import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
import { visit, find, findAll, click } from 'ember-native-dom-helpers';

let App;
let port, message, name;

module('Promise Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
    port.reopen({
      send(n, m) {
        if (n === 'promise:getAndObservePromises') {
          port.trigger('promise:promisesUpdated', {
            promises: []
          });
        }
        name = n;
        message = m;
      }
    });
  },
  afterEach() {
    name = null;
    message = null;
    Ember.run(App, App.destroy);
  }
});

let guids = 0;
function generatePromise(props) {
  return Object.assign({
    guid: ++guids,
    label: 'Generated Promise',
    parent: null,
    children: null,
    state: 'created',
    value: null,
    reason: null,
    createdAt: Date.now(),
    hasStack: false
  }, props);
}

test("Shows page refresh hint if no promises", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: []
  });

  assert.notOk(find('.js-promise-tree'), "no promise list");
  assert.ok(find('.js-page-refresh'), "page refresh hint seen");

  await click('.js-page-refresh-btn');

  assert.equal(name, 'general:refresh');

  await triggerPort('promise:promisesUpdated', {
    promises: [
      generatePromise({
        guid: 1,
        label: 'Promise 1',
        state: 'created'
      })
    ]
  });

  assert.ok(find('.js-promise-tree'), 'promise tree is seen after being populated');
  assert.equal(findAll('.js-promise-tree-item').length, 1, '1 promise item can be seen');
  assert.notOk(find('.js-page-refresh'), 'page refresh hint hidden');

  // make sure clearing does not show the refresh hint
  await click('.js-clear-promises-btn');

  assert.ok(find('.js-promise-tree'), 'promise-tree can be seen');
  assert.notOk(find('.js-promise-tree-item'), 'promise items cleared');
  assert.notOk(find('.js-page-refresh'), 'page refresh hint hidden');
});

test("Pending promise", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [
      generatePromise({
        guid: 1,
        label: 'Promise 1',
        state: 'created'
      })
    ]
  });
  await wait();

  assert.equal(findAll('.js-promise-tree-item').length, 1);
  let row = find('.js-promise-tree-item');
  assert.equal(find('.js-promise-label', row).textContent.trim(), 'Promise 1');
  assert.equal(find('.js-promise-state', row).textContent.trim(), 'Pending');
});


test("Fulfilled promise", async function(assert) {
  await visit('/promise-tree');

  let now = Date.now();

  triggerPort('promise:promisesUpdated', {
    promises: [
      generatePromise({
        guid: 1,
        label: 'Promise 1',
        state: 'fulfilled',
        value: {
          inspect: 'value',
          type: 'type-string'
        },
        createdAt: now,
        settledAt: now + 10
      })
    ]
  });
  await wait();

  assert.equal(findAll('.js-promise-tree-item').length, 1);
  let row = find('.js-promise-tree-item');
  assert.equal(find('.js-promise-label', row).textContent.trim(), 'Promise 1');
  assert.equal(find('.js-promise-state', row).textContent.trim(), 'Fulfilled');
  assert.equal(find('.js-promise-value', row).textContent.trim(), 'value');
  assert.equal(find('.js-promise-time', row).textContent.trim(), '10.00ms');
});


test("Rejected promise", async function(assert) {
  await visit('/promise-tree');

  let now = Date.now();

  await triggerPort('promise:promisesUpdated', {
    promises: [
      generatePromise({
        guid: 1,
        label: 'Promise 1',
        state: 'rejected',
        reason: {
          inspect: 'reason',
          type: 'type-string'
        },
        createdAt: now,
        settledAt: now + 20
      })
    ]
  });

  assert.equal(findAll('.js-promise-tree-item').length, 1);
  let row = find('.js-promise-tree-item');
  assert.equal(find('.js-promise-label', row).textContent.trim(), 'Promise 1');
  assert.equal(find('.js-promise-state', row).textContent.trim(), 'Rejected');
  assert.equal(find('.js-promise-value', row).textContent.trim(), 'reason');
  assert.equal(find('.js-promise-time', row).textContent.trim(), '20.00ms');
});

test("Chained promises", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [
      generatePromise({
        guid: 2,
        parent: 1,
        label: 'Child'
      }),
      generatePromise({
        guid: 1,
        children: [2],
        label: 'Parent'
      })
    ]
  });

  let rows = findAll('.js-promise-tree-item');
  assert.equal(rows.length, 1, 'Collpased by default');
  assert.equal(find('.js-promise-label', rows[0]).textContent.trim(), 'Parent');
  await click('.js-promise-label', rows[0]);

  rows = findAll('.js-promise-tree-item');
  assert.equal(rows.length, 2, 'Chain now expanded');
  assert.equal(find('.js-promise-label', rows[1]).textContent.trim(), 'Child');
});

test("Can trace promise when there is a stack", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({ guid: 1, hasStack: true })]
  });

  await click('.js-trace-promise-btn');

  assert.equal(name, 'promise:tracePromise');
  assert.deepEqual(message, { promiseId: 1 });
});


test("Trace button hidden if promise has no stack", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({ guid: 1, hasStack: false })]
  });

  assert.notOk(find('.js-trace-promise-btn'));
});

test("Toggling promise trace option", async function(assert) {
  assert.expect(3);

  await visit('/promise-tree');

  let input = find('.js-with-stack input');
  assert.notOk(input.checked, 'should not be checked by default');
  await click(input);

  assert.equal(name, 'promise:setInstrumentWithStack');
  assert.equal(message.instrumentWithStack, true);
});

test("Logging error stack trace in the console", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({
      guid: 1,
      state: 'rejected',
      reason: {
        inspect: 'some error',
        type: 'type-error'
      }
    })]
  });

  let row = find('.js-promise-tree-item');
  assert.equal(find('.js-send-to-console-btn').textContent.trim(), 'Stack trace');
  await click('.js-send-to-console-btn', row);

  assert.equal(name, 'promise:sendValueToConsole');
  assert.deepEqual(message, { promiseId: 1 });
});


test("Send fulfillment value to console", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({
      guid: 1,
      state: 'fulfilled',
      value: {
        inspect: 'some string',
        type: 'type-string'
      }
    })]
  });

  let row = find('.js-promise-tree-item');
  await click('.js-send-to-console-btn', row);

  assert.equal(name, 'promise:sendValueToConsole');
  assert.deepEqual(message, { promiseId: 1 });
});

test("Sending objects to the object inspector", async function(assert) {
  await visit('/promise-tree');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({
      guid: 1,
      state: 'fulfilled',
      value: {
        inspect: 'Some Object',
        type: 'type-ember-object',
        objectId: 100
      }
    })]
  });

  let row = find('.js-promise-tree-item');
  await click('.js-promise-object-value', row);

  assert.equal(name, 'objectInspector:inspectById');
  assert.deepEqual(message, { objectId: 100 });
});
