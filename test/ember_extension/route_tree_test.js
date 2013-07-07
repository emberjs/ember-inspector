import "main" as EmberExtension;

var port;

module("Route Tree", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');
  }
});

// TODO: Route Tree Tests
test("bla", function() {
  visit('route_tree');
  ok(true);
});
