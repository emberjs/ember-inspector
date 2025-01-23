import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import EmberDebug from 'ember-debug/main';
import Port from 'ember-debug/port';
import { settled } from '@ember/test-helpers';

module('Ember Debug', function (hooks) {
  let name, adapter;

  setupEmberDebugTest(hooks, {
    Port: class extends Port {
      init() {}
      send(n) {
        name = n;
      }
    },
  });

  hooks.beforeEach(async function () {
    adapter = EmberDebug.port.adapter;
  });

  function cantSend(obj, assert) {
    try {
      EmberDebug.inspect(obj);
      assert.ok(false);
    } catch {
      // Intentionally empty
    }
  }

  test('EmberDebug#inspect sends inspectable objects', function (assert) {
    let obj = EmberObject.create();
    EmberDebug.inspect(obj);
    assert.strictEqual(name, 'objectInspector:updateObject');
    name = null;
    obj = [];
    EmberDebug.inspect(obj);
    assert.strictEqual(name, 'objectInspector:updateObject');
    cantSend(1, assert);
    cantSend('a', assert);
    cantSend(null, assert);
  });

  test('Errors are caught and handled by EmberDebug', async function t(assert) {
    const error = new Error('test error');
    EmberDebug.port.on('test:errors', () => {
      throw error;
    });

    const handleError = adapter.handleError;
    adapter.reopen({
      handleError(e) {
        assert.strictEqual(e, error, 'Error handled');
      },
    });

    EmberDebug.port.messageReceived('test:errors', {});

    await settled();
    adapter.reopen({ handleError });
  });
});
