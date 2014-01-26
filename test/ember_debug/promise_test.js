import EmberDebug from "ember_debug";
import PromiseAssembler from "libs/promise_assembler";

var port, name, message, RSVP = Ember.RSVP;

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
    EmberDebug.get('promiseDebug').reopen({
      delay: 5
    });
    port = EmberDebug.port;
  },
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
  }
});

test("Existing promises sent when requested", function() {
  var promise1, child1, promise2;

  Ember.run(function() {
    RSVP.resolve('value', "Promise1")
    .then(null, null, "Child1");

    RSVP.reject('reason', "Promise2");
  });

  port.trigger('promise:getAndObservePromises');

  equal(name, 'promise:promisesUpdated');

  var promises = message.promises;
  equal(promises.length, 3);

  promise1 = promises[0];
  child1 = promises[1];
  promise2 = promises[2];

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

test("Updates are published when they happen", function() {
  port.trigger('promise:getAndObservePromises');

  var p = new Ember.RSVP.Promise(function() {}, "Promise1");

  equal(name, 'promise:promisesUpdated');
  stop();
  Ember.run.later(function() {
    var promises = message.promises;
    promises.length = 1;
    var promise = message.promises[0];
    equal(promise.label, 'Promise1');
    p.then(null, null, "Child1");
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
