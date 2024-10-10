import {
  click,
  fillIn,
  find,
  findAll,
  settled,
  visit,
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

let guids = 0;

function generatePromise(props) {
  return {
    guid: `ember${++guids}`,
    label: 'Generated Promise',
    parent: null,
    children: null,
    state: 'created',
    value: null,
    reason: null,
    createdAt: Date.now(),
    hasStack: false,
    ...props,
  };
}

module('Promise Tab', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  outer.beforeEach(function () {
    respondWith('promise:getInstrumentWithStack', {
      type: 'promise:instrumentWithStack',
      instrumentWithStack: false,
    });
  });

  module('No promises initially', function (inner) {
    inner.beforeEach(function () {
      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [],
      });
    });

    test('Shows page refresh hint if no promises', async function (assert) {
      await visit('/promise-tree');

      assert.dom('.js-promise-tree').doesNotExist('no promise list');
      assert.dom('.js-page-refresh').exists('page refresh hint seen');

      respondWith('general:refresh', false);
      respondWith('promise:releasePromises', false);

      await click('.js-page-refresh-btn');
    });

    test('Promise tree can update after initially showing as unavailable', async function (assert) {
      await visit('/promise-tree');

      assert.dom('.js-promise-tree').doesNotExist('no promise list');
      assert.dom('.js-page-refresh').exists('page refresh hint seen');

      await sendMessage({
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            label: 'Promise 1',
            state: 'created',
          }),
        ],
      });

      // Why is this needed?
      await settled();

      assert
        .dom('.js-promise-tree')
        .exists('promise tree is seen after being populated');
      assert
        .dom('.js-promise-tree-item')
        .exists({ count: 1 }, '1 promise item can be seen');
      assert.dom('.js-page-refresh').doesNotExist('page refresh hint hidden');

      // make sure clearing does not show the refresh hint
      await click('.js-clear-promises-btn');

      assert.dom('.js-promise-tree').exists('promise-tree can be seen');
      assert.dom('.js-promise-tree-item').doesNotExist('promise items cleared');
      assert.dom('.js-page-refresh').doesNotExist('page refresh hint hidden');

      respondWith('promise:releasePromises', false);
    });
  });

  module('Some promises', function (inner) {
    inner.afterEach(function () {
      respondWith('promise:releasePromises', false);
    });

    test('Pending promise', async function (assert) {
      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            label: 'Promise 1',
            state: 'created',
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('.js-promise-tree-item').exists({ count: 1 });

      let row = find('.js-promise-tree-item');
      assert.dom(row.querySelector('.js-promise-label')).hasText('Promise 1');
      assert.dom(row.querySelector('.js-promise-state')).hasText('Pending');
    });

    test('Fulfilled promise', async function (assert) {
      let now = Date.now();

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            label: 'Promise 1',
            state: 'fulfilled',
            value: {
              inspect: 'value',
              type: 'type-string',
            },
            createdAt: now,
            settledAt: now + 10,
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('.js-promise-tree-item').exists({ count: 1 });

      let row = find('.js-promise-tree-item');
      assert.dom(row.querySelector('.js-promise-label')).hasText('Promise 1');
      assert.dom(row.querySelector('.js-promise-state')).hasText('Fulfilled');
      assert.dom(row.querySelector('.js-promise-value')).hasText('value');
      assert.dom(row.querySelector('.js-promise-time')).hasText('10.00ms');
    });

    test('Rejected promise', async function (assert) {
      let now = Date.now();

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            label: 'Promise 1',
            state: 'rejected',
            reason: {
              inspect: 'reason',
              type: 'type-string',
            },
            createdAt: now,
            settledAt: now + 20,
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('.js-promise-tree-item').exists({ count: 1 });

      let row = find('.js-promise-tree-item');
      assert.dom(row.querySelector('.js-promise-label')).hasText('Promise 1');
      assert.dom(row.querySelector('.js-promise-state')).hasText('Rejected');
      assert.dom(row.querySelector('.js-promise-value')).hasText('reason');
      assert.dom(row.querySelector('.js-promise-time')).hasText('20.00ms');
    });

    test('Chained promises', async function (assert) {
      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 2,
            parent: 1,
            label: 'Child',
          }),
          generatePromise({
            guid: 1,
            children: [2],
            label: 'Parent',
          }),
        ],
      });

      await visit('/promise-tree');

      let rows = findAll('.js-promise-tree-item');
      assert.strictEqual(rows.length, 1, 'Collpased by default');
      assert.dom(rows[0].querySelector('.js-promise-label')).hasText('Parent');

      await click(rows[0].querySelector('.js-promise-label'));

      rows = findAll('.js-promise-tree-item');
      assert.strictEqual(rows.length, 2, 'Chain now expanded');
      assert.dom(rows[1].querySelector('.js-promise-label')).hasText('Child');
    });

    // TODO: is this test realistic? (having stack traces without turning on instrumentWithStack)
    test('Can trace promise when there is a stack', async function (assert) {
      assert.expect(1);

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            hasStack: true,
          }),
        ],
      });

      await visit('/promise-tree');

      respondWith('promise:tracePromise', ({ promiseId }) => {
        assert.strictEqual(promiseId, 1, 'promiseId');
        return false;
      });

      await click('.js-trace-promise-btn');
    });

    test('Trace button hidden if promise has no stack', async function (assert) {
      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            hasStack: false,
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('.js-trace-promise-btn').doesNotExist();
    });

    test('Toggling promise trace option', async function (assert) {
      assert.expect(2);

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [generatePromise()],
      });

      await visit('/promise-tree');

      let input = find('.js-with-stack input');
      assert.notOk(input.checked, 'should not be checked by default');

      respondWith(
        'promise:setInstrumentWithStack',
        ({ applicationId, applicationName, instrumentWithStack }) => {
          assert.true(instrumentWithStack, 'instrumentWithStack');

          return {
            type: 'promise:instrumentWithStack',
            applicationId,
            applicationName,
            instrumentWithStack,
          };
        },
      );

      await click(input);
    });

    test('Logging error stack trace in the console', async function (assert) {
      assert.expect(2);

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            state: 'rejected',
            reason: {
              inspect: 'some error',
              type: 'type-error',
            },
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('[data-test-send-to-console-btn]').hasText('Stack Trace');

      respondWith('promise:sendValueToConsole', ({ promiseId }) => {
        assert.strictEqual(promiseId, 1, 'promiseId');
        return false;
      });

      let row = find('.js-promise-tree-item');
      await click(row.querySelector('[data-test-send-to-console-btn]'));
    });

    test('Send fulfillment value to console', async function (assert) {
      assert.expect(2);

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            state: 'fulfilled',
            value: {
              inspect: 'some string',
              type: 'type-string',
            },
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('[data-test-send-to-console-btn]').exists();

      respondWith('promise:sendValueToConsole', ({ promiseId }) => {
        assert.strictEqual(promiseId, 1, 'promiseId');
        return false;
      });

      let row = find('.js-promise-tree-item');
      await click(row.querySelector('[data-test-send-to-console-btn]'));
    });

    test('Sending objects to the object inspector', async function (assert) {
      assert.expect(1);

      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            state: 'fulfilled',
            value: {
              inspect: 'Some Object',
              type: 'type-ember-object',
              objectId: 100,
            },
          }),
        ],
      });

      await visit('/promise-tree');

      respondWith('objectInspector:inspectById', ({ objectId }) => {
        assert.strictEqual(objectId, 100, 'promiseId');
        return false;
      });

      let row = find('.js-promise-tree-item');
      await click(row.querySelector('.js-promise-object-value'));
    });

    test('It should clear the search filter when the clear button is clicked', async function (assert) {
      respondWith('promise:getAndObservePromises', {
        type: 'promise:promisesUpdated',
        promises: [
          generatePromise({
            guid: 1,
            label: 'Promise 1',
            state: 'created',
          }),
        ],
      });

      await visit('/promise-tree');

      assert.dom('.js-promise-tree-item').exists({ count: 1 });
      await fillIn('.js-promise-search input', 'xxxxx');
      assert.dom('.js-promise-tree-item').doesNotExist();
      await click('[data-test-search-field-clear-button]');
      assert.dom('.js-promise-tree-item').exists({ count: 1 });
    });
  });
});
