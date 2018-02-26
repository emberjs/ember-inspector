let name;
/* eslint no-empty:0 */
import Ember from "ember";
import { module, test } from 'qunit';
import require from 'require';

let EmberDebug;
let port, adapter;
const { run, Application, Object: EmberObject } = Ember;
let App;
let EmberInspector;

function setupApp() {
  App = Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

}

module("Ember Debug", function(hooks) {
  hooks.beforeEach(function() {
    EmberDebug = require('ember-debug/main').default;
    EmberDebug.Port = EmberDebug.Port.extend({
      init() {},
      send(n/*, m*/) {
        name = n;
      }
    });
    run(function() {
      setupApp();
      EmberDebug.set('owner', App.__deprecatedInstance__);
    });
    run(EmberDebug, 'start');
    EmberInspector = EmberDebug;
    port = EmberDebug.port;
    adapter = EmberDebug.get('port.adapter');
  });

  hooks.afterEach(function() {
    name = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  });


  function cantSend(obj, assert) {
    try {
      EmberInspector.inspect(obj);
      assert.ok(false);
    } catch (e) {}
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
    cantSend({}, assert);
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
