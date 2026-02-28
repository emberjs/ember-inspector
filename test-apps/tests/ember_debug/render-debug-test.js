import { settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

import EmberDebugImport from 'ember-debug/main';

let EmberDebug;

module('Ember Debug - Render Debug', function (hooks) {
  hooks.before(async function () {
    EmberDebug = (await EmberDebugImport).default;
  });

  setupEmberDebugTest(hooks, {
    routes: function () {
      this.route('simple');
    },
  });

  test('Simple Render', async function t(assert) {
    let profiles = [];
    EmberDebug.port.reopen({
      send(n, m) {
        if (n === 'render:profilesAdded') {
          profiles = profiles.concat(m.profiles);
        }
      },
    });
    EmberDebug.port.trigger('render:watchProfiles');

    await visit('/simple');

    assert.ok(profiles.length > 0, 'it has created profiles');
  });

  test('Clears correctly', async function t(assert) {
    let profiles = [];

    EmberDebug.port.reopen({
      send(n, m) {
        if (n === 'render:profilesAdded') {
          profiles.push(m.profiles);
        }
        if (n === 'render:profilesUpdated') {
          profiles = m.profiles;
        }
      },
    });

    EmberDebug.port.trigger('render:watchProfiles');

    await visit('/simple');

    assert.ok(profiles.length > 0, 'it has created profiles');
    EmberDebug.port.trigger('render:clear');
    await settled();

    assert.strictEqual(profiles.length, 0, 'it has cleared the profiles');
  });
});
