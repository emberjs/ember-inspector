import Ember from "ember";
import { module, test } from 'qunit';

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
  beforeEach() {
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
  afterEach() {
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("Route tree", function(assert) {
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

    assert.equal(name, 'route:routeTree');

    route = message.tree;
    assert.equal(route.value.name, 'application');
    assert.equal(route.value.type, 'resource');
    assert.equal(route.value.controller.name, 'application');
    assert.equal(route.value.controller.className, 'ApplicationController');
    assert.equal(route.value.routeHandler.name, 'application');
    assert.equal(route.value.routeHandler.className, 'ApplicationRoute');
    assert.equal(route.value.template.name, 'application');
    assert.equal(route.children.length, 6);

    assert.deepEqual(getChildrenProperty(route, 'name'), ['loading', 'error', 'simple', 'posts', 'comments', 'index'] );

    var commentsRoute = route.children.filter(function(child) {
      return child.value.name === 'comments';
    })[0];

    assert.ok(commentsRoute, 'expected comment steps');

    assert.equal(commentsRoute.children.length, 5);
    assert.equal(commentsRoute.value.type, 'resource');
    assert.equal(commentsRoute.value.controller.className, 'CommentsController');
    assert.equal(commentsRoute.value.routeHandler.className, 'CommentsRoute');

    assert.deepEqual(getChildrenProperty(commentsRoute, 'name'), ['comments.loading', 'comments.error', 'comments.new', 'comments.edit', 'comments.index']);

    assert.deepEqual(getChildrenProperty(commentsRoute, 'url'), ['/comments/loading', '', '/comments/new', '/comments/edit/:comment_id', '/comments']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'type'), ['route', 'route', 'route', 'route', 'route']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'controller.className'), ['CommentsLoadingController', 'CommentsErrorController', 'CommentsNewController', 'CommentsEditController', 'CommentsIndexController']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'routeHandler.className'), ['CommentsLoadingRoute', 'CommentsErrorRoute', 'CommentsNewRoute', 'CommentsEditRoute', 'CommentsIndexRoute']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'template.name'), ['comments/loading', 'comments/error', 'comments/new', 'comments/edit', 'comments/index']);
  });


});
