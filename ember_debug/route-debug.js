import PortMixin from 'ember-debug/mixins/port-mixin';

const Ember = window.Ember;
const { String: { classify, dasherize }, computed, observer, run: { later }, Object: EmberObject } = Ember;
const { oneWay } = computed;

export default EmberObject.extend(PortMixin, {
  namespace: null,
  port: oneWay('namespace.port').readOnly(),

  application: oneWay('namespace.application').readOnly(),

  router: computed('application', function() {
    return this.get('application.__container__').lookup('router:main');
  }),

  applicationController: computed('application', function() {
    const container = this.get('application.__container__');
    return container.lookup('controller:application');
  }),

  currentPath: oneWay('applicationController.currentPath').readOnly(),

  portNamespace: 'route',

  emberCliConfig: oneWay('namespace.generalDebug.emberCliConfig').readOnly(),

  messages: {
    getTree() {
      this.sendTree();
    },
    getCurrentRoute() {
      this.sendCurrentRoute();
    }
  },

  sendCurrentRoute: observer('currentPath', function() {
    later(() => {
      this.sendMessage('currentRoute', { name: this.get('currentPath') });
    }, 50);
  }),

  routeTree: computed('router', function() {
    let routeNames = this.get('router.router.recognizer.names');
    let routeTree = {};

    for (let routeName in routeNames) {
      if (!routeNames.hasOwnProperty(routeName)) {
        continue;
      }
      let route = routeNames[routeName];
      buildSubTree.call(this, routeTree, route);
    }
    return arrayizeChildren({ children: routeTree });
  }),

  sendTree() {
    const routeTree = this.get('routeTree');
    this.sendMessage('routeTree', { tree: routeTree });
  },

  getClassName(name, type) {
    let container = this.get('application.__container__');
    let resolver = container.resolver;
    if (!resolver) {
      resolver = this.get('application.registry.resolver');
    }
    let prefix = this.get('emberCliConfig.modulePrefix');
    let podPrefix = this.get('emberCliConfig.podModulePrefix');
    let usePodsByDefault = this.get('emberCliConfig.usePodsByDefault');
    let className;
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
          let currentPrefix = '';
          if (podPrefix) {
            currentPrefix = podPrefix.replace(new RegExp('^/?' + prefix + '/?'), '');
          }
          className = currentPrefix + '/' + name + '/' + type;
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

const buildSubTree = function(routeTree, route) {
  let handlers = route.handlers;
  let container = this.get('application.__container__');
  let subTree = routeTree, item,
      routeClassName, routeHandler, controllerName,
      controllerClassName, templateName,
      controllerFactory;
  for (let i = 0; i < handlers.length; i++) {
    item = handlers[i];
    let handler = item.handler;
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
  let obj = {};
  // Top node doesn't have a value
  if (routeTree.value) {
    obj.value = routeTree.value;
  }

  if (routeTree.children) {
    let childrenArray = [];
    for (let i in routeTree.children) {
      let route = routeTree.children[i];
      childrenArray.push(arrayizeChildren(route));
    }
    obj.children = childrenArray;
  }

  return obj;
}

function getURL(container, segments) {
  const locationImplementation = container.lookup('router:main').location;
  let url = [];
  for (let i = 0; i < segments.length; i++) {
    let name = null;

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
