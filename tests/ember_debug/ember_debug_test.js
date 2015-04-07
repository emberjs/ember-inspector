/* jshint ignore:start */
/* eslint no-empty:0 */
import Ember from "ember";
import { module, test } from 'qunit';

var EmberDebug;
var port, name, message;
/* jshint ignore:start */
var run = Ember.run;
var App;
var EmberInspector;

function setupApp() {
  App = Ember.Application.create();
}

module("Ember Debug", {
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
      EmberDebug.set('app', App);
    });
    run(EmberDebug, 'start');
    EmberDebug.start();
    EmberInspector = EmberDebug;
    port = EmberDebug.port;
  },
  afterEach() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});


function cantSend(obj, assert) {
  try {
    EmberInspector.inspect(obj);
    assert.ok(false);
  } catch (e) {}
}

test("EmberInspector#inspect sends inspectable objects", function(assert) {
  var obj = Ember.Object.create();
  EmberInspector.inspect(obj);
  assert.equal(name, "objectInspector:updateObject");
  name = null;
  obj = [];
  EmberInspector.inspect(obj);
  assert.equal(name, "objectInspector:updateObject");
  cantSend(1, assert);
  cantSend({}, assert);
  cantSend("a", assert);
  cantSend(null, assert);
});
