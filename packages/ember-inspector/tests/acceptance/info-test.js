import { visit, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-inspector/config/environment';
import { setupTestAdapter, respondWith } from '../test-adapter';

module('Info Tab', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  test('Libraries are displayed correctly', async function (assert) {
    respondWith('general:getLibraries', {
      type: 'general:libraries',
      libraries: [
        { name: 'Ember', version: '1.0' },
        { name: 'Handlebars', version: '2.1' },
      ],
    });

    await visit('/info/libraries');

    let libraries = findAll('.js-library-row');
    assert.strictEqual(
      libraries.length,
      3,
      'The correct number of libraries is displayed',
    );
    assert
      .dom(libraries[0].querySelector('.js-lib-library'))
      .hasText('Ember Inspector', 'Ember Inspector is added automatically');
    assert
      .dom(libraries[0].querySelector('.js-lib-version'))
      .hasText(config.VERSION);
    assert.dom(libraries[1].querySelector('.js-lib-library')).hasText('Ember');
    assert.dom(libraries[1].querySelector('.js-lib-version')).hasText('1.0');
    assert
      .dom(libraries[2].querySelector('.js-lib-library'))
      .hasText('Handlebars');
    assert.dom(libraries[2].querySelector('.js-lib-version')).hasText('2.1');
  });

  test('App config is displayed correctly', async function (assert) {
    respondWith('general:getEmberCliConfig', {
      type: 'general:emberCliConfig',
      emberCliConfig: {
        modulePrefix: 'extended',
        environment: 'production',
      },
    });

    await visit('/info/app-config');

    let configs = findAll('.js-config-row');
    assert.strictEqual(
      configs.length,
      2,
      'The correct number of configurations is displayed',
    );
    assert
      .dom(configs[0].querySelector('.js-config-key'))
      .hasText('modulePrefix');
    assert
      .dom(configs[0].querySelector('.js-config-value'))
      .hasText('extended');
    assert
      .dom(configs[1].querySelector('.js-config-key'))
      .hasText('environment');
    assert
      .dom(configs[1].querySelector('.js-config-value'))
      .hasText('production');
  });
});
