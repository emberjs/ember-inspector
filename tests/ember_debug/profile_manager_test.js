/* globals require */
var ProfileManager = require('ember-debug/models/profile-manager')["default"];

test("Construction", function() {
  var manager = new ProfileManager();
  ok(!!manager, "it was created");
  equal(manager.profiles.length, 0, "it has no profiles");
});
