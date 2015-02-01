import Ember from "ember";

/* globals require */
var EmberDebug = require('ember-debug/main')["default"];
var port;
var App, run = Ember.run;

function setupApp(){
  App = Ember.Application.create();
  App.toString = function() { return 'App'; };
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
    this.resource('posts');
    this.resource('comments', function() {
      this.route('new');
      this.route('edit', { path: '/edit/:comment_id' });
    });
  });
}

function getChildrenProperty(route, prop) {
  return route.children.map(function(item) {return Ember.get(item.value, prop); });
}

module("Route Tree Debug", {
  setup: function() {
    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function() {}
    });
    run(function() {
      setupApp();
      EmberDebug.set('application', App);
    });
    run(EmberDebug, 'start');
    EmberDebug.get('generalDebug').reopen({
      emberCliConfig: null
    });
    port = EmberDebug.port;
  },
  teardown: function() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
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

  visit('/');

  andThen(function() {
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
    equal(route.children.length, 6);

    deepEqual(getChildrenProperty(route, 'name'), ['loading', 'error', 'simple', 'posts', 'comments', 'index'] );

    var commentsRoute = route.children.filter(function(child) {
      return child.value.name === 'comments';
    })[0];

    ok(commentsRoute, 'expected comment steps');

    equal(commentsRoute.children.length, 5);
    equal(commentsRoute.value.type, 'resource');
    equal(commentsRoute.value.controller.className, 'CommentsController');
    equal(commentsRoute.value.routeHandler.className, 'CommentsRoute');

    deepEqual(getChildrenProperty(commentsRoute, 'name'), ['comments.loading', 'comments.error', 'comments.new', 'comments.edit', 'comments.index']);

    deepEqual(getChildrenProperty(commentsRoute, 'url'), ['/comments/loading', '', '/comments/new', '/comments/edit/:comment_id', '/comments']);
    deepEqual(getChildrenProperty(commentsRoute, 'type'), ['route', 'route', 'route', 'route', 'route']);
    deepEqual(getChildrenProperty(commentsRoute, 'controller.className'), ['CommentsLoadingController', 'CommentsErrorController', 'CommentsNewController', 'CommentsEditController', 'CommentsIndexController']);
    deepEqual(getChildrenProperty(commentsRoute, 'routeHandler.className'), ['CommentsLoadingRoute', 'CommentsErrorRoute', 'CommentsNewRoute', 'CommentsEditRoute', 'CommentsIndexRoute']);
    deepEqual(getChildrenProperty(commentsRoute, 'template.name'), ['comments/loading', 'comments/error', 'comments/new', 'comments/edit', 'comments/index']);
  });


});
