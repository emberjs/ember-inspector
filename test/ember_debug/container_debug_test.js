import EmberDebug from "ember_debug";
import App from "test_app";
var emberA = Ember.A;

var port, name, message;

module("Promise Debug", {
  setup: function() {

    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function(n, m) {
        name = n;
        message = m;
      }
    });

    App.reset();
    Ember.run(EmberDebug, 'start');
    port = EmberDebug.port;
  },
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
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
