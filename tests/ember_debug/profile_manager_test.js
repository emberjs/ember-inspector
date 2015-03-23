/* globals require */
import { module, test } from 'qunit';
var ProfileManager = require('ember-debug/models/profile-manager')["default"];

test("Construction", function(assert) {
  var manager = new ProfileManager();
  assert.ok(!!manager, "it was created");
  assert.equal(manager.profiles.length, 0, "it has no profiles");
});
