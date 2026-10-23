import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

module('App Detected', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  /**
   * ember-debug answers the inspector's request,
   * and it also sends the same message once when it starts.
   */
  test('A second booted message is ignored', async function (assert) {
    respondWith('general:getLibraries', {
      type: 'general:libraries',
      libraries: [],
    });

    await visit('/info/libraries');

    await sendMessage({ type: 'general:applicationBooted', booted: true });

    assert.dom('.js-library-row').exists('the inspector still shows the tab');
  });
});
