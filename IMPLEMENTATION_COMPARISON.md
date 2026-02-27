# Implementation Comparison: Old vs New API

This document demonstrates the practical benefits of the proposed Ember Inspector API by comparing actual implementations.

## Overview

The new API eliminates direct access to Ember internals and replaces complex logic with simple, high-level function calls.

**Note**: The implementations in `ember_debug/container-debug.js` and `ember_debug/route-debug.js` have been refactored to use the new API pattern. The API stub is in `ember_debug/utils/ember-inspector-api.js`.

## 1. Container Debug - Container Instance Retrieval

### Before: Direct Cache Access (30+ lines)

```javascript
// OLD implementation

get container() {
  return this.namespace?.owner?.__container__;
}

instancesByType() {
  let key;
  let instancesByType = {};
  let cache = this.container.cache;
  
  // Detect if InheritingDict (from Ember < 1.8)
  if (
    typeof cache.dict !== 'undefined' &&
    typeof cache.eachLocal !== 'undefined'
  ) {
    cache = cache.dict;
  }
  
  for (key in cache) {
    const type = this.typeFromKey(key);
    
    // Filter out private types and excluded types
    if (this.shouldHide(type)) {
      continue;
    }
    
    if (instancesByType[type] === undefined) {
      instancesByType[type] = [];
    }
    
    instancesByType[type].push({
      fullName: key,
      instance: cache[key],
    });
  }
  
  return instancesByType;
}

shouldHide(type) {
  return type[0] === '-' || this.TYPES_TO_SKIP.indexOf(type) !== -1;
}
```

**Issues:**
- ❌ Direct access to private `__container__` property
- ❌ Version-specific logic (InheritingDict detection)
- ❌ Manual iteration and filtering
- ❌ Complex type extraction and grouping
- ❌ 30+ lines of boilerplate code

### After: High-Level API (1 line)

```javascript
// NEW implementation in ember_debug/container-debug.js

get owner() {
  return this.namespace?.owner;
}

instancesByType() {
  // Single API call replaces all the complex logic
  return emberInspectorAPI.owner.getContainerInstances(this.owner, {
    excludeTypes: this.TYPES_TO_SKIP,
    includePrivate: false,
  });
}
```

**Benefits:**
- ✅ No access to private APIs
- ✅ No version-specific code
- ✅ Declarative filtering options
- ✅ 1 line instead of 30+
- ✅ **97% code reduction**

---

## 2. Route Debug - Route Tree Building

### Before: Complex Internal Access (150+ lines)

```javascript
// OLD implementation

get routeTree() {
  if (!this._cachedRouteTree && this.router) {
    const router = this.router;
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
    
    this._cachedRouteTree = arrayizeChildren({ children: routeTree });
  }
  return this._cachedRouteTree;
}

function buildSubTree(routeTree, route) {
  let handlers = route.handlers;
  let owner = this.namespace.owner;
  let subTree = routeTree;
  let item;
  let routeClassName;
  let routeHandler;
  let controllerName;
  let controllerClassName;
  let templateName;
  let controllerFactory;

  for (let i = 0; i < handlers.length; i++) {
    item = handlers[i];
    let handler = item.handler;
    
    // Check if route is defined
    if (handler.match(/(loading|error)$/)) {
      if (!routeHasBeenDefined(owner, handler)) {
        continue;
      }
    }

    if (subTree[handler] === undefined) {
      routeClassName = this.getClassName(handler, 'route');

      const router = this.router;
      const routerLib = router._routerMicrolib || router.router;
      
      // Version-specific handler retrieval
      if (compareVersion(VERSION, '3.9.0') !== -1) {
        // Ember >= 3.9.0
        routeHandler = routerLib.getRoute(handler);
      } else {
        // Ember < 3.9.0
        routeHandler = routerLib.getHandler(handler);
      }

      // Handle unresolved promises
      if (typeof routeHandler?.then === 'function') {
        routeHandler.then(() => (this._cachedRouteTree = null));
        controllerName = '(unresolved)';
        controllerClassName = '(unresolved)';
        templateName = '(unresolved)';
      } else {
        const get = routeHandler.get || function (prop) {
          return this[prop];
        };
        
        // Get controller name from route handler
        controllerName = get.call(routeHandler, 'controllerName') || 
                        routeHandler.routeName;
        
        // Version-specific factory lookup
        controllerFactory = owner.factoryFor
          ? owner.factoryFor(`controller:${controllerName}`)
          : owner._lookupFactory(`controller:${controllerName}`);
          
        controllerClassName = this.getClassName(controllerName, 'controller');
        templateName = this.getClassName(handler, 'template');
      }

      subTree[handler] = {
        value: {
          name: handler,
          routeHandler: {
            className: routeClassName,
            name: handler,
          },
          controller: {
            className: controllerClassName,
            name: controllerName,
            exists: !!controllerFactory,
          },
          template: {
            name: templateName,
          },
        },
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
      let { type, value } = segments[i];
      if (type === 1) {
        name = `:${value}`;
      } else if (type === 2) {
        name = `*${value}`;
      } else {
        name = value;
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
  return (
    owner.hasRegistration(`template:${name}`) ||
    owner.hasRegistration(`route:${name}`)
  );
}
```

