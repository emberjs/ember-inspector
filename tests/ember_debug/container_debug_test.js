import { module, test } from 'qunit';
import Ember from "ember";
var emberA = Ember.A;

var EmberDebug;
var port, name, message;
var run = Ember.run;
var App;

function setupApp() {
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });
}

module("Container Debug", {
  beforeEach() {
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
  afterEach() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("#getTypes", function(assert) {
  visit('/simple');

  andThen(function() {
    port.trigger('container:getTypes');
    return wait();
  });

  andThen(function() {
    assert.equal(name, 'container:types');
    var types = emberA(message.types);
    var application = types.findBy('name', 'application');
    assert.ok(application);
    assert.equal(application.count, 1);
    assert.ok(types.findBy('name', 'controller'));
    assert.ok(types.findBy('name', 'route'));
  });
});

test("#getInstances", function(assert) {
  visit('/simple');

  andThen(function() {
    port.trigger('container:getInstances', { containerType: 'controller' });
    return wait();
  });

  andThen(function() {
    assert.equal(name, 'container:instances');
    var instances = emberA(message.instances);
    assert.ok(instances.findBy('name', 'simple'));
  });
});
