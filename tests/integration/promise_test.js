/* jshint ignore:start */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module, skip } from 'qunit';
import startApp from '../helpers/start-app';
const { $ } = Ember;

let App;
let port, message, name;

module('Promise Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
    port.reopen({
      send: function(n, m) {
        if (n === 'promise:getAndObservePromises') {
          port.trigger('promise:promisesUpdated', {
            promises: []
          });
        }
        if (n === 'promise:supported') {
          this.trigger('promise:supported', {
            supported: true
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
  return $.extend({
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

test("Backwards compatibility - no promise support", async function t(assert) {
  port.reopen({
    send(n/*, m*/) {
      if (n === 'promise:supported') {
        this.trigger('promise:supported', {
          supported: false
        });
      }
    }
  });

  await visit('/promises');

  assert.equal(findByLabel('error-page').length, 1, 'The error page should show up');
  assert.equal(findByLabel('error-page-title').text().trim(), 'Promises not detected!');
});

test("Shows page refresh hint if no promises", async function t(assert) {
  await visit('/promises');

  await triggerPort('promise:promisesUpdated', {
    promises: []
  });

  assert.equal(findByLabel('promise-tree').length, 0, "no promise list");
  assert.equal(findByLabel('page-refresh').length, 1, "page refresh hint seen");

  await clickByLabel('page-refresh-btn');

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

  assert.equal(findByLabel('promise-tree').length, 1, 'promise tree is seen after being populated');
  assert.equal(findByLabel('promise-item').length, 1, '1 promise item can be seen');
  assert.equal(findByLabel('page-refresh').length, 0, 'page refresh hint hidden');

  // make sure clearing does not show the refresh hint
  await clickByLabel('clear-promises-btn');

  assert.equal(findByLabel('promise-tree').length, 1, 'promise-tree can be seen');
  assert.equal(findByLabel('promise-item').length, 0, 'promise items cleared');
  assert.equal(findByLabel('page-refresh').length, 0, 'page refresh hint hidden');
});

test("Pending promise", async function t(assert) {

  await visit('/promises');

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

  assert.equal(findByLabel('promise-item').length, 1);
  let row = findByLabel('promise-item').first();
  assert.equal(findByLabel('promise-label', row).text().trim(), 'Promise 1');
  assert.equal(findByLabel('promise-state', row).text().trim(), 'Pending');
});


test("Fulfilled promise", async function t(assert) {
  await visit('/promises');

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

  assert.equal(findByLabel('promise-item').length, 1);
  let row = findByLabel('promise-item').first();
  assert.equal(findByLabel('promise-label', row).text().trim(), 'Promise 1');
  assert.equal(findByLabel('promise-state', row).text().trim(), 'Fulfilled');
  assert.equal(findByLabel('promise-value', row).text().trim(), 'value');
  assert.equal(findByLabel('promise-time', row).text().trim(), '10.00ms');
});


test("Rejected promise", async function t(assert) {
  await visit('/promises');

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

  assert.equal(findByLabel('promise-item').length, 1);
  let row = findByLabel('promise-item').first();
  assert.equal(findByLabel('promise-label', row).text().trim(), 'Promise 1');
  assert.equal(findByLabel('promise-state', row).text().trim(), 'Rejected');
  assert.equal(findByLabel('promise-value', row).text().trim(), 'reason');
  assert.equal(findByLabel('promise-time', row).text().trim(), '20.00ms');
});

test("Chained promises", async function t(assert) {
  await visit('/promises');

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

  let rows = findByLabel('promise-item');
  assert.equal(rows.length, 1, 'Collpased by default');
  assert.equal(findByLabel('promise-label', rows.eq(0)).text().trim(), 'Parent');
  await clickByLabel('promise-label', rows.eq(0));

  rows = findByLabel('promise-item');
  assert.equal(rows.length, 2, 'Chain now expanded');
  assert.equal(findByLabel('promise-label', rows.eq(1)).text().trim(), 'Child');
});

test("Can trace promise when there is a stack", async function t(assert) {
  await visit('/promises');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({ guid: 1, hasStack: true })]
  });

  await clickByLabel('trace-promise-btn');

  assert.equal(name, 'promise:tracePromise');
  assert.deepEqual(message, { promiseId: 1 });
});


test("Trace button hidden if promise has no stack", async function t(assert) {
  await visit('/promises');

  await triggerPort('promise:promisesUpdated', {
    promises: [generatePromise({ guid: 1, hasStack: false })]
  });

  assert.equal(findByLabel('trace-promise-btn').length, 0);
});

test("Toggling promise trace option", async function t(assert) {
  assert.expect(3);

  await visit('/promises');

  let input = findByLabel('with-stack').find('input');
  assert.ok(!input.prop('checked'), 'should not be checked by default');
  await click(input);

  assert.equal(name, 'promise:setInstrumentWithStack');
  assert.equal(message.instrumentWithStack, true);
});

test("Logging error stack trace in the console", async function t(assert) {
  await visit('/promises');

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

  let row = findByLabel('promise-item').first();
  assert.equal(findByLabel('send-to-console-btn').text().trim(), 'Stack trace');
  await clickByLabel('send-to-console-btn', row);

  assert.equal(name, 'promise:sendValueToConsole');
  assert.deepEqual(message, { promiseId: 1 });
});


skip("Send fulfillment value to console", async function t(assert) {
  await visit('/promises');

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

  let row = findByLabel('promise-item').first();
  await clickByLabel('send-to-console-btn', row);

  assert.equal(name, 'promise:sendValueToConsole');
  assert.deepEqual(message, { promiseId: 1 });
});

test("Sending objects to the object inspector", async function t(assert) {
  await visit('/promises');

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

  let row = findByLabel('promise-item').first();
  await clickByLabel('promise-object-value', row);

  assert.equal(name, 'objectInspector:inspectById');
  assert.deepEqual(message, { objectId: 100 });
});
