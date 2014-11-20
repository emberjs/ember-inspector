import Ember from "ember";
/*globals require*/
var PromiseAssembler = require('ember-debug/libs/promise-assembler')["default"];

var assembler;

var fakeRSVP;

function stubRSVP() {
  fakeRSVP = Ember.Object.createWithMixins(Ember.Evented, {
    configure: Ember.K
  });
}

function startAssembler() {
  Ember.run(assembler, 'start');
}

module("PromiseAssembler", {
  setup: function() {
    stubRSVP();
    Ember.run(function() {
      assembler = PromiseAssembler.create({
        RSVP: fakeRSVP
      });
    });

  },
  teardown: function() {
    if (assembler) {
      Ember.run(assembler, 'destroy');
      assembler = null;
    }
  }
});

test("Creates promises correctly", function() {
  startAssembler();
  var date = new Date();
  var event;

  assembler.on('created', function(e) {
    event = e;
  });

  fakeRSVP.trigger('created', {
    guid: 1,
    label: 'label',
    timeStamp: date,
    stack: 'stack'
  });

  ok(event);
  var promise = event.promise;
  equal(event.promise, assembler.find(promise.get('guid')));

  equal(assembler.find().get('length'), 1);

  equal(promise.get('guid'), 1);
  equal(promise.get('label'), 'label');
  equal(promise.get('createdAt'), date);
  equal(promise.get('stack'), 'stack');
  equal(promise.get('state'), 'created');
});

test("Chains a promise correctly (parent and child not-existing)", function() {
  startAssembler();
  var date = new Date();
  var event;

  assembler.on('chained', function(e) {
    event = e;
  });

  fakeRSVP.trigger('chained', {
    guid: 1,
    label: 'label',
    timeStamp: date,
    childGuid: 2
  });

  var parent = event.promise;
  var child = event.child;

  equal(assembler.find(parent.get('guid')), parent);
  equal(assembler.find(child.get('guid')), child);

  equal(assembler.find().get('length'), 2);

  equal(parent.get('guid'), 1);
  equal(parent.get('label'), 'label');
  equal(parent.get('chainedAt'), date);
  equal(parent.get('children.length'), 1);
  equal(child.get('guid'), 2);
  equal(child.get('parent'), parent);

});

test("Chains a promise correctly (parent and child existing)", function() {

  startAssembler();
  var date = new Date();
  var event;
  var parent;
  var child;

  assembler.on('created', function(e) {
    parent = e.promise;
  });

  fakeRSVP.trigger('created', {
    guid: 1
  });

  assembler.off('created');

  assembler.on('created', function(e) {
    child = e.promise;
  });

  fakeRSVP.trigger('created', {
    guid: 2
  });


  assembler.on('chained', function(e) {
    event = e;
  });

  fakeRSVP.trigger('chained', {
    guid: 1,
    label: 'label',
    timeStamp: date,
    childGuid: 2
  });

  equal(parent, event.promise);
  equal(child, event.child);

  equal(assembler.find(parent.get('guid')), parent);
  equal(assembler.find(child.get('guid')), child);

  equal(assembler.find().get('length'), 2);

  equal(parent.get('guid'), 1);
  equal(parent.get('label'), 'label');
  equal(parent.get('chainedAt'), date);
  equal(parent.get('children.length'), 1);
  equal(child.get('guid'), 2);
  equal(child.get('parent'), parent);

});

test("Fulfills a promise correctly", function() {
  startAssembler();
  var date = new Date();
  var event;
  var promise;

  assembler.on('created', function(e) {
    promise = e.promise;
  });

  fakeRSVP.trigger('created', {
    guid: 1
  });

  assembler.off('created');

  equal(promise.get('state'), 'created');

  assembler.on('fulfilled', function(e) {
    event = e;
  });

  fakeRSVP.trigger('fulfilled', {
    guid: 1,
    detail: 'value',
    timeStamp: date
  });

  equal(event.promise, promise);
  equal(promise.get('state'), 'fulfilled');
  equal(promise.get('value'), 'value');
  equal(promise.get('settledAt'), date);
  equal(assembler.find().get('length'), 1);
});

test("Rejects a promise correctly", function() {
  startAssembler();
  var date = new Date();
  var event;
  var promise;

  assembler.on('created', function(e) {
    promise = e.promise;
  });

  fakeRSVP.trigger('created', {
    guid: 1
  });

  assembler.off('created');

  equal(promise.get('state'), 'created');

  assembler.on('rejected', function(e) {
    event = e;
  });

  fakeRSVP.trigger('rejected', {
    guid: 1,
    detail: 'reason',
    timeStamp: date
  });

  equal(event.promise, promise);
  equal(promise.get('state'), 'rejected');
  equal(promise.get('reason'), 'reason');
  equal(promise.get('settledAt'), date);
  equal(assembler.find().get('length'), 1);
});

test('#stop', function() {
  startAssembler();

  fakeRSVP.trigger('created', {
    guid: 1
  });
  equal(assembler.find().get('length'), 1);

  Ember.run(assembler, 'stop');

  equal(assembler.find().get('length'), 0);
  assembler.on('created', function() {
    ok(false);
  });
  fakeRSVP.trigger('created', { guid: 1 });
  equal(assembler.find().get('length'), 0);
});
