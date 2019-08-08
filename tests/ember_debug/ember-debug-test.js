import EmberObject from '@ember/object';
let name;
import { module, test } from 'qunit';
import require from 'require';
import wait from 'ember-test-helpers/wait';
import { setupEIApp, destroyEIApp } from '../helpers/setup-destroy-ei-app';

let EmberDebug;
let port, adapter;
let App;
let EmberInspector;

module("Ember Debug", function(hooks) {
  hooks.beforeEach(async function() {
    EmberDebug = require('ember-debug/main').default;
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send(n/*, m*/) {
        name = n;
      }
    });

    App = await setupEIApp.call(this, EmberDebug);

    EmberInspector = EmberDebug;
    port = EmberDebug.port;
    adapter = EmberDebug.get('port.adapter');
  });

  hooks.afterEach(async function() {
    name = null;
    await destroyEIApp.call(this, EmberDebug, App);
  });


  function cantSend(obj, assert) {
    try {
      EmberInspector.inspect(obj);
      assert.ok(false);
    } catch (e) {
      // Intentionally empty
    }
  }

  test("EmberInspector#inspect sends inspectable objects", function(assert) {
    let obj = EmberObject.create();
    EmberInspector.inspect(obj);
    assert.equal(name, "objectInspector:updateObject");
    name = null;
    obj = [];
    EmberInspector.inspect(obj);
    assert.equal(name, "objectInspector:updateObject");
    cantSend(1, assert);
    cantSend("a", assert);
    cantSend(null, assert);
  });

  test("Errors are caught and handled by EmberDebug", async function t(assert) {
    assert.expect(1);
    const error = new Error('test error');
    port.on('test:errors', () => {
      throw error;
    });

    const handleError = adapter.handleError;
    adapter.reopen({
      handleError(e) {
        assert.equal(e, error, 'Error handled');
      }
    });

    port.messageReceived('test:errors', {});

    await wait();
    adapter.reopen({ handleError });
  });
});
