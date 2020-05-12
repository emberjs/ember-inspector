import { settled, visit } from '@ember/test-helpers';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import Route from '@ember/routing/route';
import { module, test } from 'qunit';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import EmberDebug from 'ember-debug/main';

function getChildrenProperty(route, prop) {
  return route.children.map(item => get(item.value, prop));
}

module('Ember Debug - Route Tree', function(hooks) {
  setupEmberDebugTest(hooks, {
    routes() {
      this.route('simple');
      this.route('posts', { resetNamespace: true });
      this.route('comments', { resetNamespace: true }, function() {
        this.route('new');
        this.route('edit', { path: '/edit/:comment_id' });
      });
    }
  });

  hooks.beforeEach(async function() {
    this.owner.register('route:loading', Route);
    this.owner.register('route:error', Route);

    EmberDebug.get('generalDebug').reopen({
      emberCliConfig: null
    });
  });

  test('Route tree', async function t(assert) {
    let name = null, message = null, route;
    EmberDebug.port.reopen({
      send(n, m) {
        name = n;
        message = m;
      }
    });

    await visit('/');

    run(EmberDebug.port, 'trigger', 'route:getTree');
    await settled();

    assert.equal(name, 'route:routeTree');

    route = message.tree.children[0];
    assert.equal(route.value.name, 'application');
    assert.equal(route.value.type, 'resource');
    assert.equal(route.value.controller.name, 'application');
    assert.equal(route.value.controller.className, 'ApplicationController');
    assert.equal(route.value.routeHandler.name, 'application');
    assert.equal(route.value.routeHandler.className, 'ApplicationRoute');
    assert.equal(route.value.template.name, 'application');
    assert.equal(route.children.length, 6);

    assert.deepEqual(getChildrenProperty(route, 'name'), ['loading', 'error', 'simple', 'posts', 'comments', 'index']);

    let commentsRoute = route.children.filter(function(child) {
      return child.value.name === 'comments';
    })[0];

    assert.ok(commentsRoute, 'expected comment steps');

    assert.equal(commentsRoute.children.length, 3);
    assert.equal(commentsRoute.value.type, 'resource');
    assert.equal(commentsRoute.value.controller.className, 'CommentsController');
    assert.equal(commentsRoute.value.routeHandler.className, 'CommentsRoute');

    assert.deepEqual(getChildrenProperty(commentsRoute, 'name'), ['comments.new', 'comments.edit', 'comments.index']);

    assert.deepEqual(getChildrenProperty(commentsRoute, 'url'), ['/comments/new', '/comments/edit/:comment_id', '/comments']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'type'), ['route', 'route', 'route']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'controller.className'), ['CommentsNewController', 'CommentsEditController', 'CommentsIndexController']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'routeHandler.className'), ['CommentsNewRoute', 'CommentsEditRoute', 'CommentsIndexRoute']);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'template.name'), ['comments/new', 'comments/edit', 'comments/index']);
  });
});
