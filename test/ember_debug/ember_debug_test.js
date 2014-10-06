import EmberDebug from "ember_debug";
import App from "test_app";

var name, message;

var port, EmberInspector;

module("Ember Debug", {
  setup: function() {

    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function(n, m) {
        name = n;
        message = m;
      }
    });

    App.reset();
    EmberDebug.start();
    EmberInspector = EmberDebug;
    port = EmberDebug.port;
    name = null;
    message = null;
  }
});


function cantSend(obj) {
  try {
    EmberInspector.inspect(obj);
    ok(false);
  } catch (e) {}
}

test("EmberInspector#inspect sends inspectable objects", function() {
  var obj = Ember.Object.create();
  EmberInspector.inspect(obj);
  equal(name, "objectInspector:updateObject");
  name = null;
  obj = [];
  EmberInspector.inspect(obj);
  equal(name, "objectInspector:updateObject");
  cantSend(1);
  cantSend({});
  cantSend("a");
  cantSend(null);
});
