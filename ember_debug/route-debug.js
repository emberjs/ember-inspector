import PortMixin from 'ember-debug/mixins/port-mixin';

const Ember = window.Ember;
const { String: { classify, dasherize }, computed, observer, run: { later }, Object: EmberObject } = Ember;
const { oneWay, readOnly } = computed;

const { hasOwnProperty } = Object.prototype;

export default EmberObject.extend(PortMixin, {
  namespace: null,
  port: oneWay('namespace.port').readOnly(),

  router: computed('namespace.owner', function() {
    return this.get('namespace.owner').lookup('router:main');
  }),

  applicationController: computed('namespace.owner', function() {
    const container = this.get('namespace.owner');
    return container.lookup('controller:application');
  }),

  currentPath: oneWay('applicationController.currentPath').readOnly(),
  currentURL: oneWay('namespace.owner.router.currentURL').readOnly(),

  portNamespace: 'route',

  emberCliConfig: readOnly('namespace.generalDebug.emberCliConfig'),

  messages: {
    getTree() {
      this.sendTree();
    },
    getCurrentRoute() {
      this.sendCurrentRoute();
    }
  },

  sendCurrentRoute: observer('currentURL', function() {
    const {
      currentPath: name,
      currentURL: url,
    } = this.getProperties(
      'currentPath',
      'currentURL',
    );

    later(() => {
      this.sendMessage('currentRoute', { name, url });
    }, 50);
  }),

  routeTree: computed('router', function() {
    const router = this.get('router');
    const routerLib = router._routerMicrolib || router.router;
    let routeNames = routerLib.recognizer.names;
    let routeTree = {};
    for (let routeName in routeNames) {
      if (!hasOwnProperty.call(routeNames, routeName)) {
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
    let container = this.get('namespace.owner');
    let resolver = container.application.__registry__.resolver;
    let prefix = this.get('emberCliConfig.modulePrefix');
    let podPrefix = this.get('emberCliConfig.podModulePrefix');
    let usePodsByDefault = this.get('emberCliConfig.usePodsByDefault');
    let className;
    if (prefix || podPrefix) {
      // Uses modules
      name = dasherize(name);
      let fullName = `${type}:${name}`;
      if (resolver.lookupDescription) {
        className = resolver.lookupDescription(fullName);
      } else if (resolver.describe) {
        className = resolver.describe(fullName);
      }
      if (className === fullName) {
        // full name returned as is - this resolver does not look for the module.
        className = className.replace(new RegExp(`^${type}\:`), '');
      } else if (className) {
        // Module exists and found
        className = className.replace(new RegExp(`^/?(${prefix}|${podPrefix})/${type}s/`), '');
      } else {
        // Module does not exist
        if (usePodsByDefault) {
          // we don't include the prefix since it's redundant
          // and not part of the file path.
          // (podPrefix - prefix) is part of the file path.
          let currentPrefix = '';
          if (podPrefix) {
            currentPrefix = podPrefix.replace(new RegExp(`^/?${prefix}/?`), '');
          }
          className = `${currentPrefix}/${name}/${type}`;
        } else {
          className = name.replace(/\./g, '/');
        }
      }
      className = className.replace(/\./g, '/');
    } else {
      // No modules
      if (type !== 'template') {
        className = classify(`${name.replace(/\./g, '_')}_${type}`);
      } else {
        className = name.replace(/\./g, '/');
      }
    }
    return className;
  }

});

function buildSubTree(routeTree, route) {
  let handlers = route.handlers;
  let owner = this.get('namespace.owner');
  let subTree = routeTree;
  let item, routeClassName, routeHandler, controllerName,
      controllerClassName, templateName, controllerFactory;

  for (let i = 0; i < handlers.length; i++) {
    item = handlers[i];
    let handler = item.handler;
    if (handler.match(/(loading|error)$/)) {
      // make sure it has been defined before calling `getHandler` because
      // we don't want to generate sub routes as this has side-effects.
      if (!routeHasBeenDefined(owner, handler)) {
        continue;
      }
    }

    if (subTree[handler] === undefined) {
      routeClassName = this.getClassName(handler, 'route');

      const router = this.get('router');
      const routerLib = router._routerMicrolib || router.router;
      routeHandler = routerLib.getHandler(handler);
      controllerName = routeHandler.get('controllerName') || routeHandler.get('routeName');
      controllerFactory = owner.factoryFor ? owner.factoryFor(`controller:${controllerName}`) : owner._lookupFactory(`controller:${controllerName}`);
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
            exists: !!controllerFactory
          },
          template: {
            name: templateName
          }
        }
      };

      if (i === handlers.length - 1) {
        // it is a route, get url
        subTree[handler].value.url = getURL(owner, route.segments);
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

    if (typeof segments[i].generate !== 'function') {
      // After changes in RouteRecognizer in >= 2.12
      let { type, value } = segments[i];
      if (type === 1) { // dynamic
        name = `:${value}`;
      } else if (type === 2) { // star
        name = `*${value}`;
      } else {
        name = value;
      }
    } else {
      // 2.11 and before
      try {
        name = segments[i].generate();
      } catch (e) { // is dynamic
        name = `:${segments[i].name}`;
      }
    }
    if (name) {
      url.push(name);
    }
  }

  url = url.join('/');

  if (url.match(/_unused_dummy_/)) {
    url = '';
  } else {
    url = `/${url}`;
    url = locationImplementation.formatURL(url);
  }

  return url;
}


function routeHasBeenDefined(owner, name) {
  return owner.hasRegistration(`template:${name}`) || owner.hasRegistration(`route:${name}`);
}
