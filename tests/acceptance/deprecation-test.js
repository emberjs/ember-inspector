import { visit, findAll, fillIn, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  setupTestAdapter,
  enableOpenResource,
  respondWith,
  expectOpenResource,
  disableDefaultResponseFor,
} from '../test-adapter';

/*
  Toggling the source can be done by clicking the
  disclosure triangle, count, or message
*/
async function toggleDeprecationSource() {
  await click('[data-test-deprecation-count]');
}

function deprecationsWithoutSource() {
  return [
    {
      id: 'deprecation-1',
      message: 'Deprecation 1',
      url: 'http://www.emberjs.com',
      count: 2,
      sources: [
        {
          stackStr: 'stack-trace',
          map: null,
        },
        {
          stackStr: 'stack-trace-2',
          map: null,
        },
      ],
    },
  ];
}

function deprecationsWithSource() {
  return [
    {
      id: 'deprecation-1',
      message: 'Deprecation 1',
      url: 'http://www.emberjs.com',
      count: 2,
      hasSourceMap: true,
      sources: [
        {
          stackStr: 'stack-trace',
          map: {
            source: 'path-to-file.js',
            line: 1,
            fullSource: 'http://path-to-file.js',
          },
        },
        {
          stackStr: 'stack-trace-2',
          map: {
            source: 'path-to-second-file.js',
            line: 2,
            fullSource: 'http://path-to-second-file.js',
          },
        },
      ],
    },
  ];
}

module('Deprecation Tab', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  outer.beforeEach(function () {
    disableDefaultResponseFor('deprecation:getCount');
  });

  module('Without source map', function (inner) {
    inner.beforeEach(function () {
      respondWith('deprecation:getCount', {
        type: 'deprecation:count',
        count: 2,
      });

      respondWith('deprecation:watch', {
        type: 'deprecation:deprecationsAdded',
        deprecations: deprecationsWithoutSource(),
      });
    });

    test('No source map', async function (assert) {
      await visit('/deprecations');

      await toggleDeprecationSource();

      assert.dom('[data-test-deprecation-source]').doesNotExist('no sources');
      assert
        .dom(findAll('[data-test-deprecation-message]')[0])
        .hasText('Deprecation 1', 'message shown');
      assert
        .dom(findAll('[data-test-deprecation-count]')[0])
        .hasText('2', 'Count correct');
      assert
        .dom('[data-test-full-trace-deprecations-btn]')
        .exists('Full trace button shown');

      respondWith('deprecation:sendStackTraces', ({ deprecation }) => {
        assert.strictEqual(deprecation.message, 'Deprecation 1');
        assert.strictEqual(deprecation.sources.length, 2);
        return false;
      });

      await click('[data-test-full-trace-deprecations-btn]');
    });
  });

  module('With source map', function (inner) {
    inner.beforeEach(function () {
      respondWith('deprecation:getCount', {
        type: 'deprecation:count',
        count: 2,
      });

      respondWith('deprecation:watch', {
        type: 'deprecation:deprecationsAdded',
        deprecations: deprecationsWithSource(),
      });
    });

    test("With source map, source found, can't open resource", async function (assert) {
      await visit('/deprecations');

      await toggleDeprecationSource();

      assert
        .dom('[data-test-deprecation-message]')
        .hasText('Deprecation 1', 'message shown');
      assert.dom('[data-test-deprecation-count]').hasText('2', 'Count correct');
      assert
        .dom('[data-test-full-trace-deprecations-btn]')
        .doesNotExist('Full trace button not shown');

      let sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 2, 'shows all sources');
      assert.notOk(
        sources[0].querySelector('[data-test-deprecation-source-link]'),
        'source not clickable',
      );
      assert
        .dom(sources[0].querySelector('[data-test-deprecation-source-text]'))
        .hasText('path-to-file.js:1');
      assert.notOk(
        sources[1].querySelector('[data-test-deprecation-source-link]'),
        'source not clickable',
      );
      assert
        .dom(sources[1].querySelector('[data-test-deprecation-source-text]'))
        .hasText('path-to-second-file.js:2');

      respondWith('deprecation:sendStackTraces', ({ deprecation }) => {
        assert.strictEqual(deprecation.message, 'Deprecation 1');
        assert.strictEqual(deprecation.sources.length, 1);
        return false;
      });

      await click(
        sources[0].querySelector('[data-test-trace-deprecations-btn]'),
      );

      respondWith('deprecation:sendStackTraces', ({ deprecation }) => {
        assert.strictEqual(deprecation.message, 'Deprecation 1');
        assert.strictEqual(deprecation.sources.length, 1);
        return false;
      });

      await click(
        sources[1].querySelector('[data-test-trace-deprecations-btn]'),
      );
    });

    test('With source map, source found, can open resource', async function (assert) {
      enableOpenResource();

      await visit('/deprecations');

      await toggleDeprecationSource();

      assert
        .dom('[data-test-deprecation-message]')
        .hasText('Deprecation 1', 'message shown');
      assert.dom('[data-test-deprecation-count]').hasText('2', 'Count correct');
      assert
        .dom('[data-test-full-trace-deprecations-btn]')
        .doesNotExist('Full trace button not shown');

      let sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 2, 'shows all sources');
      assert.notOk(
        sources[0].querySelector('[data-test-deprecation-source-text]'),
        'source clickable',
      );
      assert
        .dom(sources[0].querySelector('[data-test-deprecation-source-link]'))
        .hasText('path-to-file.js:1');
      assert.notOk(
        sources[1].querySelector('[data-test-deprecation-source-text]'),
        'source clickable',
      );
      assert
        .dom(sources[1].querySelector('[data-test-deprecation-source-link]'))
        .hasText('path-to-second-file.js:2');

      expectOpenResource('http://path-to-file.js', 1);

      await click(
        sources[0].querySelector('[data-test-deprecation-source-link]'),
      );

      expectOpenResource('http://path-to-second-file.js', 2);

      await click(
        sources[1].querySelector('[data-test-deprecation-source-link]'),
      );
    });

    test('It should clear the search filter when the clear button is clicked', async function (assert) {
      await visit('/deprecations');

      await toggleDeprecationSource();

      let sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 2, 'shows all sources');

      await fillIn('[data-test-deprecations-search] input', 'xxxx');
      sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 0, 'sources filtered');

      await click('[data-test-search-field-clear-button]');
      await click('[data-test-deprecation-item] .disclosure-triangle');
      sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 2, 'show all sources');
    });

    test('It should clear the deprecations source when the clear button is clicked', async function (assert) {
      await visit('/deprecations');

      await toggleDeprecationSource();

      let sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 2, 'shows all sources');

      respondWith('deprecation:clear', false);
      await click('[data-test-deprecations-clear]');

      sources = findAll('[data-test-deprecation-source]');
      assert.strictEqual(sources.length, 0, 'sources cleared');
    });
  });
});
