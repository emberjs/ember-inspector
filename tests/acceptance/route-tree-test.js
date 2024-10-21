import {
  click,
  fillIn,
  find,
  findAll,
  triggerEvent,
  visit,
  waitUntil,
} from '@ember/test-helpers';
import { classify } from '@ember/string';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function deepAssign(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepAssign(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepAssign(target, ...sources);
}

function routeValue(name, props) {
  let value = {
    name,
    controller: {
      name,
      className: `${classify(name.replace(/\./g, '_'))}Controller`,
      exists: true,
    },
    routeHandler: {
      name,
      className: `${classify(name.replace(/\./g, '_'))}Route`,
    },
    template: {
      name: name.replace(/\./g, '/'),
    },
  };
  props = props || {};
  return deepAssign({}, value, props);
}

function routeTree() {
  return {
    value: routeValue('application'),
    children: [
      {
        value: routeValue('post', { controller: { exists: false } }),
        children: [
          {
            value: routeValue('post.loading', { url: 'post/loading' }),
            children: [],
          },
          {
            value: routeValue('post.new', { url: 'post/new' }),
            children: [],
          },
          {
            value: routeValue('post.edit', { url: 'post/edit' }),
            children: [
              {
                value: routeValue('comments', { url: 'post/edit/comments' }),
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };
}

module('Route Tree Tab', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  outer.beforeEach(function () {
    respondWith('route:getTree', {
      type: 'route:routeTree',
      tree: routeTree(),
    });
  });

  module('Starting at post/edit', function (inner) {
    inner.beforeEach(function () {
      respondWith('route:getCurrentRoute', {
        type: 'route:currentRoute',
        name: 'post.edit',
        url: 'post/edit',
      });
    });

    test('Route tree is successfully displayed', async function (assert) {
      await visit('route-tree');

      await waitUntil(
        function () {
          return findAll('.js-route-tree-item').length === 6;
        },
        { timeout: 2000 },
      );

      let routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 6, 'correct number of nodes');

      let routeNames = findAll('.js-route-name').map(function (item) {
        return item.textContent.trim();
      });
      assert.deepEqual(
        routeNames,
        [
          'application',
          'post',
          'post.loading',
          'post.new',
          'post.edit',
          'comments',
        ],
        'route name displayed',
      );

      let routeHandlers = findAll('[data-test-route-handler]').map(
        function (item) {
          return item.getAttribute('title').trim();
        },
      );
      assert.deepEqual(
        routeHandlers,
        [
          'ApplicationRoute',
          'PostRoute',
          'PostLoadingRoute',
          'PostNewRoute',
          'PostEditRoute',
          'CommentsRoute',
        ],
        'route class name in title attribute',
      );

      let controllers = findAll('.js-route-controller').map(function (item) {
        return item.getAttribute('title').trim();
      });

      // "PostController" not listed because a file for it was not created on the filesystem
      assert.deepEqual(
        controllers,
        [
          'ApplicationController',
          'PostLoadingController',
          'PostNewController',
          'PostEditController',
          'CommentsController',
        ],
        'controller class name in title attribute',
      );
    });

    test('Clicking on route handlers and controller sends an inspection message', async function (assert) {
      await visit('route-tree');

      let applicationRow = find('.js-route-tree-item');

      respondWith('objectInspector:inspectRoute', ({ name }) => {
        assert.strictEqual(name, 'application', 'route name');
        return false;
      });

      await click(applicationRow.querySelector('[data-test-route-handler]'));

      respondWith('objectInspector:inspectController', ({ name }) => {
        assert.strictEqual(name, 'application', 'controller name');
        return false;
      });

      await click(applicationRow.querySelector('.js-route-controller'));
    });

    test('Current Route is highlighted', async function (assert) {
      await visit('route-tree');

      let routeNodes = findAll('.js-route-tree-item .js-route-name');
      let isCurrent = [...routeNodes].map((item) =>
        item.classList.contains('pill'),
      );
      assert.deepEqual(isCurrent, [true, true, false, false, true, false]);

      await sendMessage({
        type: 'route:currentRoute',
        name: 'post.new',
        url: 'post/new',
      });

      routeNodes = findAll('.js-route-tree-item .js-route-name');
      isCurrent = [...routeNodes].map((item) =>
        item.classList.contains('pill'),
      );
      assert.deepEqual(
        isCurrent,
        [true, true, false, true, false, false],
        'Current route is bound',
      );
    });

    test('It should filter the tree using the search text', async function (assert) {
      await visit('route-tree');

      let routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 6);

      await fillIn('[data-test-filter-views] input', 'edit');

      routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 1);

      await click('[data-test-search-field-clear-button]');

      routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 6);
    });

    test('Hiding non current route', async function (assert) {
      await visit('route-tree');

      let routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 6);

      let checkbox = find('.js-filter-hide-routes input');
      checkbox.checked = true;
      await triggerEvent(checkbox, 'change');

      routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 3);
    });

    test('Hiding substates', async function (assert) {
      await visit('route-tree');

      let routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 6);

      let checkbox = find('.js-filter-hide-substates input');
      checkbox.checked = true;
      await triggerEvent(checkbox, 'change');

      routeNodes = findAll('.js-route-tree-item');
      assert.strictEqual(routeNodes.length, 5);
    });
  });

  test('Displaying route w/ reset namespace set to true', async function (assert) {
    respondWith('route:getCurrentRoute', {
      type: 'route:currentRoute',
      name: 'post.edit.comments',
      url: 'post/edit/comments',
    });

    await visit('route-tree');

    let routeNodes = findAll('.js-route-tree-item');
    assert.strictEqual(routeNodes.length, 6);

    const checkbox = find('.js-filter-hide-routes input');
    checkbox.checked = true;
    await triggerEvent(checkbox, 'change');

    routeNodes = findAll('.js-route-tree-item');
    assert.strictEqual(routeNodes.length, 4);
  });
});
