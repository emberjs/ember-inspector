import { visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import Application from '@ember/application';
import Ember from "ember";
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import require from 'require';
import wait from 'ember-test-helpers/wait';

const EmberDebug = require('ember-debug/main').default;
let port, App;


function setupApp() {
  App = Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });
  Ember.TEMPLATES.simple = hbs`Simple template`;
}

module("Render Debug", function(hooks) {
  hooks.beforeEach(function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send() {}
    });
    run(function() {
      setupApp();
      EmberDebug.set('owner', App.__deprecatedInstance__);
    });
    run(EmberDebug, 'start');
    port = EmberDebug.port;
  });

  hooks.afterEach(function() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  });

  test("Simple Render", async function t(assert) {
    let profiles = [];
    port.reopen({
      send(n, m) {
        if (n === "render:profilesAdded") {
          profiles = profiles.concat(m.profiles);
        }
      }
    });
    port.trigger('render:watchProfiles');

    await visit('/simple');

    assert.ok(profiles.length > 0, "it has created profiles");
  });

  test("Clears correctly", async function t(assert) {
    let profiles = [];

    port.reopen({
      send(n, m) {
        if (n === "render:profilesAdded") {
          profiles.push(m.profiles);
        }
        if (n === "render:profilesUpdated") {
          profiles = m.profiles;
        }
      }
    });

    port.trigger('render:watchProfiles');

    await visit('/simple');

    assert.ok(profiles.length > 0, "it has created profiles");
    port.trigger('render:clear');
    await wait();

    assert.ok(profiles.length === 0, "it has cleared the profiles");

  });
});
