import { visit } from '@ember/test-helpers';
import { deprecate } from '@ember/application/deprecations';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import require from 'require';
import { setupEIApp, destroyEIApp } from '../helpers/setup-destroy-ei-app';

const EmberDebug = require('ember-debug/main').default;

let port;
let App;

module('Ember Debug - Deprecation', function(hooks) {
  hooks.beforeEach(async function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init() { },
      send(/*n, m*/) { }
    });

    App = await setupEIApp.call(this, EmberDebug);

    port = EmberDebug.port;
    EmberDebug.IGNORE_DEPRECATIONS = true;
    EmberDebug.deprecationDebug.reopen({
      fetchSourceMap() { return RSVP.resolve(null); },
      emberCliConfig: null
    });
  });

  hooks.afterEach(async function() {
    await destroyEIApp.call(this, EmberDebug, App);
  });

  test('deprecations are caught and sent', async function t(assert) {
    let messages = [];
    port.reopen({
      send(name, message) {
        messages.push({ name, message });
      }
    });

    App.ApplicationRoute = Route.extend({
      setupController() {
        EmberDebug.IGNORE_DEPRECATIONS = false;
        deprecate('Deprecation 1', false, { id: 'dep-1', until: '1.0.0' });
        deprecate('Deprecation 2', false, { id: 'dep-2', until: '1.0.0', url: 'http://www.emberjs.com' });
        deprecate('Deprecation 1', false, { id: 'dep-1', until: '1.0.0' });
        EmberDebug.IGNORE_DEPRECATIONS = true;
      }
    });

    run(port, 'trigger', 'deprecation:watch');
    await visit('/');
    let deprecations = messages.filterBy('name', 'deprecation:deprecationsAdded').get('lastObject').message.deprecations;
    assert.equal(deprecations.length, 2);
    let deprecation = deprecations[0];
    assert.equal(deprecation.count, 2, 'Correctly combined');
    assert.equal(deprecation.message, 'Deprecation 1');
    assert.equal(deprecation.sources.length, 2, 'Correctly separated by source');
    deprecation = deprecations[1];
    assert.equal(deprecation.count, 1);
    assert.equal(deprecation.message, 'Deprecation 2');
    assert.equal(deprecation.sources.length, 1);
    assert.equal(deprecation.url, 'http://www.emberjs.com');

    let count = messages.filterBy('name', 'deprecation:count').get('lastObject').message.count;
    assert.equal(count, 3, 'count correctly sent');
  });

  test('Warns once about deprecations', async function t(assert) {
    assert.expect(2);
    let count = 0;
    run(port, 'trigger', 'deprecation:watch');
    port.get('adapter').reopen({
      warn(message) {
        assert.equal(message, 'Deprecations were detected, see the Ember Inspector deprecations tab for more details.');
        assert.equal(++count, 1, 'Warns once');
      }
    });
    App.ApplicationRoute = Route.extend({
      setupController() {
        EmberDebug.IGNORE_DEPRECATIONS = false;
        deprecate('Deprecation 1', false, { id: 'dep-1', until: '1.0.0' });
        deprecate('Deprecation 2', false, { id: 'dep-2', until: '1.0.0' });
        EmberDebug.IGNORE_DEPRECATIONS = true;
      }
    });
    await visit('/');
  });
});
