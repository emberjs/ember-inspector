import { settled, visit, waitUntil } from '@ember/test-helpers';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import Route from '@ember/routing/route';
import { module, test } from 'qunit';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import EmberDebugImport from 'ember-debug/main';
let EmberDebug;

function getChildrenProperty(route, prop) {
  return route.children.map((item) => get(item.value, prop));
}

module('Ember Debug - Route Tree', function (hooks) {
  hooks.before(async function () {
    EmberDebug = (await EmberDebugImport).default;
  });

  setupEmberDebugTest(hooks, {
    routes() {
      this.route('simple');
      this.route('posts', { resetNamespace: true });
      this.route('comments', { resetNamespace: true }, function () {
        this.route('new');
        this.route('edit', { path: '/edit/:comment_id' });
      });
    },
  });

  hooks.beforeEach(async function () {
    this.owner.register('route:loading', Route);
    this.owner.register('route:error', Route);
    this.owner.register(
      'route:posts',
      class extends Route {
        promise = Promise.resolve(Route);
        then = this.promise.then.bind(this.promise);
      },
    );

    EmberDebug.generalDebug.reopen({
      emberCliConfig: null,
    });
  });

  test('Route tree', async function t(assert) {
    let name = null,
      message = null,
      route;
    EmberDebug.port.reopen({
      send(n, m) {
        name = n;
        message = m;
      },
    });

    await visit('/');
    await waitUntil(
      () => {
        return name === 'view:renderTree';
      },
      { timeout: 3000 },
    );

    // eslint-disable-next-line ember/no-runloop
    run(EmberDebug.port, 'trigger', 'route:getTree');
    await settled();

    assert.strictEqual(name, 'route:routeTree');

    route = message.tree.children[0];
    assert.strictEqual(route.value.name, 'application');
    assert.strictEqual(route.value.type, 'resource');
    assert.strictEqual(route.value.controller.name, 'application');
    assert.strictEqual(
      route.value.controller.className,
      'ApplicationController',
    );
    assert.strictEqual(route.value.routeHandler.name, 'application');
    assert.strictEqual(route.value.routeHandler.className, 'ApplicationRoute');
    assert.strictEqual(route.value.template.name, 'application');
    assert.strictEqual(route.children.length, 6);

    assert.deepEqual(getChildrenProperty(route, 'name'), [
      'loading',
      'error',
      'simple',
      'posts',
      'comments',
      'index',
    ]);

    let commentsRoute = route.children.filter(function (child) {
      return child.value.name === 'comments';
    })[0];

    assert.ok(commentsRoute, 'expected comment steps');

    assert.strictEqual(commentsRoute.children.length, 3);
    assert.strictEqual(commentsRoute.value.type, 'resource');
    assert.strictEqual(
      commentsRoute.value.controller.className,
      'CommentsController',
    );
    assert.strictEqual(
      commentsRoute.value.routeHandler.className,
      'CommentsRoute',
    );

    assert.deepEqual(getChildrenProperty(commentsRoute, 'name'), [
      'comments.new',
      'comments.edit',
      'comments.index',
    ]);

    assert.deepEqual(getChildrenProperty(commentsRoute, 'url'), [
      '/comments/new',
      '/comments/edit/:comment_id',
      '/comments',
    ]);
    assert.deepEqual(getChildrenProperty(commentsRoute, 'type'), [
      'route',
      'route',
      'route',
    ]);
    assert.deepEqual(
      getChildrenProperty(commentsRoute, 'controller.className'),
      [
        'CommentsNewController',
        'CommentsEditController',
        'CommentsIndexController',
      ],
    );
    assert.deepEqual(
      getChildrenProperty(commentsRoute, 'routeHandler.className'),
      ['CommentsNewRoute', 'CommentsEditRoute', 'CommentsIndexRoute'],
    );
    assert.deepEqual(getChildrenProperty(commentsRoute, 'template.name'), [
      'comments/new',
      'comments/edit',
      'comments/index',
    ]);
  });
});
