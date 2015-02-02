import Ember from "ember";
/*globals require */
var EmberDebug = require("ember-debug/main")["default"];

var port, name, message;
var EmberDebug;
var run = Ember.run;
var App;

function setupApp(){
  App = Ember.Application.create();
  App.injectTestHelpers();
  App.setupForTesting();
}

module("Deprecation Debug", {
  setup: function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
    run(function() {
      setupApp();
      EmberDebug.set('application', App);
    });
    run(EmberDebug, 'start');
    port = EmberDebug.port;
    EmberDebug.deprecationDebug.reopen({
      fetchSourceMap: function() {},
      emberCliConfig: null
    });
  },
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    Ember.run(App, 'destroy');
  }
});

test("deprecations are caught and sent", function() {
  var messages = [];
  port.reopen({
    send: function(name, message) {
      messages.push({
        name: name,
        message: message
      });
    }
  });

  App.ApplicationRoute = Ember.Route.extend({
    setupController: function() {
      Ember.deprecate('Deprecation 1');
      Ember.deprecate('Deprecation 2', false, { url: 'http://www.emberjs.com' }) ;
      Ember.deprecate('Deprecation 1');
    }
  });

  visit('/');
  andThen(function() {
    var deprecations = messages.findBy('name', 'deprecation:deprecationsAdded').message.deprecations;
    equal(deprecations.length, 2);
    var deprecation = deprecations[0];
    equal(deprecation.count, 2, 'Correctly combined');
    equal(deprecation.message, 'Deprecation 1');
    equal(deprecation.sources.length, 2, 'Correctly separated by source');
    deprecation = deprecations[1];
    equal(deprecation.count, 1);
    equal(deprecation.message, 'Deprecation 2');
    equal(deprecation.sources.length, 1);
    equal(deprecation.url, 'http://www.emberjs.com');

    var count = messages.findBy('name', 'deprecation:count').message.count;
    equal(count, 3, 'count correctly sent');
  });

});

