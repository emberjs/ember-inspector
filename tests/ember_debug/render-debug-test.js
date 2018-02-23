import Ember from "ember";
import { module, test } from 'qunit';
import { visit } from 'ember-native-dom-helpers';
import hbs from 'htmlbars-inline-precompile';
import require from 'require';

const EmberDebug = require('ember-debug/main').default;
const { run, Application } = Ember;
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
      EmberDebug.set('application', App);
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
