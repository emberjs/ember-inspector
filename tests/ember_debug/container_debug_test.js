import Ember from "ember";
var emberA = Ember.A;

var EmberDebug;
var port, name, message;
var run = Ember.run;
var App;

function setupApp(){
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });
}

module("Container Debug", {
  setup: function() {
    /* globals require */
    EmberDebug = require('ember-debug/main')["default"];
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
  },
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("#getTypes", function() {

  visit('/simple');

  andThen(function() {
    port.trigger('container:getTypes');
    return wait();
  });

  andThen(function() {
    equal(name, 'container:types');
    var types = emberA(message.types);
    var application = types.findBy('name', 'application');
    ok(application);
    equal(application.count, 1);
    ok(types.findBy('name', 'controller'));
    ok(types.findBy('name', 'route'));
  });
});

test("#getInstances", function() {
  visit('/simple');

  andThen(function() {
    port.trigger('container:getInstances', { containerType: 'controller'});
    return wait();
  });

  andThen(function() {
    equal(name, 'container:instances');
    var instances = emberA(message.instances);
    ok(instances.findBy('name', 'simple'));
  });
});
