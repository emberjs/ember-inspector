import { visit } from '@ember/test-helpers';
import { deprecate } from '@ember/debug';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

module('Ember Debug - Deprecation', function (hooks) {
  setupEmberDebugTest(hooks);

  hooks.beforeEach(async function () {
    EmberDebug.IGNORE_DEPRECATIONS = true;
    EmberDebug.deprecationDebug.reopen({
      fetchSourceMap() {
        return RSVP.resolve(null);
      },
      emberCliConfig: null,
    });
  });

  test('deprecations are caught and sent', async function t(assert) {
    let deprecations, count;

    EmberDebug.port.reopen({
      send(name, message) {
        if (name === 'deprecation:deprecationsAdded') {
          deprecations = message.deprecations;
        } else if (name === 'deprecation:count') {
          count = message.count;
        }
      },
    });

    this.owner.register(
      'route:application',
      Route.extend({
        setupController() {
          EmberDebug.IGNORE_DEPRECATIONS = false;
          deprecate('Deprecation 1', false, {
            id: 'dep-1',
            for: 'ember-inspector',
            since: '0.1.0',
            until: '1.0.0',
          });
          deprecate('Deprecation 2', false, {
            id: 'dep-2',
            for: 'ember-inspector',
            since: '0.1.0',
            until: '1.0.0',
            url: 'http://www.emberjs.com',
          });
          deprecate('Deprecation 1', false, {
            id: 'dep-1',
            for: 'ember-inspector',
            since: '0.1.0',
            until: '1.0.0',
          });
          EmberDebug.IGNORE_DEPRECATIONS = true;
        },
      }),
    );

    run(EmberDebug.port, 'trigger', 'deprecation:watch');

    await visit('/');

    assert.strictEqual(deprecations.length, 2);

    let deprecation = deprecations[0];
    assert.strictEqual(deprecation.count, 2, 'Correctly combined');
    assert.strictEqual(deprecation.message, 'Deprecation 1');
    assert.strictEqual(
      deprecation.sources.length,
      2,
      'Correctly separated by source',
    );

    deprecation = deprecations[1];
    assert.strictEqual(deprecation.count, 1);
    assert.strictEqual(deprecation.message, 'Deprecation 2');
    assert.strictEqual(deprecation.sources.length, 1);
    assert.strictEqual(deprecation.url, 'http://www.emberjs.com');

    assert.strictEqual(count, 3, 'count correctly sent');
  });

  test('Warns once about deprecations', async function t(assert) {
    assert.expect(2);
    let count = 0;
    run(EmberDebug.port, 'trigger', 'deprecation:watch');
    EmberDebug.port.adapter.reopen({
      warn(message) {
        assert.strictEqual(
          message,
          'Deprecations were detected, see the Ember Inspector deprecations tab for more details.',
        );
        assert.strictEqual(++count, 1, 'Warns once');
      },
    });

    this.owner.register(
      'route:application',
      Route.extend({
        setupController() {
          EmberDebug.IGNORE_DEPRECATIONS = false;
          deprecate('Deprecation 1', false, {
            id: 'dep-1',
            for: 'ember-inspector',
            since: '0.1.0',
            until: '1.0.0',
          });
          deprecate('Deprecation 2', false, {
            id: 'dep-2',
            for: 'ember-inspector',
            since: '0.1.0',
            until: '1.0.0',
          });
          EmberDebug.IGNORE_DEPRECATIONS = true;
        },
      }),
    );

    await visit('/');
  });
});
