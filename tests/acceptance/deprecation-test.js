import { visit, findAll, fillIn, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let port, message, name;

/*
  Toggling the source can be done by clicking the
  disclosure triangle, count, or message
*/
const toggleDeprecationSource = function() {
  return click('[data-test="deprecation-count"]');
};

function deprecationsWithSource() {
  return [{
    count: 2,
    hasSourceMap: true,
    sources: [{
      stackStr: 'stack-trace',
      map: {
        source: 'path-to-file.js',
        line: 1,
        fullSource: 'http://path-to-file.js'
      }
    }, {
      stackStr: 'stack-trace-2',
      map: {
        source: 'path-to-second-file.js',
        line: 2,
        fullSource: 'http://path-to-second-file.js'
      }
    }],
    message: 'Deprecation 1',
    url: 'http://www.emberjs.com'
  }];
}

module('Deprecation Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('service:port');
    port.reopen({
      send(n, m) {
        name = n;
        message = m;
      }
    });
  });

  hooks.afterEach(function() {
    name = null;
    message = null;
  });

  test('No source map', async function(assert) {
    port.reopen({
      send(name) {
        if (name === 'deprecation:watch') {
          port.trigger('deprecation:deprecationsAdded', {
            deprecations: [{
              count: 2,
              sources: [{
                stackStr: 'stack-trace',
                map: null
              }, {
                stackStr: 'stack-trace-2',
                map: null
              }],
              message: 'Deprecation 1',
              url: 'http://www.emberjs.com'
            }]
          });
        }
        return this._super(...arguments);
      }
    });

    await visit('/deprecations');

    await toggleDeprecationSource();

    assert.dom('[data-test="deprecation-source"]').doesNotExist('no sources');
    assert.dom(findAll('[data-test="deprecation-message"]')[0]).hasText('Deprecation 1', 'message shown');
    assert.dom(findAll('[data-test="deprecation-count"]')[0]).hasText('2', 'Count correct');
    assert.dom('[data-test="full-trace-deprecations-btn"]').exists('Full trace button shown');
    await click('[data-test="full-trace-deprecations-btn"]');

    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 2);
  });

  test("With source map, source found, can't open resource", async function(assert) {
    port.reopen({
      send(name) {
        if (name === 'deprecation:watch') {
          port.trigger('deprecation:deprecationsAdded', {
            deprecations: deprecationsWithSource()
          });
        }
        return this._super(...arguments);
      }
    });

    await visit('/deprecations');

    await toggleDeprecationSource();

    assert.dom('[data-test="deprecation-message"]').hasText('Deprecation 1', 'message shown');
    assert.dom('[data-test="deprecation-count"]').hasText('2', 'Count correct');
    assert.dom('[data-test="full-trace-deprecations-btn"]').doesNotExist('Full trace button not shown');

    let sources = findAll('[data-test="deprecation-source"]');
    assert.equal(sources.length, 2, 'shows all sources');
    assert.notOk(sources[0].querySelector('[data-test="deprecation-source-link"]'), 'source not clickable');
    assert.dom(sources[0].querySelector('[data-test="deprecation-source-text"]')).hasText('path-to-file.js:1');
    assert.notOk(sources[1].querySelector('[data-test="deprecation-source-link"]'), 'source not clickable');
    assert.dom(sources[1].querySelector('[data-test="deprecation-source-text"]')).hasText('path-to-second-file.js:2');

    await click('[data-test="trace-deprecations-btn"]', sources[0]);

    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);

    await click('[data-test="trace-deprecations-btn"]', sources[1]);

    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);

  });

  test("With source map, source found, can open resource", async function(assert) {
    let openResourceArgs = false;
    port.get('adapter').reopen({
      canOpenResource: true,
      openResource(...args) {
        openResourceArgs = args;
      }
    });
    port.reopen({
      send(name) {
        if (name === 'deprecation:watch') {
          port.trigger('deprecation:deprecationsAdded', {
            deprecations: deprecationsWithSource()
          });
        }
        return this._super(...arguments);
      }
    });

    await visit('/deprecations');

    await toggleDeprecationSource();

    assert.dom('[data-test="deprecation-message"]').hasText('Deprecation 1', 'message shown');
    assert.dom('[data-test="deprecation-count"]').hasText('2', 'Count correct');
    assert.dom('[data-test="full-trace-deprecations-btn"]').doesNotExist('Full trace button not shown');

    let sources = findAll('[data-test="deprecation-source"]');
    assert.equal(sources.length, 2, 'shows all sources');
    assert.notOk(sources[0].querySelector('[data-test="deprecation-source-text"]'), 'source clickable');
    assert.dom(sources[0].querySelector('[data-test="deprecation-source-link"]')).hasText('path-to-file.js:1');
    assert.notOk(sources[1].querySelector('[data-test="deprecation-source-text"]'), 'source clickable');
    assert.dom(sources[1].querySelector('[data-test="deprecation-source-link"]')).hasText('path-to-second-file.js:2');

    openResourceArgs = false;
    await click('[data-test="deprecation-source-link"]', sources[0]);

    assert.ok(openResourceArgs);
    openResourceArgs = false;

    await click('[data-test="deprecation-source-link"]', sources[1]);

    assert.ok(openResourceArgs);
    openResourceArgs = false;

    await click('[data-test="trace-deprecations-btn"]', sources[0]);

    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);
    await click('[data-test="trace-deprecations-btn"]', sources[1]);
    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);
  });

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    port.reopen({
      send(name) {
        if (name === 'deprecation:watch') {
          port.trigger('deprecation:deprecationsAdded', {
            deprecations: deprecationsWithSource()
          });
        }
        return this._super(...arguments);
      }
    });

    await visit('/deprecations');

    await toggleDeprecationSource();

    let sources = findAll('[data-test="deprecation-source"]');
    assert.equal(sources.length, 2, 'shows all sources');

    await fillIn('[data-test="deprecations-search"] input', 'xxxx');
    sources = findAll('[data-test="deprecation-source"]');
    assert.equal(sources.length, 0, 'sources filtered');

    await click('.js-search-field-clear-button');
    await click('[data-test="deprecation-item"] .disclosure-triangle');
    sources = findAll('[data-test="deprecation-source"]');
    assert.equal(sources.length, 2, 'show all sources');
  });
});
