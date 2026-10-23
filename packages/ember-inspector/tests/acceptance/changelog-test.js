import { visit, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';
import config from 'ember-inspector/config/environment';
import { setupTestAdapter } from '../test-adapter';

const CHANGELOG_URL = `${config.rootURL}CHANGELOG.md`;

const CHANGELOG = `# Changelog

## Release (2021-11-18)

* ember-inspector 4.5.4 (patch)

#### :bug: Bug Fix

- Stuff

## Release (2021-11-17)

* ember-inspector 4.5.3 (patch)

#### :rocket: Enhancement

- Other Stuff

## [v3.2.0](https://github.com/emberjs/ember-inspector/tree/v3.2.0) (2018-07-03)

**Fixed bugs:**

- Data`;

module('Changelog', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  hooks.afterEach(function () {
    this.server?.shutdown();
  });

  test('the build copies CHANGELOG.md into the dist', async function (assert) {
    await visit('/info/changelog');

    assert.dom('.changelog h1').hasText('Changelog');
    assert.dom('.changelog h2').exists();
    assert.dom('.changelog').doesNotIncludeText('could not be loaded');
  });

  test('the whole changelog is displayed', async function (assert) {
    this.server = new Pretender(function () {
      this.get(CHANGELOG_URL, () => [
        200,
        { 'Content-Type': 'text/plain' },
        CHANGELOG,
      ]);
    });

    await visit('/info/changelog');

    assert.dom('.changelog h1').hasText('Changelog');
    assert.deepEqual(
      findAll('.changelog h2').map((h2) => h2.textContent),
      ['Release (2021-11-18)', 'Release (2021-11-17)', 'v3.2.0 (2018-07-03)'],
    );
    assert.dom('.changelog').includesText('🐛 Bug Fix');
    assert.dom('.changelog').includesText('🚀 Enhancement');
  });

  test('an error message is displayed on request failure', async function (assert) {
    this.server = new Pretender(function () {
      this.get(CHANGELOG_URL, () => [404, {}, '']);
    });

    await visit('/info/changelog');

    assert.dom('.changelog p').hasText('Changelog could not be loaded');
  });
});
