/* jshint ignore:start */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
let App;
const { run } = Ember;

let port;

module('Route Tree Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
  },
  afterEach() {
    run(App, App.destroy);
  }
});

function routeValue(name, props) {
  let value = {
    name: name,
    controller: {
      name: name,
      className: name.replace(/\./g, '_').classify() + 'Controller',
      exists: true
    },
    routeHandler: {
      name: name,
      className: name.replace(/\./g, '_').classify() + 'Route'
    },
    template: {
      name: name.replace(/\./g, '/')
    }
  };
  props = props || {};
  return Ember.$.extend(true, {}, value, props);
}

let routeTree = {
  value: routeValue('application'),
  children: [{
    value: routeValue('post', { controller: { exists: false } }),
    children: [{
      value: routeValue('post.new', { url: 'post/new' }),
      children: []
    }, {
      value: routeValue('post.edit', { url: 'post/edit' }),
      children: []
    }]
  }]
};

test("Route tree is successfully displayed", function(assert) {
  port.reopen({
    send: function(name/*, message*/) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      }
    }
  });

  visit('route-tree');

  andThen(function() {

    let routeNodes = find('.js-route-node');
    assert.equal(routeNodes.length, 4);

    let routeNames = find('.js-route-name').get().map(function(item) {
      return Ember.$(item).text().trim();
    });
    assert.deepEqual(routeNames, ['application', 'post', 'post.new', 'post.edit']);

    let routeHandlers = find('.js-route-handler').get().map(function(item) {
      return Ember.$(item).text().trim();
    });
    assert.deepEqual(routeHandlers, ['ApplicationRoute', 'PostRoute', 'PostNewRoute', 'PostEditRoute']);

    let controllers = find('.js-route-controller').get().map(function(item) {
      return Ember.$(item).text().trim();
    });

    assert.deepEqual(controllers, ['ApplicationController', 'PostController', 'PostNewController', 'PostEditController']);

    let templates = find('.js-route-template').get().map(function(item) {
      return Ember.$(item).text().trim();
    });

    assert.deepEqual(templates, ['application', 'post', 'post/new', 'post/edit']);

    let titleTips = find('span[title]', routeNodes).map(function (i, node) {
      return node.getAttribute('title');
    }).toArray().sort();


    assert.deepEqual(titleTips, [
      "",
      "",
      "ApplicationController",
      "ApplicationRoute",
      "PostController",
      "PostEditController",
      "PostEditRoute",
      "PostNewController",
      "PostNewRoute",
      "PostRoute",
      "application",
      "application",
      "post",
      "post",
      "post.edit",
      "post.new",
      "post/edit",
      "post/edit",
      "post/new",
      "post/new"
    ], 'expected title tips');
  });
});

test("Clicking on route handlers and controller sends an inspection message", function(assert) {
  let name, message, applicationRow;

  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;

      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      }
    }
  });

  visit('route-tree')
  .then(function() {
    name = null;
    message = null;
    applicationRow = find('.js-route-node').first();
    return click('.js-route-handler', applicationRow);
  })
  .then(function() {
    assert.equal(name, 'objectInspector:inspectRoute');
    assert.equal(message.name, 'application');

    name = null;
    message = null;
    return click('.js-route-controller', applicationRow);
  })
  .then(function() {
    assert.equal(name, 'objectInspector:inspectController');
    assert.equal(message.name, 'application');

    name = null;
    message = null;
    let postRow = find('.js-route-node').eq(1);
    return click('.js-route-controller', postRow);
  }).then(function() {
    assert.equal(name, null, "If controller does not exist, clicking should have no effect.");
    assert.equal(message, null);
  });
});

test("Current Route is highlighted", function(assert) {
  port.reopen({
    send: function(name/*, message*/) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      } else if (name === 'route:getCurrentRoute') {
        this.trigger('route:currentRoute', { name: 'post.edit' });
      }
    }
  });


  let routeNodes;

  visit('route-tree')
  .then(function() {
    routeNodes = find('.js-route-node');
    let isCurrent = routeNodes.get().map(function(item) {
      return Ember.$(item).hasClass('row_highlight');
    });
    assert.deepEqual(isCurrent, [true, true, false, true]);

    port.trigger('route:currentRoute', { name: 'post.new' });
    return wait();
  })
  .then(function() {
    routeNodes = find('.js-route-node');
    let isCurrent = routeNodes.get().map(function(item) {
      return Ember.$(item).hasClass('row_highlight');
    });
    assert.deepEqual(isCurrent, [true, true, true, false], 'Current route is bound');
  });
});

test("Hiding non current route", function(assert) {
  port.reopen({
    send: function(name/*, message*/) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      } else if (name === 'route:getCurrentRoute') {
        this.trigger('route:currentRoute', { name: 'post.edit' });
      }
    }
  });

  visit('route-tree');
  andThen( function() {
    let routeNodes = find('.js-route-node');
    assert.equal(routeNodes.length, 4);
  });
  andThen( function() {
    let checkbox = find('.js-filter-hide-routes').find('input');
    checkbox.prop('checked', true);
    checkbox.trigger('change');
    return wait();
  });
  andThen( function() {
    let routeNodes = find('.js-route-node');
    assert.equal(routeNodes.length, 3);
  });
});
