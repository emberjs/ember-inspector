import { deprecate } from '@ember/application/deprecations';
import Route from '@ember/routing/route';
import Application from '@ember/application';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { visit } from 'ember-native-dom-helpers';
import require from 'require';

const EmberDebug = require("ember-debug/main").default;

let port;
let App;

function setupApp() {
  App = Application.create();
  App.injectTestHelpers();
  App.setupForTesting();
}

module("Deprecation Debug", function(hooks) {
  hooks.beforeEach(function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send(/*n, m*/) {}
    });
    run(function() {
      setupApp();
      EmberDebug.set('application', App);
    });
    run(EmberDebug, 'start');
    port = EmberDebug.port;
    EmberDebug.IGNORE_DEPRECATIONS = true;
    EmberDebug.deprecationDebug.reopen({
      fetchSourceMap() { return RSVP.resolve(null); },
      emberCliConfig: null
    });
  });

  hooks.afterEach(function() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  });

  test("deprecations are caught and sent", async function t(assert) {
    let messages = [];
    port.reopen({
      send(name, message) {
        messages.push({ name, message });
      }
    });

    App.ApplicationRoute = Route.extend({
      setupController() {
        EmberDebug.IGNORE_DEPRECATIONS = false;
        deprecate('Deprecation 1');
        deprecate('Deprecation 2', false, { url: 'http://www.emberjs.com' });
        deprecate('Deprecation 1');
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
        deprecate('Deprecation 1');
        deprecate('Deprecation 2');
        EmberDebug.IGNORE_DEPRECATIONS = true;
      }
    });
    await visit('/');
  });
});
