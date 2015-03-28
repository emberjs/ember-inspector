/* jshint ignore:start */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
var App;
var run = Ember.run;

var port;

module('Route Tree Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
  },
  afterEach() {
    Ember.run(App, App.destroy);
  }
});

function routeValue(name, props) {
  var value = {
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

var routeTree = {
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
    send: function(name, message) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      }
    }
  });

  visit('route-tree');

  andThen(function() {

    var routeNodes = findByLabel('route-node');
    assert.equal(routeNodes.length, 4);

    var routeNames = findByLabel('route-name').get().map(function(item) {
      return Ember.$(item).text().trim();
    });
    assert.deepEqual(routeNames, ['application', 'post', 'post.new', 'post.edit']);

    var routeHandlers = findByLabel('route-handler').get().map(function(item) {
      return Ember.$(item).text().trim();
    });
    assert.deepEqual(routeHandlers, ['ApplicationRoute', 'PostRoute', 'PostNewRoute', 'PostEditRoute']);

    var controllers = findByLabel('route-controller').get().map(function(item) {
      return Ember.$(item).text().trim();
    });

    assert.deepEqual(controllers, ['ApplicationController', 'PostController', 'PostNewController', 'PostEditController']);

    var templates = findByLabel('route-template').get().map(function(item) {
      return Ember.$(item).text().trim();
    });

    assert.deepEqual(templates, ['application', 'post', 'post/new', 'post/edit']);

    var titleTips = find('span[title]', routeNodes).map(function (i, node) {
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
  var name, message, applicationRow;

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
    applicationRow = findByLabel('route-node').first();
    return clickByLabel('route-handler', applicationRow);
  })
  .then(function() {
    assert.equal(name, 'objectInspector:inspectRoute');
    assert.equal(message.name, 'application');

    name = null;
    message = null;
    return clickByLabel('route-controller', applicationRow);
  })
  .then(function() {
    assert.equal(name, 'objectInspector:inspectController');
    assert.equal(message.name, 'application');

    name = null;
    message = null;
    var postRow = findByLabel('route-node').eq(1);
    return clickByLabel('route-controller', postRow);
  }).then(function() {
    assert.equal(name, null, "If controller does not exist, clicking should have no effect.");
    assert.equal(message, null);
  });
});

test("Current Route is highlighted", function(assert) {
  port.reopen({
    send: function(name, message) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      } else if (name === 'route:getCurrentRoute') {
        this.trigger('route:currentRoute', { name: 'post.edit' });
      }
    }
  });


  var routeNodes;

  visit('route-tree')
  .then(function() {
    routeNodes = findByLabel('route-node');
    var isCurrent = routeNodes.get().map(function(item) {
      return Ember.$(item).hasClass('row_highlight');
    });
    assert.deepEqual(isCurrent, [true, true, false, true]);

    port.trigger('route:currentRoute', { name: 'post.new' });
    return wait();
  })
  .then(function() {
    routeNodes = findByLabel('route-node');
    var isCurrent = routeNodes.get().map(function(item) {
      return Ember.$(item).hasClass('row_highlight');
    });
    assert.deepEqual(isCurrent, [true, true, true, false], 'Current route is bound');
  });
});

test("Hiding non current route", function(assert) {
  port.reopen({
    send: function(name, message) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      } else if (name === 'route:getCurrentRoute') {
        this.trigger('route:currentRoute', { name: 'post.edit' });
      }
    }
  });

  visit('route-tree');
  andThen( function() {
    var routeNodes = findByLabel('route-node');
    assert.equal(routeNodes.length, 4);
  });
  andThen( function() {
    var checkbox = findByLabel('filter-hide-routes').find('input');
    checkbox.prop('checked', true);
    checkbox.trigger('change');
    return wait();
  });
  andThen( function() {
    var routeNodes = findByLabel('route-node');
    assert.equal(routeNodes.length, 3);
  });
});
