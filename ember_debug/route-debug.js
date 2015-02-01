import PortMixin from 'ember-debug/mixins/port-mixin';

var Ember = window.Ember;
var classify = Ember.String.classify;
var dasherize = Ember.String.dasherize;
var computed = Ember.computed;
var readOnly = computed.readOnly;
var observer = Ember.observer;
var later = Ember.run.later;

export default Ember.Object.extend(PortMixin, {
  namespace: null,
  port: readOnly('namespace.port'),

  application: readOnly('namespace.application'),

  router: computed(function() {
    return this.get('application.__container__').lookup('router:main');
  }).property('application'),

  applicationController: computed(function() {
    var container = this.get('application.__container__');
    return container.lookup('controller:application');
  }).property('application'),

  currentPath: readOnly('applicationController.currentPath'),

  portNamespace: 'route',

  emberCliConfig: readOnly('namespace.generalDebug.emberCliConfig'),

  messages: {
    getTree: function() {
      this.sendTree();
    },
    getCurrentRoute: function() {
      this.sendCurrentRoute();
    }
  },

  sendCurrentRoute: observer(function() {
    var self = this;
    later(function() {
      self.sendMessage('currentRoute', { name: self.get('currentPath') });
    }, 50);
  }, 'currentPath'),

  routeTree: computed(function() {
    var routeNames = this.get('router.router.recognizer.names');
    var routeTree = {};

    for(var routeName in routeNames) {
      if (!routeNames.hasOwnProperty(routeName)) {
        continue;
      }
      var route = routeNames[routeName];
      buildSubTree.call(this, routeTree, route);
    }
    return arrayizeChildren({  children: routeTree }).children[0];
  }).property('router'),

  sendTree: function() {
    var routeTree = this.get('routeTree');
    this.sendMessage('routeTree', { tree: routeTree });
  },

  getClassName: function(name, type) {
    var container = this.get('application.__container__');
    var resolver = container.resolver;
    var prefix = this.get('emberCliConfig.modulePrefix');
    var podPrefix = this.get('emberCliConfig.podModulePrefix');
    var usePodsByDefault = this.get('emberCliConfig.usePodsByDefault');
    var className;
    if (prefix || podPrefix) {
      // Uses modules
      name = dasherize(name);
      className = resolver.describe(type + ':' + name);
      if (className) {
        // Module exists and found
        className = className.replace(new RegExp('^/?(' + prefix +'|' + podPrefix + ')/' + type + 's/'), '');
      } else {
        // Module does not exist
        if (usePodsByDefault) {
          // we don't include the prefix since it's redundant
          // and not part of the file path.
          // (podPrefix - prefix) is part of the file path.
          var currentPrefix = '';
          if (podPrefix) {
            currentPrefix = podPrefix.replace(new RegExp('^/?' + prefix + '/?'), '');
          }
          className = currentPrefix + '/' + name  + '/' + type;
        } else {
          className = name.replace(/\./g, '/');
        }
      }
      className = className.replace(/\./g, '/');
    } else {
      // No modules
      if (type !== 'template') {
        className = classify(name.replace(/\./g, '_') + '_' + type);
      } else {
        className = name.replace(/\./g, '/');
      }
    }
    return className;
  }

});

var buildSubTree = function(routeTree, route) {
  var handlers = route.handlers;
  var container = this.get('application.__container__');
  var subTree = routeTree, item,
      routeClassName, routeHandler, controllerName,
      controllerClassName, templateName,
      controllerFactory;
  for (var i = 0; i < handlers.length; i++) {
    item = handlers[i];
    var handler = item.handler;
    if (subTree[handler] === undefined) {
      routeClassName = this.getClassName(handler, 'route');

      routeHandler = container.lookup('router:main').router.getHandler(handler);
      controllerName = routeHandler.get('controllerName') || routeHandler.get('routeName');
      controllerFactory = container.lookupFactory('controller:' + controllerName);
      controllerClassName = this.getClassName(controllerName, 'controller');
      templateName = this.getClassName(handler, 'template');

      subTree[handler] = {
        value: {
          name: handler,
          routeHandler: {
            className: routeClassName,
            name: handler
          },
          controller: {
            className: controllerClassName,
            name: controllerName,
            exists: controllerFactory ? true : false
          },
          template: {
            name: templateName
          }
        }
      };

      if (i === handlers.length - 1) {
        // it is a route, get url
        subTree[handler].value.url = getURL(container, route.segments);
        subTree[handler].value.type = 'route';
      } else {
        // it is a resource, set children object
        subTree[handler].children = {};
        subTree[handler].value.type = 'resource';
      }

    }
    subTree = subTree[handler].children;
  }
};

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

function getURL(container, segments) {
  var locationImplementation = container.lookup('router:main').location;
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

  url = url.join('/');

  if (url.match(/_unused_dummy_/)) {
    url = '';
  } else {
    url = '/' + url;
    url = locationImplementation.formatURL(url);
  }

  return url;
}
