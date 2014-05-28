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
        profiles = profiles.concat(m.profiles);
      }
    }
  });
  port.trigger('render:watchProfiles');

  visit('/simple')
  .then(function() {
    ok(profiles.length > 0, "it has created profiles");
  });
});

test("Clears correctly", function() {
  var profiles = [];

  port.reopen({
    send: function(n, m) {
      if (n === "render:profilesAdded") {
        profiles.push(m.profiles);
      }
      if (n === "render:profilesUpdated") {
        profiles = m.profiles;
      }
    }
  });

  port.trigger('render:watchProfiles');

  visit('/simple');

  andThen(function() {
    ok(profiles.length > 0, "it has created profiles");
    port.trigger('render:clear');
    return wait();
  });

  andThen(function() {
    ok(profiles.length === 0, "it has cleared the profiles");
  });

});
