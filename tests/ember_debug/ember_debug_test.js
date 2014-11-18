import Ember from "ember";

var EmberDebug;
var port, name, message;
var run = Ember.run;
var App;
var EmberInspector;

function setupApp(){
  App = Ember.Application.create();
}

module("Ember Debug", {
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
      EmberDebug.set('app', App);
    });
    run(EmberDebug, 'start');
    EmberDebug.start();
    EmberInspector = EmberDebug;
    port = EmberDebug.port;
  },
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});


function cantSend(obj) {
  try {
    EmberInspector.inspect(obj);
    ok(false);
  } catch (e) {}
}

test("EmberInspector#inspect sends inspectable objects", function() {
  var obj = Ember.Object.create();
  EmberInspector.inspect(obj);
  equal(name, "objectInspector:updateObject");
  name = null;
  obj = [];
  EmberInspector.inspect(obj);
  equal(name, "objectInspector:updateObject");
  cantSend(1);
  cantSend({});
  cantSend("a");
  cantSend(null);
});
