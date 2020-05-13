import { run, later } from '@ember/runloop';
import { A as emberA } from '@ember/array';
import RSVP from 'rsvp';
import { module, skip, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import Port from 'ember-debug/port';

// RSVP instrumentation is out of band (50 ms delay)
async function rsvpDelay() {
  later(function () {}, 100);
  await settled();
}

module('Ember Debug - Promise Debug', function (hooks) {
  let name, message;

  setupEmberDebugTest(hooks, {
    Port: Port.extend({
      init() {},
      send(n, m) {
        name = n;
        message = m;
      },
    }),
  });

  hooks.beforeEach(async function () {
    EmberDebug.get('promiseDebug').reopen({
      delay: 5,
      session: {
        getItem() {},
        setItem() {},
        removeItem() {},
      },
    });
  });

  test('Existing promises sent when requested', async function t(assert) {
    let promise1, child1, promise2;

    run(() => {
      RSVP.resolve('value', 'Promise1').then(function () {}, null, 'Child1');

      // catch so we don't get a promise failure
      RSVP.reject('reason', 'Promise2').catch(() => {});
    });

    await rsvpDelay();

    EmberDebug.port.trigger('promise:getAndObservePromises');

    assert.equal(name, 'promise:promisesUpdated');

    let promises = emberA(message.promises);

    promise1 = promises.findBy('label', 'Promise1');
    child1 = promises.findBy('label', 'Child1');
    promise2 = promises.findBy('label', 'Promise2');

    assert.equal(promise1.label, 'Promise1');
    assert.equal(promise1.state, 'fulfilled');
    assert.equal(promise1.children.length, 1);
    assert.equal(promise1.children[0], child1.guid);

    assert.equal(child1.label, 'Child1');
    assert.equal(child1.state, 'fulfilled');
    assert.equal(child1.parent, promise1.guid);

    assert.equal(promise2.label, 'Promise2');
    assert.equal(promise2.state, 'rejected');
  });

  test('Updates are published when they happen', function (assert) {
    EmberDebug.port.trigger('promise:getAndObservePromises');

    let p;

    run(function () {
      p = new RSVP.Promise(function () {}, 'Promise1');
    });

    let done = assert.async();
    later(function () {
      assert.equal(name, 'promise:promisesUpdated');
      let promises = emberA(message.promises);
      let promise = promises.findBy('label', 'Promise1');
      assert.ok(!!promise);
      if (promise) {
        assert.equal(promise.label, 'Promise1');
        p.then(function () {}, null, 'Child1');
        later(function () {
          assert.equal(name, 'promise:promisesUpdated');
          assert.equal(message.promises.length, 2);
          let child = message.promises[0];
          assert.equal(child.parent, promise.guid);
          assert.equal(child.label, 'Child1');
          let parent = message.promises[1];
          assert.equal(parent.guid, promise.guid);
          done();
        }, 200);
      }
    }, 200);
  });

  test('Instrumentation with stack is persisted to session storage', async function (assert) {
    let withStack = false;
    EmberDebug.get('promiseDebug').reopen({
      session: {
        getItem(/*key*/) {
          return withStack;
        },
        setItem(key, val) {
          withStack = val;
        },
      },
    });

    await settled();
    EmberDebug.port.trigger('promise:getInstrumentWithStack');

    await settled();
    assert.equal(name, 'promise:instrumentWithStack');
    assert.equal(message.instrumentWithStack, false);
    EmberDebug.port.trigger('promise:setInstrumentWithStack', {
      instrumentWithStack: true,
    });

    await settled();
    assert.equal(name, 'promise:instrumentWithStack');
    assert.equal(message.instrumentWithStack, true);
    assert.equal(withStack, true, 'persisted');
    EmberDebug.port.trigger('promise:setInstrumentWithStack', {
      instrumentWithStack: false,
    });

    await settled();
    assert.equal(name, 'promise:instrumentWithStack');
    assert.equal(message.instrumentWithStack, false);
    assert.equal(withStack, false, 'persisted');
  });

  skip('Responds even if no promises detected', function (assert) {
    EmberDebug.port.trigger('promise:getAndObservePromises');
    assert.equal(name, 'promise:promisesUpdated');
    assert.equal(message.promises.length, 0);
  });
});
