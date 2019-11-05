import { settled, visit } from '@ember/test-helpers';
import Ember from 'ember';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import require from 'require';
import { setupEIApp, destroyEIApp } from '../helpers/setup-destroy-ei-app';

const EmberDebug = require('ember-debug/main').default;
let port, App;

module('Ember Debug - Render Debug', function(hooks) {
  hooks.beforeEach(async function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send() {}
    });

    App = await setupEIApp.call(this, EmberDebug, function() {
      this.route('simple');
    });

    Ember.TEMPLATES.simple = hbs`Simple template`;

    port = EmberDebug.port;
  });

  hooks.afterEach(async function() {
    await destroyEIApp.call(this, EmberDebug, App);
  });

  test('Simple Render', async function t(assert) {
    let profiles = [];
    port.reopen({
      send(n, m) {
        if (n === 'render:profilesAdded') {
          profiles = profiles.concat(m.profiles);
        }
      }
    });
    port.trigger('render:watchProfiles');

    await visit('/simple');

    assert.ok(profiles.length > 0, 'it has created profiles');
  });

  test('Clears correctly', async function t(assert) {
    let profiles = [];

    port.reopen({
      send(n, m) {
        if (n === 'render:profilesAdded') {
          profiles.push(m.profiles);
        }
        if (n === 'render:profilesUpdated') {
          profiles = m.profiles;
        }
      }
    });

    port.trigger('render:watchProfiles');

    await visit('/simple');

    assert.ok(profiles.length > 0, 'it has created profiles');
    port.trigger('render:clear');
    await settled();

    assert.ok(profiles.length === 0, 'it has cleared the profiles');

  });
});
