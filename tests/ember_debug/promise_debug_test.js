import Ember from "ember";
/*globals require */
var EmberDebug = require("ember-debug/main")["default"];

var port, name, message, RSVP = Ember.RSVP;
var EmberDebug;
var run = Ember.run;
var App;
var emberA = Ember.A;

function setupApp(){
  App = Ember.Application.create();
  App.injectTestHelpers();
  App.setupForTesting();
}

module("Promise Debug", {
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
    Ember.run(EmberDebug, 'start');
    EmberDebug.get('promiseDebug').reopen({
      delay: 5
    });
    port = EmberDebug.port;
  },
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    Ember.run(App, 'destroy');
  }
});

test("Existing promises sent when requested", function() {
  var promise1, child1, promise2;

  run(function() {
    var p = RSVP.resolve('value', "Promise1")
    .then(function(){}, null, "Child1");

    RSVP.reject('reason', "Promise2");
  });

  // RSVP instrumentation is out of band (50 ms delay)
  Ember.run.later(function() {}, 100);

  wait();

  andThen(function() {
    port.trigger('promise:getAndObservePromises');

    equal(name, 'promise:promisesUpdated');

    var promises = emberA(message.promises);

    promise1 = promises.findBy('label', 'Promise1');
    child1 = promises.findBy('label', 'Child1');
    promise2 = promises.findBy('label', 'Promise2');

    equal(promise1.label, 'Promise1');
    equal(promise1.state, 'fulfilled');
    equal(promise1.children.length, 1);
    equal(promise1.children[0], child1.guid);

    equal(child1.label, 'Child1');
    equal(child1.state, 'fulfilled');
    equal(child1.parent, promise1.guid);

    equal(promise2.label, 'Promise2');
    equal(promise2.state, 'rejected');

  });

});

test("Updates are published when they happen", function() {
  port.trigger('promise:getAndObservePromises');

  var p;

  run(function() {
    p = new RSVP.Promise(function(){}, "Promise1");
  });

  equal(name, 'promise:promisesUpdated');
  stop();
  Ember.run.later(function() {
    var promises = emberA(message.promises);
    var promise = promises.findBy('label', 'Promise1');
    equal(promise.label, 'Promise1');
    p.then(function(){}, null, "Child1");
    Ember.run.later(function() {
      start();
      equal(name, 'promise:promisesUpdated');
      equal(message.promises.length, 2);
      var child = message.promises[0];
      equal(child.parent, promise.guid);
      equal(child.label, 'Child1');
      var parent = message.promises[1];
      equal(parent.guid, promise.guid);
    }, 200);
  }, 200);
});
