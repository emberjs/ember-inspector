import { visit, find, findAll, fillIn, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { triggerPort } from '../helpers/trigger-port';
import wait from 'ember-test-helpers/wait';

let port, message, name;

module('Promise Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
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
  });

  hooks.afterEach(function() {
    name = null;
    message = null;
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

    await triggerPort(this, 'promise:promisesUpdated', {
      promises: []
    });

    assert.dom('.js-promise-tree').doesNotExist("no promise list");
    assert.dom('.js-page-refresh').exists("page refresh hint seen");

    await click('.js-page-refresh-btn');

    assert.equal(name, 'general:refresh');

    await triggerPort(this, 'promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 1,
          label: 'Promise 1',
          state: 'created'
        })
      ]
    });

    assert.dom('.js-promise-tree').exists('promise tree is seen after being populated');
    assert.dom('.js-promise-tree-item').exists({ count: 1 }, '1 promise item can be seen');
    assert.dom('.js-page-refresh').doesNotExist('page refresh hint hidden');

    // make sure clearing does not show the refresh hint
    await click('.js-clear-promises-btn');

    assert.dom('.js-promise-tree').exists('promise-tree can be seen');
    assert.dom('.js-promise-tree-item').doesNotExist('promise items cleared');
    assert.dom('.js-page-refresh').doesNotExist('page refresh hint hidden');
  });

  test("Pending promise", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 1,
          label: 'Promise 1',
          state: 'created'
        })
      ]
    });
    await wait();

    assert.dom('.js-promise-tree-item').exists({ count: 1 });
    let row = find('.js-promise-tree-item');
    assert.dom(row.querySelector('.js-promise-label')).hasText('Promise 1');
    assert.dom(row.querySelector('.js-promise-state')).hasText('Pending');
  });


  test("Fulfilled promise", async function(assert) {
    await visit('/promise-tree');

    let now = Date.now();

    triggerPort(this, 'promise:promisesUpdated', {
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

    assert.dom('.js-promise-tree-item').exists({ count: 1 });
    let row = find('.js-promise-tree-item');
    assert.dom(row.querySelector('.js-promise-label')).hasText('Promise 1');
    assert.dom(row.querySelector('.js-promise-state')).hasText('Fulfilled');
    assert.dom(row.querySelector('.js-promise-value')).hasText('value');
    assert.dom(row.querySelector('.js-promise-time')).hasText('10.00ms');
  });


  test("Rejected promise", async function(assert) {
    await visit('/promise-tree');

    let now = Date.now();

    await triggerPort(this, 'promise:promisesUpdated', {
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

    assert.dom('.js-promise-tree-item').exists({ count: 1 });
    let row = find('.js-promise-tree-item');
    assert.dom(row.querySelector('.js-promise-label')).hasText('Promise 1');
    assert.dom(row.querySelector('.js-promise-state')).hasText('Rejected');
    assert.dom(row.querySelector('.js-promise-value')).hasText('reason');
    assert.dom(row.querySelector('.js-promise-time')).hasText('20.00ms');
  });

  test("Chained promises", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
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
    assert.dom(rows[0].querySelector('.js-promise-label')).hasText('Parent');
    await click(rows[0].querySelector('.js-promise-label'));

    rows = findAll('.js-promise-tree-item');
    assert.equal(rows.length, 2, 'Chain now expanded');
    assert.dom(rows[1].querySelector('.js-promise-label')).hasText('Child');
  });

  test("Can trace promise when there is a stack", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
      promises: [generatePromise({ guid: 1, hasStack: true })]
    });

    await click('.js-trace-promise-btn');

    assert.equal(name, 'promise:tracePromise');
    assert.deepEqual(message, { promiseId: 1 });
  });


  test("Trace button hidden if promise has no stack", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
      promises: [generatePromise({ guid: 1, hasStack: false })]
    });

    assert.dom('.js-trace-promise-btn').doesNotExist();
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

    await triggerPort(this, 'promise:promisesUpdated', {
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
    assert.dom('.js-send-to-console-btn').hasText('Stack Trace');
    await click(row.querySelector('.js-send-to-console-btn'));

    assert.equal(name, 'promise:sendValueToConsole');
    assert.deepEqual(message, { promiseId: 1 });
  });


  test("Send fulfillment value to console", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
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
    await click(row.querySelector('.js-send-to-console-btn'));

    assert.equal(name, 'promise:sendValueToConsole');
    assert.deepEqual(message, { promiseId: 1 });
  });

  test("Sending objects to the object inspector", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
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
    await click(row.querySelector('.js-promise-object-value'));

    assert.equal(name, 'objectInspector:inspectById');
    assert.deepEqual(message, { objectId: 100 });
  });

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    await visit('/promise-tree');

    await triggerPort(this, 'promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 1,
          label: 'Promise 1',
          state: 'created'
        })
      ]
    });
    await wait();

    assert.dom('.js-promise-tree-item').exists({ count: 1 });
    await fillIn('.js-promise-search input', 'xxxxx');
    assert.dom('.js-promise-tree-item').doesNotExist();
    await click('.js-search-field-clear-button');
    assert.dom('.js-promise-tree-item').exists({ count: 1 });
  });
});
