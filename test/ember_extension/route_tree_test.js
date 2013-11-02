var port;

module("Route Tree", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');
  }
});

function routeValue(name, props) {
  var value = {
    name: name,
    controller: {
      name: name,
      className: name.replace('.', '_').classify() + 'Controller',
      exists: true
    },
    routeHandler: {
      name: name,
      className: name.replace('.', '_').classify() + 'Route'
    },
    template: {
      name: name.replace('.', '/')
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

test("Route tree is successfully displayed", function() {
  port.reopen({
    send: function(name, message) {
      if (name === 'route:getTree') {
        this.trigger('route:routeTree', { tree: routeTree });
      }
    }
  });

  visit('route_tree')
  .then(function() {

    var routeNodes = findByLabel('route-node');
    equal(routeNodes.length, 4);

    var routeNames = findByLabel('route-name').get().map(function(item) {
      return Ember.$(item).text().trim();
    });
    deepEqual(routeNames, ['application', 'post', 'post.new', 'post.edit']);

    var routeHandlers = findByLabel('route-handler').get().map(function(item) {
      return Ember.$(item).text().trim();
    });
    deepEqual(routeHandlers, ['ApplicationRoute', 'PostRoute', 'PostNewRoute', 'PostEditRoute']);

    var controllers = findByLabel('route-controller').get().map(function(item) {
      return Ember.$(item).text().trim();
    });

    deepEqual(controllers, ['ApplicationController', 'PostController', 'PostNewController', 'PostEditController']);

    var templates = findByLabel('route-template').get().map(function(item) {
      return Ember.$(item).text().trim();
    });

    deepEqual(templates, ['application', 'post', 'post/new', 'post/edit']);
  });

});

test("Clicking on route handlers and controller sends an inspection message", function() {
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

  visit('route_tree')
  .then(function() {
    name = null;
    message = null;
    applicationRow = findByLabel('route-node').first();
    return clickByLabel('route-handler', applicationRow);
   })
  .then(function() {
    equal(name, 'objectInspector:inspectRoute');
    equal(message.name, 'application');

    name = null;
    message = null;
    return clickByLabel('route-controller', applicationRow);
  })
  .then(function() {
    equal(name, 'objectInspector:inspectController');
    equal(message.name, 'application');

    name = null;
    message = null;
    var postRow = findByLabel('route-node').eq(1);
    return clickByLabel('route-controller', postRow);
  }).then(function() {
    equal(name, null, "If controller does not exist, clicking should have no effect.");
    equal(message, null);
  });
});

test("Current Route is highlighted", function() {
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

  visit('route_tree')
  .then(function() {
    routeNodes = findByLabel('route-node');
    var isCurrent = routeNodes.get().map(function(item) {
      return Ember.$(item).hasClass('is-current');
    });
    deepEqual(isCurrent, [true, true, false, true]);

    port.trigger('route:currentRoute', { name: 'post.new' });
    return wait();
  })
  .then(function() {
    routeNodes = findByLabel('route-node');
    var isCurrent = routeNodes.get().map(function(item) {
      return Ember.$(item).hasClass('is-current');
    });
    deepEqual(isCurrent, [true, true, true, false]);
  });
});
