import Ember from "ember";

/* globals require */
var EmberDebug = require('ember-debug/main')["default"];
var port;
var App, run = Ember.run;
var compile = Ember.Handlebars.compile;

function setupApp(){
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });
  Ember.TEMPLATES.simple = compile('Simple template');
}

module("Render Debug", {
  setup: function() {
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
  teardown: function() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("Simple Render", function() {
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
    ok(profiles.length > 0, "it has created profiles");
  });
});

test("Clears correctly", function() {
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
    ok(profiles.length > 0, "it has created profiles");
    port.trigger('render:clear');
    return wait();
  });

  andThen(function() {
    ok(profiles.length === 0, "it has cleared the profiles");
  });

});
