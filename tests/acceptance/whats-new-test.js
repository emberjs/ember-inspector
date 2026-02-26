import { visit, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';
import { setupTestAdapter } from '../test-adapter';

function urlFor(ref) {
  return `https://raw.githubusercontent.com/emberjs/ember-inspector/${encodeURIComponent(
    ref,
  )}/CHANGELOG.md`;
}

function generateContent(main = false) {
  let content = [];

  content.push(`# Changelog`);

  if (main) {
    content.push(`
## Release [Unreleased](https://github.com/emberjs/ember-inspector/tree/HEAD)

**Merged pull requests:**

- Stuff`);
  }

  content.push(`
## Release (2021-11-18)

[Full Changelog](https://emberjs.com)

**Implemented enhancements:**

- Stuff

## Release (2021-11-17)

[Full Changelog](https://emberjs.com)

**Implemented enhancements:**

- Other Stuff

## [v3.2.0](https://github.com/emberjs/ember-inspector/tree/v3.2.0) (2018-07-03)

[Full Changelog](https://emberjs.com)

**Fixed bugs:**

- Data`);

  return content.join('\n');
}

module('Whats New', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  outer.beforeEach(function () {
    this.config = this.owner.lookup('service:config');
    this.originalVersion = this.config.version;
  });

  outer.afterEach(function () {
    this.config.version = this.originalVersion;

    if (this.server) {
      this.server.shutdown();
    }
  });

  module('Released version', function (inner) {
    inner.beforeEach(function () {
      this.config.version = '4.5.3';
    });

    test('Changelog is parsed and displayed', async function (assert) {
      this.server = new Pretender(function () {
        this.get(urlFor('v4.5.3-ember-inspector'), () => [
          200,
          { 'Content-Type': 'text/plain' },
          generateContent(),
        ]);
      });

      await visit('/info/whats-new');

      assert
        .dom('.whats-new h2')
        .exists({ count: 1 }, 'correct section of markdown is rendered');

      assert.strictEqual(
        find('.whats-new h2').textContent,
        'Release (2021-11-18)',
        'correct section of markdown is rendered',
      );
    });

    test('Error message is displayed on request failure', async function (assert) {
      this.server = new Pretender(function () {
        this.get(urlFor('v4.5.3-ember-inspector'), () => [404, {}, '']);
      });

      await visit('/info/whats-new');

      assert
        .dom('.whats-new p')
        .exists({ count: 1 }, 'Changelog could not be loaded');
    });
  });

  module('Nightly version', function (inner) {
    inner.beforeEach(function () {
      this.config.version = '3.4.0-alpha.1';
    });

    test('Changelog is parsed and displayed', async function (assert) {
      this.server = new Pretender(function () {
        this.get(urlFor('release-preview'), () => [
          200,
          { 'Content-Type': 'text/plain' },
          generateContent(true),
        ]);
      });

      await visit('/info/whats-new');

      assert
        .dom('.whats-new h2')
        .exists({ count: 1 }, 'correct section of markdown is rendered');

      assert.strictEqual(
        find('.whats-new h2 a').text,
        'Unreleased',
        'correct section of markdown is rendered',
      );
    });

    test('Error message is displayed on request failure', async function (assert) {
      this.server = new Pretender(function () {
        this.get(urlFor('release-preview'), () => [404, {}, '']);
      });

      await visit('/info/whats-new');

      assert
        .dom('.whats-new p')
        .exists({ count: 1 }, 'Changelog could not be loaded');
    });
  });
});
