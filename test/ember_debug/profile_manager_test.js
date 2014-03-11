import ProfileManager from 'models/profile_manager';

test("Construction", function() {
  var manager = new ProfileManager();
  ok(!!manager, "it was created");
  equal(manager.profiles.length, 0, "it has no profiles");
});
