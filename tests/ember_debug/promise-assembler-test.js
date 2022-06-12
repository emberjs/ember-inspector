import { run } from '@ember/runloop';
import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import PromiseAssembler from 'ember-debug/libs/promise-assembler';

let assembler;

let fakeRSVP;

function stubRSVP() {
  fakeRSVP = EmberObject.extend(Evented, {
    configure() {},
  }).create();
}

function startAssembler() {
  run(assembler, 'start');
}

module('Ember Debug - PromiseAssembler', function (hooks) {
  hooks.beforeEach(() => {
    stubRSVP();
    run(function () {
      assembler = PromiseAssembler.create({
        RSVP: fakeRSVP,
      });
    });
  });

  hooks.afterEach(() => {
    if (assembler) {
      run(assembler, 'destroy');
      assembler = null;
    }
  });

  test('Creates promises correctly', function (assert) {
    startAssembler();
    let date = new Date();
    let event;

    assembler.on('created', function (e) {
      event = e;
    });

    fakeRSVP.trigger('created', {
      guid: 1,
      label: 'label',
      timeStamp: date,
      stack: 'stack',
    });

    assert.ok(event);
    let promise = event.promise;
    assert.strictEqual(event.promise, assembler.find(promise.get('guid')));

    assert.strictEqual(assembler.find().get('length'), 1);

    assert.strictEqual(promise.get('guid'), 1);
    assert.strictEqual(promise.get('label'), 'label');
    assert.strictEqual(promise.get('createdAt'), date);
    assert.strictEqual(promise.get('stack'), 'stack');
    assert.strictEqual(promise.get('state'), 'created');
  });

  test('Chains a promise correctly (parent and child not-existing)', function (assert) {
    startAssembler();
    let date = new Date();
    let event;

    function captureEvent(e) {
      event = e;
    }

    assembler.on('chained', captureEvent);

    fakeRSVP.trigger('chained', {
      guid: 1,
      label: 'label',
      timeStamp: date,
      childGuid: 2,
    });

    let parent = event.promise;
    let child = event.child;

    assert.strictEqual(assembler.find(parent.get('guid')), parent);
    assert.strictEqual(assembler.find(child.get('guid')), child);

    assert.strictEqual(assembler.find().get('length'), 2);

    assert.strictEqual(parent.get('guid'), 1);
    assert.strictEqual(parent.get('label'), 'label');
    assert.strictEqual(parent.get('chainedAt'), date);
    assert.strictEqual(parent.get('children.length'), 1);
    assert.strictEqual(child.get('guid'), 2);
    assert.strictEqual(child.get('parent'), parent);
    assembler.off('chained', captureEvent);
  });

  test('Chains a promise correctly (parent and child existing)', function (assert) {
    startAssembler();
    let date = new Date();
    let event;
    let parent;
    let child;

    function captureParent(e) {
      parent = e.promise;
    }

    assembler.on('created', captureParent);

    fakeRSVP.trigger('created', {
      guid: 1,
    });

    assembler.off('created', captureParent);

    function captureChild(e) {
      child = e.promise;
    }

    assembler.on('created', captureChild);

    fakeRSVP.trigger('created', {
      guid: 2,
    });

    function captureEvent(e) {
      event = e;
    }

    assembler.on('chained', captureEvent);

    fakeRSVP.trigger('chained', {
      guid: 1,
      label: 'label',
      timeStamp: date,
      childGuid: 2,
    });

    assert.strictEqual(parent, event.promise);
    assert.strictEqual(child, event.child);

    assert.strictEqual(assembler.find(parent.get('guid')), parent);
    assert.strictEqual(assembler.find(child.get('guid')), child);

    assert.strictEqual(assembler.find().get('length'), 2);

    assert.strictEqual(parent.get('guid'), 1);
    assert.strictEqual(parent.get('label'), 'label');
    assert.strictEqual(parent.get('chainedAt'), date);
    assert.strictEqual(parent.get('children.length'), 1);
    assert.strictEqual(child.get('guid'), 2);
    assert.strictEqual(child.get('parent'), parent);
    assembler.off('chained', captureEvent);
    assembler.off('created', captureChild);
  });

  test('Fulfills a promise correctly', function (assert) {
    startAssembler();
    let date = new Date();
    let event;
    let promise;

    function capturePromise(e) {
      promise = e.promise;
    }

    assembler.on('created', capturePromise);

    fakeRSVP.trigger('created', {
      guid: 1,
    });

    assembler.off('created', capturePromise);

    assert.strictEqual(promise.get('state'), 'created');

    assembler.on('fulfilled', function (e) {
      event = e;
    });

    fakeRSVP.trigger('fulfilled', {
      guid: 1,
      detail: 'value',
      timeStamp: date,
    });

    assert.strictEqual(event.promise, promise);
    assert.strictEqual(promise.get('state'), 'fulfilled');
    assert.strictEqual(promise.get('value'), 'value');
    assert.strictEqual(promise.get('settledAt'), date);
    assert.strictEqual(assembler.find().get('length'), 1);
  });

  test('Rejects a promise correctly', function (assert) {
    startAssembler();
    let date = new Date();
    let event;
    let promise;

    function capturePromise(e) {
      promise = e.promise;
    }

    assembler.on('created', capturePromise);

    fakeRSVP.trigger('created', {
      guid: 1,
    });

    assembler.off('created', capturePromise);

    assert.strictEqual(promise.get('state'), 'created');

    assembler.on('rejected', function (e) {
      event = e;
    });

    fakeRSVP.trigger('rejected', {
      guid: 1,
      detail: 'reason',
      timeStamp: date,
    });

    assert.strictEqual(event.promise, promise);
    assert.strictEqual(promise.get('state'), 'rejected');
    assert.strictEqual(promise.get('reason'), 'reason');
    assert.strictEqual(promise.get('settledAt'), date);
    assert.strictEqual(assembler.find().get('length'), 1);
  });

  test('#stop', function (assert) {
    assert.expect(3);

    startAssembler();

    fakeRSVP.trigger('created', {
      guid: 1,
    });
    assert.strictEqual(assembler.find().get('length'), 1);

    run(assembler, 'stop');

    assert.strictEqual(assembler.find().get('length'), 0);
    assembler.on('created', function () {
      assert.ok(false);
    });
    fakeRSVP.trigger('created', { guid: 1 });
    assert.strictEqual(assembler.find().get('length'), 0);
  });
});
