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
      assembler = new PromiseAssembler({
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
    assert.strictEqual(event.promise, assembler.find(promise['guid']));

    assert.strictEqual(assembler.find().length, 1);

    assert.strictEqual(promise['guid'], 1);
    assert.strictEqual(promise['label'], 'label');
    assert.strictEqual(promise['createdAt'], date);
    assert.strictEqual(promise['stack'], 'stack');
    assert.strictEqual(promise['state'], 'created');
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

    assert.strictEqual(assembler.find(parent['guid']), parent);
    assert.strictEqual(assembler.find(child['guid']), child);

    assert.strictEqual(assembler.find().length, 2);

    assert.strictEqual(parent['guid'], 1);
    assert.strictEqual(parent['label'], 'label');
    assert.strictEqual(parent['chainedAt'], date);
    assert.strictEqual(parent.children.length, 1);
    assert.strictEqual(child['guid'], 2);
    assert.strictEqual(child['parent'], parent);
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

    assert.strictEqual(assembler.find(parent['guid']), parent);
    assert.strictEqual(assembler.find(child['guid']), child);

    assert.strictEqual(assembler.find().length, 2);

    assert.strictEqual(parent['guid'], 1);
    assert.strictEqual(parent['label'], 'label');
    assert.strictEqual(parent['chainedAt'], date);
    assert.strictEqual(parent.children.length, 1);
    assert.strictEqual(child['guid'], 2);
    assert.strictEqual(child['parent'], parent);
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

    assert.strictEqual(promise['state'], 'created');

    assembler.on('fulfilled', function (e) {
      event = e;
    });

    fakeRSVP.trigger('fulfilled', {
      guid: 1,
      detail: 'value',
      timeStamp: date,
    });

    assert.strictEqual(event.promise, promise);
    assert.strictEqual(promise['state'], 'fulfilled');
    assert.strictEqual(promise['value'], 'value');
    assert.strictEqual(promise['settledAt'], date);
    assert.strictEqual(assembler.find().length, 1);
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

    assert.strictEqual(promise['state'], 'created');

    assembler.on('rejected', function (e) {
      event = e;
    });

    fakeRSVP.trigger('rejected', {
      guid: 1,
      detail: 'reason',
      timeStamp: date,
    });

    assert.strictEqual(event.promise, promise);
    assert.strictEqual(promise['state'], 'rejected');
    assert.strictEqual(promise['reason'], 'reason');
    assert.strictEqual(promise['settledAt'], date);
    assert.strictEqual(assembler.find().length, 1);
  });

  test('#stop', function (assert) {
    startAssembler();

    fakeRSVP.trigger('created', {
      guid: 1,
    });
    assert.strictEqual(assembler.find().length, 1);

    run(assembler, 'stop');

    assert.strictEqual(assembler.find().length, 0);
    assembler.on('created', function () {
      assert.ok(false);
    });
    fakeRSVP.trigger('created', { guid: 1 });
    assert.strictEqual(assembler.find().length, 0);
  });
});