**Issues:**
- ❌ Direct access to `router._routerMicrolib` and `recognizer.names`
- ❌ Version-specific logic (`getRoute` vs `getHandler`)
- ❌ Manual controller name resolution
- ❌ Version-specific factory lookups
- ❌ Manual URL segment parsing
- ❌ Complex promise handling
- ❌ Manual tree structure building
- ❌ 150+ lines of complex, fragile code

### After: High-Level API (3 lines)

```javascript
// NEW implementation in ember_debug/route-debug.js

get routeTree() {
  if (!this._cachedRouteTree && this.router) {
    // Single API call replaces 150+ lines of complex logic
    this._cachedRouteTree = emberInspectorAPI.router.buildRouteTree(this.owner);
  }
  return this._cachedRouteTree;
}
```

**Benefits:**
- ✅ No access to router internals
- ✅ No version-specific code
- ✅ No manual tree building
- ✅ No manual controller resolution
- ✅ No manual URL parsing
- ✅ Promise handling built-in
- ✅ 3 lines instead of 150+
- ✅ **98% code reduction**

---

## 3. Object Inspector - Owner Lookup

### Before: Direct Container Access

```javascript
// OLD implementation

sendControllerToConsole(message) {
  const container = this.namespace?.owner;
  this.sendValueToConsole(container.lookup(`controller:${message.name}`));
}

inspectController(message) {
  const container = this.namespace?.owner;
  this.sendObject(container.lookup(`controller:${message.name}`));
}

inspectByContainerLookup(message) {
  const container = this.namespace?.owner;
  this.sendObject(container.lookup(message.name));
}
```

**Issues:**
- ❌ Direct `owner.lookup()` calls throughout codebase
- ❌ No abstraction layer
- ❌ Tightly coupled to owner implementation

### After: API Wrapper

```javascript
// NEW pattern (to be applied)

sendControllerToConsole(message) {
  const instance = emberInspectorAPI.owner.lookup(
    this.owner, 
    `controller:${message.name}`
  );
  this.sendValueToConsole(instance);
}

inspectController(message) {
  const instance = emberInspectorAPI.owner.lookup(
    this.owner,
    `controller:${message.name}`
  );
  this.sendObject(instance);
}

inspectByContainerLookup(message) {
  const instance = emberInspectorAPI.owner.lookup(
    this.owner,
    message.name
  );
  this.sendObject(instance);
}
```

**Benefits:**
- ✅ Abstraction layer for future changes
- ✅ Consistent API usage
- ✅ Easier to mock for testing
- ✅ Can add validation/error handling in one place

---

## Summary of Improvements

### Code Reduction

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Container Debug | 30+ lines | 1 line | 97% |
| Route Debug | 150+ lines | 3 lines | 98% |
| Overall | 180+ lines | 4 lines | 98% |

### Maintenance Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Private API Access** | Direct access to `__container__`, `_routerMicrolib`, `recognizer` | None - all through public API |
| **Version Handling** | Manual checks and conditionals throughout | Handled internally by Ember |
| **Complexity** | High - complex algorithms and edge cases | Low - simple API calls |
| **Brittleness** | High - breaks when internals change | Low - stable public API |
| **Testability** | Difficult - requires mocking internals | Easy - mock API interface |
| **Readability** | Low - hard to understand intent | High - clear and declarative |

### API Design Principles

The new API follows these principles:

1. **High-Level Operations**: Provide complete operations, not low-level primitives
2. **Encapsulation**: Hide implementation details and version differences
3. **Declarative**: Express intent, not implementation
4. **Stable**: Public API contract that won't break
5. **Simple**: Reduce cognitive load and code complexity

### Migration Path

1. **Phase 1**: Ember implements new API in `loadCompatInspector()`
2. **Phase 2**: Inspector adds new implementations alongside old ones
3. **Phase 3**: Inspector switches to new implementations with feature detection
4. **Phase 4**: Old implementations removed after deprecation period

### Real-World Impact

For the Ember Inspector codebase:
- **~200 lines of complex code eliminated**
- **No more version-specific conditionals**
- **No more direct access to private APIs**
- **Significantly easier to maintain**
- **More stable across Ember versions**
- **Better developer experience**

---

## Implementation Files

The refactored implementations can be found in:

1. **`ember_debug/container-debug.js`** - Refactored container debug using new API
2. **`ember_debug/route-debug.js`** - Refactored route debug using new API
3. **`ember_debug/utils/ember-inspector-api.js`** - API stub showing the interface that ember-source would implement

These files demonstrate how the inspector code would look using the proposed API from `EMBER_INSPECTOR_API_ANALYSIS.md`.