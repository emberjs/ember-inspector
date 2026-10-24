import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

module('Port', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    respondWith('promise:getInstrumentWithStack', {
      type: 'promise:instrumentWithStack',
      instrumentWithStack: false,
    });

    respondWith('promise:getAndObservePromises', {
      type: 'promise:promisesUpdated',
      promises: [],
    });
  });

  hooks.afterEach(function () {
    respondWith('promise:releasePromises', false);
  });

  test('a message with no listener throws', async function (assert) {
    await visit('/promise-tree');

    await assert.rejects(
      sendMessage({ type: 'view:unknown' }),
      /unknown message type view:unknown/,
    );
  });

  test('a message from another app is ignored', async function (assert) {
    await visit('/promise-tree');

    await sendMessage({
      type: 'promise:promisesUpdated',
      applicationId: 'other-app',
      promises: [{ guid: 1, label: 'Other app promise', state: 'created' }],
    });
    await sendMessage({ type: 'view:unknown', applicationId: 'other-app' });

    assert.dom('.js-promise-tree-item').doesNotExist();
    assert.dom('.js-page-refresh').exists('the tab still waits for promises');

    await sendMessage({
      type: 'promise:promisesUpdated',
      promises: [{ guid: 1, label: 'My app promise', state: 'created' }],
    });

    assert.dom('.js-promise-label').hasText('My app promise');
  });
});
