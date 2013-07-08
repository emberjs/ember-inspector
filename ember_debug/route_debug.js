import 'mixins/port_mixin' as PortMixin;

var classify = Ember.String.classify;

var RouteDebug = Ember.Object.extend(PortMixin, {
  namespace: null,
  port: Ember.computed.alias('namespace.port'),

  application: Ember.computed.alias('namespace.application'),

  router: Ember.computed(function() {
    return this.get('application.__container__').lookup('router:main');
  }).property('application'),

  portNamespace: 'route',
  messages: {
    getTree: function() {
      this.sendTree();
    },
    getRouteDetails: function(message) {
      this.sendRouteDetails(message.name);
    }
  },

  routeTree: Ember.computed(function() {
    var routeNames = this.get('router.router.recognizer.names');
    var routeTree = {};

    for(var routeName in routeNames) {
      if (!routeNames.hasOwnProperty(routeName)) {
        continue;
      }
      var route = routeNames[routeName];
      var handlers = Ember.A(route.handlers);
      buildSubTree(routeTree, route);
    }

    return arrayizeChildren({  children: routeTree }).children[0];
  }).property('router'),

  sendTree: function() {
    var routeTree = this.get('routeTree');
    this.sendMessage('routeTree', { tree: routeTree });
  },

  sendRouteDetails: function(name) {
    var routeClassName = classify(name.replace('.', '_')) + 'Route';
    var container = this.get('application.__container__');
    var routeHandler = container.lookup('router:main').router.getHandler(name);
    var controllerName = routeHandler.controllerName || routeHandler.routeName;
    var controllerClassName = classify(controllerName.replace('.', '_')) + 'Controller';
    var controller = container.lookup('controller:' + controllerName);
    var templateName = name.replace('.', '/');
    var message = {
      routeHandler: { className: routeClassName, name: name },
      controller: { className: controllerClassName, name: controllerName, exists: controller ? true: false },
      template: { name: templateName }
    };
    this.sendMessage('routeDetails', message);
  }
});


function buildSubTree(routeTree, route) {
  var handlers = route.handlers;
  var subTree = routeTree, item;
  for (var i = 0; i < handlers.length; i++) {
    item = handlers[i];
    var handler = item.handler;
    if (subTree[handler] === undefined) {
      subTree[handler] = {
        value: {
          name: handler
        }
      };
      if (i === handlers.length - 1) {
        // it is a route, get url
        subTree[handler].value.url = getURL(route.segments);
        subTree[handler].value.type = 'route';
      } else {
        // it is a resource, set children object
        subTree[handler].children = {};
        subTree[handler].value.type = 'resource';
      }
    }
    subTree = subTree[handler].children;
  }
}

function arrayizeChildren(routeTree) {
  var obj = { value: routeTree.value };

  if (routeTree.children) {
    var childrenArray = [];
    for(var i in routeTree.children) {
      var route = routeTree.children[i];
      childrenArray.push(arrayizeChildren(route));
    }
    obj.children = childrenArray;
  }

  return obj;
}

function getURL(segments) {
  var url = [];
  for (var i = 0; i < segments.length; i++) {
    var name = null;

    try {
      name = segments[i].generate();
    } catch (e) {
      // is dynamic
      name = ':' + segments[i].name;
    }
    if (name) {
      url.push(name);
    }
  }

  url = '/' + url.join('/');

  return url;
}

export = RouteDebug;
