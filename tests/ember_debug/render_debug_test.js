import Ember from "ember";
import { module, test } from 'qunit';

/* globals require */
var EmberDebug = require('ember-debug/main')["default"];
var port;
var App, run = Ember.run;
var compile = Ember.Handlebars.compile;

function setupApp() {
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });
  Ember.TEMPLATES.simple = compile('Simple template');
}

module("Render Debug", {
  beforeEach() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });
    run(function() {
      setupApp();
      EmberDebug.set('application', App);
    });
    run(EmberDebug, 'start');
    port = EmberDebug.port;
  },
  afterEach() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("Simple Render", function(assert) {
  var profiles = [];
  port.reopen({
    send: function(n, m) {
      if (n === "render:profilesAdded") {
        profiles = profiles.concat(m.profiles);
      }
    }
  });
  port.trigger('render:watchProfiles');

  visit('/simple')
  .then(function() {
    assert.ok(profiles.length > 0, "it has created profiles");
  });
});

test("Clears correctly", function(assert) {
  var profiles = [];

  port.reopen({
    send: function(n, m) {
      if (n === "render:profilesAdded") {
        profiles.push(m.profiles);
      }
      if (n === "render:profilesUpdated") {
        profiles = m.profiles;
      }
    }
  });

  port.trigger('render:watchProfiles');

  visit('/simple');

  andThen(function() {
    assert.ok(profiles.length > 0, "it has created profiles");
    port.trigger('render:clear');
    return wait();
  });

  andThen(function() {
    assert.ok(profiles.length === 0, "it has cleared the profiles");
  });

});
