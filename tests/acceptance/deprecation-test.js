import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import { visit, find, findAll, click } from 'ember-native-dom-helpers';

let App;

let port, message, name;

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
  hooks.beforeEach(function() {
    App = startApp({ adapter: 'basic' });
    port = App.__container__.lookup('port:main');
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
    run(App, App.destroy);
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

    assert.notOk(find('.js-deprecation-source'), 'no sources');
    assert.equal(findAll('.js-deprecation-message')[0].textContent.trim(), 'Deprecation 1', 'message shown');
    assert.equal(findAll('.js-deprecation-count')[0].textContent.trim(), 2, 'Count correct');
    assert.ok(find('.js-deprecation-full-trace'), 'Full trace button shown');
    await click('.js-full-trace-deprecations-btn');

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

    assert.equal(find('.js-deprecation-message').textContent.trim(), 'Deprecation 1', 'message shown');
    assert.equal(find('.js-deprecation-count').textContent.trim(), 2, 'Count correct');
    assert.notOk(find('.js-deprecation-full-trace'), 'Full trace button not shown');

    let sources = findAll('.js-deprecation-source');
    assert.equal(sources.length, 2, 'shows all sources');
    assert.notOk(find('.js-deprecation-source-link', sources[0]), 'source not clickable');
    assert.equal(find('.js-deprecation-source-text', sources[0]).textContent.trim(), 'path-to-file.js:1');
    assert.notOk(find('.js-deprecation-source-link', sources[1]), 'source not clickable');
    assert.equal(find('.js-deprecation-source-text', sources[1]).textContent.trim(), 'path-to-second-file.js:2');

    await click('.js-trace-deprecations-btn', sources[0]);

    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);

    await click('.js-trace-deprecations-btn', sources[1]);

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

    assert.equal(find('.js-deprecation-message').textContent.trim(), 'Deprecation 1', 'message shown');
    assert.equal(find('.js-deprecation-count').textContent.trim(), 2, 'Count correct');
    assert.notOk(find('.js-deprecation-full-trace'), 'Full trace button not shown');

    let sources = findAll('.js-deprecation-source');
    assert.equal(sources.length, 2, 'shows all sources');
    assert.notOk(find('.js-deprecation-source-text', sources[0]), 'source clickable');
    assert.equal(find('.js-deprecation-source-link', sources[0]).textContent.trim(), 'path-to-file.js:1');
    assert.notOk(find('.js-deprecation-source-text', sources[1]), 'source clickable');
    assert.equal(find('.js-deprecation-source-link', sources[1]).textContent.trim(), 'path-to-second-file.js:2');

    openResourceArgs = false;
    await click('.js-deprecation-source-link', sources[0]);

    assert.ok(openResourceArgs);
    openResourceArgs = false;

    await click('.js-deprecation-source-link', sources[1]);

    assert.ok(openResourceArgs);
    openResourceArgs = false;

    await click('.js-trace-deprecations-btn', sources[0]);

    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);
    await click('.js-trace-deprecations-btn', sources[1]);
    assert.equal(name, 'deprecation:sendStackTraces');
    assert.equal(message.deprecation.message, 'Deprecation 1');
    assert.equal(message.deprecation.sources.length, 1);
  });
});
