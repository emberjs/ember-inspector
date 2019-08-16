import { visit, find, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import Pretender from 'pretender';

const url = 'https://raw.githubusercontent.com/emberjs/ember-inspector/master/CHANGELOG.md';
const response = `
# Changelog

## [Unreleased](https://github.com/emberjs/ember-inspector/tree/HEAD)

**Merged pull requests:**

- Stuff

## [v3.3.0](https://github.com/emberjs/ember-inspector/tree/v3.3.0) (2018-08-02)

[Full Changelog](https://emberjs.com)

**Implemented enhancements:**

## [v3.2.0](https://github.com/emberjs/ember-inspector/tree/v3.2.0) (2018-07-03)

[Full Changelog](https://emberjs.com)

**Fixed bugs:**

- Data
`;

module('Whats New', function(hooks) {
  setupApplicationTest(hooks);

  test('Changelog is parsed and displayed', async function t(assert) {
    const server = new Pretender(function() {
      this.get(url, () => [200, { 'Content-Type': 'text/plain' }, response]);
    });

    await visit('/info/whats-new');

    assert.dom('.whats-new h2').exists({ count: 1 }, 'correct section of markdown is rendered');

    assert.equal(
      find('.whats-new h2 a').text,
      'v3.3.0',
      'correct section of markdown is rendered'
    );

    server.shutdown();
  });

  test('Error message is displayed on request failure', async function t(assert) {
    const server = new Pretender(function() {
      this.get(url, () => [404, {}, '']);
    });

    await visit('/info/whats-new');

    assert.dom('.whats-new p').exists({ count: 1 }, 'Changelog could not be loaded');

    server.shutdown();
  });
});
