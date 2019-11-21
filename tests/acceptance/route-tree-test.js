import {
  click,
  fillIn,
  find,
  findAll,
  settled,
  triggerEvent,
  visit
} from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function deepAssign(target, ...sources) {
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

let port;

module('Route Tree Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('service:port');
  });

  hooks.afterEach(async () => {
    const checkbox = find('.js-filter-hide-routes input');

    checkbox.checked = false;
    await triggerEvent(checkbox, 'change');

    port = null;
  });

  function routeValue(name, props) {
    let value = {
      name,
      controller: {
        name,
        className: `${name.replace(/\./g, '_').classify()}Controller`,
        exists: true
      },
      routeHandler: {
        name,
        className: `${name.replace(/\./g, '_').classify()}Route`
      },
      template: {
        name: name.replace(/\./g, '/')
      }
    };
    props = props || {};
    return deepAssign({}, value, props);
  }

  let routeTree = {
    value: routeValue('application'),
    children: [{
      value: routeValue('post', { controller: { exists: false } }),
      children: [{
        value: routeValue('post.loading', { url: 'post/loading' }),
        children: []
      }, {
        value: routeValue('post.new', { url: 'post/new' }),
        children: []
      }, {
        value: routeValue('post.edit', { url: 'post/edit' }),
        children: [{
          value: routeValue('comments', { url: 'post/edit/comments' }),
          children: []
        }]
      }]
    }]
  };

  test("Route tree is successfully displayed", async function(assert) {
    port.reopen({
      send(name/*, message*/) {
        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        }
      }
    });

    await visit('route-tree');

    let routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 6, 'correct number of nodes');

    let routeNames = findAll('.js-route-name').map(function(item) {
      return item.textContent.trim();
    });
    assert.deepEqual(
      routeNames,
      ['application', 'post', 'post.loading', 'post.new', 'post.edit', 'comments'],
      'route name displayed'
    );

    let routeHandlers = findAll('.js-route-handler').map(function(item) {
      return item.getAttribute('title').trim();
    });
    assert.deepEqual(
      routeHandlers,
      ['ApplicationRoute', 'PostRoute', 'PostLoadingRoute', 'PostNewRoute', 'PostEditRoute', 'CommentsRoute'],
      'route class name in title attribute'
    );

    let controllers = findAll('.js-route-controller').map(function(item) {
      return item.getAttribute('title').trim();
    });

    // "PostController" not listed because a file for it was not created on the filesystem
    assert.deepEqual(
      controllers,
      ['ApplicationController', 'PostLoadingController', 'PostNewController', 'PostEditController', 'CommentsController'],
      'controller class name in title attribute'
    );
  });

  test("Clicking on route handlers and controller sends an inspection message", async function(assert) {
    let name, message, applicationRow;

    port.reopen({
      send(n, m) {
        name = n;
        message = m;

        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        }
      }
    });

    await visit('route-tree');
    name = null;
    message = null;
    applicationRow = find('.js-route-tree-item');
    await click(applicationRow.querySelector('.js-route-handler'));
    assert.equal(name, 'objectInspector:inspectRoute');
    assert.equal(message.name, 'application');

    name = null;
    message = null;
    await click(applicationRow.querySelector('.js-route-controller'));
    assert.equal(name, 'objectInspector:inspectController');
    assert.equal(message.name, 'application');
  });

  test("Current Route is highlighted", async function(assert) {
    port.reopen({
      send(name/*, message*/) {
        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        } else if (name === 'route:getCurrentRoute') {
          this.trigger('route:currentRoute', { name: 'post.edit' });
        }
      }
    });


    let routeNodes;

    await visit('route-tree');
    routeNodes = findAll('.js-route-tree-item .js-route-name');
    let isCurrent = [...routeNodes].map(item => item.classList.contains('pill'));
    assert.deepEqual(isCurrent, [true, true, false, false, true, false]);

    run(() => port.trigger('route:currentRoute', { name: 'post.new' }));
    await settled();
    routeNodes = findAll('.js-route-tree-item .js-route-name');
    isCurrent = [...routeNodes].map(item => item.classList.contains('pill'));
    assert.deepEqual(isCurrent, [true, true, false, true, false, false], 'Current route is bound');
  });

  test("It should filter the tree using the search text", async function(assert) {
    port.reopen({
      send(name/*, message*/) {
        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        } else if (name === 'route:getCurrentRoute') {
          this.trigger('route:currentRoute', { name: 'post.edit' });
        }
      }
    });

    await visit('route-tree');
    let routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 6);

    await fillIn('.js-filter-views input', 'edit');
    routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 1);

    await click('.js-search-field-clear-button');
    routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 6);
  });

  test("Hiding non current route", async function(assert) {
    port.reopen({
      send(name/*, message*/) {
        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        } else if (name === 'route:getCurrentRoute') {
          this.trigger('route:currentRoute', { name: 'post.edit' });
        }
      }
    });

    await visit('route-tree');
    let routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 6);
    let checkbox = find('.js-filter-hide-routes input');
    checkbox.checked = true;
    await triggerEvent(checkbox, 'change');
    routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 3);
  });

  test('Displaying route w/ reset namespace set to true', async function(assert) {
    port.reopen({
      send(name/*, message*/) {
        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        } else if (name === 'route:getCurrentRoute') {
          this.trigger('route:currentRoute', { name: 'post.edit.comments', url: 'post/edit/comments' });
        }
      }
    });

    await visit('route-tree');
    let routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 6);
    const checkbox = find('.js-filter-hide-routes input');
    checkbox.checked = true;
    await triggerEvent(checkbox, 'change');
    routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 4);
  });

  test("Hiding substates", async function(assert) {
    port.reopen({
      send(name/*, message*/) {
        if (name === 'route:getTree') {
          this.trigger('route:routeTree', { tree: routeTree });
        }
      }
    });

    await visit('route-tree');
    let routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 6);
    let checkbox = find('.js-filter-hide-substates input');
    checkbox.checked = true;
    await triggerEvent(checkbox, 'change');
    routeNodes = findAll('.js-route-tree-item');
    assert.equal(routeNodes.length, 5);
  });
});
