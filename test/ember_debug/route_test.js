import EmberDebug from "ember_debug";
import App from "test_app";

var port;


function getChildrenProperty(route, prop) {
  return route.children.map(function(item) {return Ember.get(item.value, prop); });
}

module("Route Debug", {
  setup: function() {

    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });


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
  equal(route.value.controller.name, 'application');
  equal(route.value.controller.className, 'ApplicationController');
  equal(route.value.routeHandler.name, 'application');
  equal(route.value.routeHandler.className, 'ApplicationRoute');
  equal(route.value.template.name, 'application');
  equal(route.children.length, 4);

  deepEqual(getChildrenProperty(route, 'name'), ['simple', 'posts', 'comments', 'index'] );

  var commentsRoute = route.children[2];
  equal(commentsRoute.children.length, 3);
  equal(commentsRoute.value.type, 'resource');
  equal(commentsRoute.value.controller.className, 'CommentsController');
  equal(commentsRoute.value.routeHandler.className, 'CommentsRoute');

  deepEqual(getChildrenProperty(commentsRoute, 'name'), ['comments.new', 'comments.edit', 'comments.index']);
  deepEqual(getChildrenProperty(commentsRoute, 'url'), ['/comments/new', '/comments/edit/:comment_id', '/comments']);
  deepEqual(getChildrenProperty(commentsRoute, 'type'), ['route', 'route', 'route']);
  deepEqual(getChildrenProperty(commentsRoute, 'controller.className'), ['CommentsNewController', 'CommentsEditController', 'CommentsIndexController']);
  deepEqual(getChildrenProperty(commentsRoute, 'routeHandler.className'), ['CommentsNewRoute', 'CommentsEditRoute', 'CommentsIndexRoute']);
  deepEqual(getChildrenProperty(commentsRoute, 'template.name'), ['comments/new', 'comments/edit', 'comments/index']);


});
