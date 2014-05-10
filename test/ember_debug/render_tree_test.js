import EmberDebug from 'ember_debug';
import App from 'test_app';


var port;

module("Render Debug", {

  setup: function() {

    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });

    EmberDebug.destroyContainer();
    App.reset();
    EmberDebug.start();
    port = EmberDebug.port;
  }
});

test("Simple Render", function() {
  var profiles = [];
  port.reopen({
    send: function(n, m) {
      if (n === "render:profilesAdded") {
        profiles.pushObjects(m.profiles);
      }
    }
  });
  port.trigger('render:watchProfiles');

  visit('/simple')
  .then(function() {
    ok(profiles.length > 0, "it has created profiles");
  });
});

