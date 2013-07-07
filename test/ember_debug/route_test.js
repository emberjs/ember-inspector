import "ember_debug" as EmberDebug;
import "test_app" as App;


EmberDebug.Port = EmberDebug.Port.extend({
  init: function() {},
  send: function() {}
});

var port;


function getChildrenProperty(route, prop) {
  return route.children.map(function(item) {return item.value[prop]; });
}

module("Ember Debug", {
  setup: function() {
    App.reset();
    EmberDebug.start();
    port = EmberDebug.port;
  }
});


test("Route tree", function() {
  var name = null, message = null, route, children;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

  port.trigger('route:getTree');

  equal(name, 'route:routeTree');

  route = message.tree;
  equal(route.value.name, 'application');
  equal(route.value.type, 'resource');
  equal(route.children.length, 4);

  deepEqual(getChildrenProperty(route, 'name'), ['simple', 'posts', 'comments', 'index'] );

  var commentsRoute = route.children[2];
  equal(commentsRoute.children.length, 3);
  equal(commentsRoute.value.type, 'resource');

  deepEqual(getChildrenProperty(commentsRoute, 'name'), ['comments.new', 'comments.edit', 'comments.index']);
  deepEqual(getChildrenProperty(commentsRoute, 'url'), ['/comments/new', '/comments/edit/:comment_id', '/comments']);
  deepEqual(getChildrenProperty(commentsRoute, 'type'), ['route', 'route', 'route']);

});
