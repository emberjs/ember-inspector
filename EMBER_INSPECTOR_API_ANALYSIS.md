# Ember Inspector API Analysis

## Overview

This document analyzes the usage of Ember internal APIs in `ember_debug/utils/ember.js` and proposes a public API that `ember-source` should provide via `appLoader.loadCompatInspector()`.

## Current Implementation

Currently, the inspector accesses Ember internals through:
1. Direct module imports (e.g., `@ember/-internals/metal`)
2. Global `Ember` object
3. `globalThis.emberInspectorApps[0].loadCompatInspector()` (for Vite/Embroider)

## Functions and Objects Used

### 1. **captureRenderTree**
- **Source**: `@ember/debug` or `Ember._captureRenderTree`
- **Usage**: `ember_debug/libs/capture-render-tree.js`
- **Purpose**: Captures the current component render tree for the component inspector
- **End Goal**: Enable component tree visualization in the inspector

### 2. **getEnv**
- **Source**: `@ember/-internals/environment` or `Ember.ENV`
- **Usage**: 
  - `ember_debug/libs/capture-render-tree.js` - Check `_DEBUG_RENDER_TREE` flag
  - `ember_debug/adapters/web-extension.js` - Check `EXTEND_PROTOTYPES` configuration
- **Purpose**: Access Ember's environment configuration
- **End Goal**: Determine runtime configuration for proper inspector behavior

### 3. **inspect**
- **Source**: `@ember/debug` or `@ember/-internals/utils` or `Ember.inspect`
- **Usage**: `ember_debug/utils/type-check.js`, `ember_debug/object-inspector.js`
- **Purpose**: Convert any value to a human-readable string representation
- **End Goal**: Display property values in a readable format in the object inspector

### 4. **subscribe** (Instrumentation)
- **Source**: `@ember/instrumentation` or `Ember.Instrumentation.subscribe`
- **Usage**: `ember_debug/render-debug.js`
- **Purpose**: Subscribe to Ember's instrumentation events, specifically render events
- **End Goal**: Track render performance and component lifecycle for the render performance tab

### 5. **cacheFor**
- **Source**: `@ember/object/internals` or `Ember.cacheFor`
- **Usage**: `ember_debug/object-inspector.js`
- **Purpose**: Get the cached value of a computed property without triggering recomputation
- **End Goal**: Inspect computed property values efficiently without side effects

### 6. **guidFor**
- **Source**: `@ember/object/internals` or `Ember.guidFor`
- **Usage**: Multiple files including `object-inspector.js`, `deprecation-debug.js`, `lib/start-inspector.js`
- **Purpose**: Generate unique identifiers for objects
- **End Goal**: Track and reference objects uniquely across the inspector

### 7. **libraries**
- **Source**: `@ember/-internals/metal` or `Ember.libraries`
- **Usage**: `ember_debug/general-debug.js`
- **Purpose**: Access the registry of loaded Ember libraries and addons
- **End Goal**: Display loaded libraries in the Info tab

### 8. **getOwner**
- **Source**: `@ember/owner` or `@ember/application`
- **Usage**: `ember_debug/object-inspector.js`
- **Purpose**: Get the owner (dependency injection container) of an object
- **End Goal**: Enable container inspection and service/controller lookups

### 9. **meta**
- **Source**: `@ember/-internals/meta` or `Ember.meta`
- **Usage**: `ember_debug/object-inspector.js`
- **Purpose**: Access object metadata including descriptors, mixins, and debug references
- **End Goal**: Introspect object structure for the object inspector

### 10. **Debug.registerDeprecationHandler**
- **Source**: `@ember/debug`
- **Usage**: `ember_debug/deprecation-debug.js`
- **Purpose**: Register a custom handler for deprecation warnings
- **End Goal**: Capture and display deprecations in the deprecations tab

### 11. **Type Checking (Classes)**
- **Source**: Various Ember modules
- **Classes Used**: `Application`, `Namespace`, `Component`, `GlimmerComponent`, `Service`, `ObjectProxy`, `ArrayProxy`, `CoreObject`, `EmberObject`, `Observable`, `Evented`
- **Usage**: Type checking via `instanceof` in object inspector
- **End Goal**: Provide accurate type information and appropriate inspection behavior
- **Note**: Should be replaced with type checking functions

### 12. **Class/Mixin Name Resolution**
- **Source**: Various Ember modules (classes and mixins)
- **Current Implementation**: `ember_debug/utils/ember-object-names.js`
- **Classes/Mixins Mapped**:
  - `Evented`, `PromiseProxyMixin`, `MutableArray`, `MutableEnumerable`, `NativeArray`
  - `Observable`, `ControllerMixin`, `CoreObject`, `EmberObject`, `Component`
  - `ActionHandler`, `TargetActionSupport` (pre-3.27)
  - View-related: `ViewStateSupport`, `ViewMixin`, `ActionSupport`, `ClassNamesSupport`, `ChildViewsSupport`, `CoreView`
- **Usage Pattern**:
  ```javascript
  // In object-inspector.js
  let name = (
    mixin.ownerConstructor ||
    emberNames.get(mixin) ||
    ''
  ).toString();
  ```
- **Purpose**: Display human-readable names for Ember classes and mixins in the object inspector
- **End Goal**: Show "Evented Mixin" instead of "(unknown mixin)" without inspector maintaining its own class reference map
- **Note**: Inspector should not need to import or reference these classes; Ember should provide name resolution

### 13. **Glimmer Tracking APIs**
- **Source**: `@glimmer/validator`, `@glimmer/reference`, `@ember/-internals/metal`
- **Current Low-Level APIs Used**:
  - `tagValue` / `valueForTag` - Get tag revision number
  - `tagValidate` / `validateTag` - Check if tag is still valid
  - `track` - Track property access and return a tag
  - `tagForProperty` - Get the tag for a specific property
- **Actual Usage Pattern in Inspector**:
  ```javascript
  // 1. Initial setup: Get property's tag and store revision
  let tagInfo = {
    tag: tagForProperty(object, propertyName),
    revision: 0
  };
  
  // 2. Change detection: Check if property changed
  changed = !tagValidate(tagInfo.tag, tagInfo.revision);
  
  // 3. If changed, track dependencies and get new value
  if (changed) {
    tagInfo.tag = track(() => {
      value = object[propertyName];
    });
    // Extract dependency info from tag structure
    dependentKeys = getTrackedDependencies(object, propertyName, tagInfo);
    tagInfo.revision = tagValue(tagInfo.tag);
  }
  ```
- **End Goals**:
  1. **Change Detection**: Efficiently detect when a property value has changed without recomputing it
  2. **Dependency Discovery**: Identify which other properties this property depends on
  3. **Change Attribution**: Show which specific dependencies changed and caused a recomputation
- **What Inspector Actually Needs**:
  - "Has this property changed since I last checked?"
  - "What properties does this property depend on?"
  - "Which dependencies changed?"
  - NOT: Low-level tag manipulation, revision numbers, or tag validation

### 14. **Runloop APIs**
- **Source**: `@ember/runloop`
- **APIs Used**:
  - `_backburner` - Access to the runloop scheduler
  - `join` - Join the runloop
  - `debounce`, `cancel` - Scheduling utilities
- **Usage**: Schedule inspector updates at appropriate times
- **End Goal**: Update inspector UI efficiently without impacting app performance

## Proposed Public API

The `appLoader.loadCompatInspector()` should return an object with the following structure:

```typescript
interface EmberInspectorAPI {
  // Core debugging utilities
  debug: {
    captureRenderTree: () => Array<RenderNode>;
    inspect: (value: any) => string;
    registerDeprecationHandler: (handler: DeprecationHandler) => void;
  };
  
  // Environment and configuration
  environment: {
    getEnv: () => EmberEnvironment;
    VERSION: string;
  };
  
  // Instrumentation
  instrumentation: {
    subscribe: (eventName: string, callbacks: InstrumentationCallbacks) => void;
  };
  
  // Object introspection
  objectInternals: {
    cacheFor: (obj: object, key: string) => any;
    guidFor: (obj: object) => string;
    meta: (obj: object) => Meta;
    get: (obj: object, key: string) => any;
    set: (obj: object, key: string, value: any) => any;
  };
  
  // Dependency injection
  owner: {
    getOwner: (obj: object) => Owner;
  };
  
  // Library registry
  libraries: {
    getRegistry: () => Array<Library>;
  };
  
  // Type checking functions (replaces instanceof checks)
  typeChecking: {
    isEmberObject: (obj: any) => boolean;
    isComponent: (obj: any) => boolean;
    isGlimmerComponent: (obj: any) => boolean;
    isService: (obj: any) => boolean;
    isObjectProxy: (obj: any) => boolean;
    isArrayProxy: (obj: any) => boolean;
    isCoreObject: (obj: any) => boolean;
    isApplication: (obj: any) => boolean;
    isNamespace: (obj: any) => boolean;
    hasObservable: (obj: any) => boolean;
    hasEvented: (obj: any) => boolean;
    hasPromiseProxyMixin: (obj: any) => boolean;
    hasControllerMixin: (obj: any) => boolean;
    isMutableArray: (obj: any) => boolean;
    isMutableEnumerable: (obj: any) => boolean;
    isNativeArray: (obj: any) => boolean;
  };
  
  // Name resolution for classes and mixins
  naming: {
    /**
     * Get a human-readable name for an Ember class or mixin.
     * Returns null if the class/mixin is not a known Ember type.
     * 
     * Examples:
     * - Evented mixin → "Evented Mixin"
     * - EmberObject class → "EmberObject"
     * - Component class → "Component"
     * - Unknown class → null
     * 
     * @param classOrMixin - The class constructor or mixin object
     * @returns Human-readable name or null
     */
    getClassName: (classOrMixin: any) => string | null;
  };
  
  // Property change tracking (simplified high-level API)
  tracking: {
    /**
     * Create a change tracker for a property.
     * Returns an opaque tracker object that can be used to detect changes.
     * 
     * @param obj - The object to track
     * @param key - The property name to track
     * @returns A tracker object (opaque to inspector)
     */
    createPropertyTracker: (obj: object, key: string) => PropertyTracker;
    
    /**
     * Check if a tracked property has changed since the tracker was created
     * or since the last call to this function.
     * 
     * @param tracker - The tracker returned by createPropertyTracker
     * @returns true if the property has changed
     */
    hasPropertyChanged: (tracker: PropertyTracker) => boolean;
    
    /**
     * Get information about what a property depends on.
     * This includes both computed property dependent keys and tracked properties.
     * 
     * @param obj - The object
     * @param key - The property name
     * @returns Array of dependency information
     */
    getPropertyDependencies: (obj: object, key: string) => Array<PropertyDependency>;
    
    /**
     * Get detailed dependency information including which dependencies changed.
     * This is used when a property has changed to show what caused the change.
     * 
     * @param obj - The object
     * @param key - The property name
     * @param tracker - The tracker for this property
     * @returns Array of dependencies with change information
     */
    getChangedDependencies: (obj: object, key: string, tracker: PropertyTracker) => Array<PropertyDependency>;
    
    /**
     * Check if a property uses tracking (either @tracked or computed with tracked dependencies).
     * 
     * @param obj - The object
     * @param key - The property name
     * @returns true if the property uses Glimmer tracking
     */
    isTrackedProperty: (obj: object, key: string) => boolean;
  };
  
  // Computed property utilities
  computed: {
    isComputed: (obj: object, key: string) => boolean;
    getComputedPropertyDescriptor: (obj: object, key: string) => ComputedPropertyDescriptor | null;
    getDependentKeys: (obj: object, key: string) => Array<string>;
    
    /**
     * Get computed property metadata including getter, setter, and flags.
     * This replaces direct access to descriptor internals like _getter, _readOnly, _auto.
     * 
     * @param descriptor - The computed property descriptor
     * @returns Metadata object with public properties
     */
    getComputedMetadata: (descriptor: any) => ComputedMetadata;
  };
  
  // Render tree debugging
  renderTree: {
    /**
     * Get the debug render tree instance for inspecting component hierarchy.
     * This replaces direct access to renderer._debugRenderTree or service._debugRenderTree.
     * 
     * @param owner - The owner instance
     * @returns The debug render tree instance or null if not available
     */
    getDebugRenderTree: (owner: Owner) => DebugRenderTree | null;
  };
  
  // Runloop access
  runloop: {
    getBackburner: () => Backburner;
    join: (callback: () => void) => void;
    debounce: (target: object, method: string | Function, wait: number, ...args: any[]) => any;
    cancel: (timer: any) => void;
  };
}

// Supporting type definitions

interface RenderNode {
  id: string;
  type: string;
  name: string;
  args: Record<string, any>;
  instance: any;
  bounds: Bounds;
  children: Array<RenderNode>;
}

interface Meta {
  forEachMixins: (callback: (mixin: any) => void) => void;
  forEachDescriptors: (callback: (name: string, descriptor: any) => void) => void;
  peekDescriptors: (key: string) => any;
  hasMixin: (mixin: any) => boolean;
  parent?: Meta;
  _debugReferences?: number;
}

interface Owner {
  lookup: (fullName: string) => any;
  register: (fullName: string, factory: any, options?: any) => void;
}

interface Library {
  name: string;
  version: string;
}

/**
 * Opaque tracker object - inspector doesn't need to know internals.
 * Ember can store tag references, revisions, or any other tracking state.
 */
interface PropertyTracker {
  // Opaque - implementation detail hidden from inspector
}

/**
 * Information about a property dependency
 */
interface PropertyDependency {
  // The name of the dependency (e.g., "firstName" or "user.name")
  name: string;
  
  // Optional: If this is a child property of a parent dependency
  child?: string;
  
  // Optional: Whether this specific dependency changed (for getChangedDependencies)
  changed?: boolean;
}

interface ComputedPropertyDescriptor {
  _dependentKeys?: Array<string>;
  _readOnly?: boolean;
  _auto?: boolean;
  get?: Function;
  set?: Function;
  _getter?: Function;
}

/**
 * Public metadata for computed properties.
 * Replaces direct access to private descriptor properties.
 */
interface ComputedMetadata {
  // The getter function (if available)
  getter?: Function;
  
  // The setter function (if available)
  setter?: Function;
  
  // Whether the computed property is read-only
  readOnly: boolean;
  
  // Whether the computed property uses auto-tracking
  auto: boolean;
  
  // Array of dependent keys
  dependentKeys: Array<string>;
  
  // Source code of the getter (for display purposes)
  code?: string;
}

/**
 * Debug render tree interface for component inspection.
 * Replaces direct access to _debugRenderTree.
 */
interface DebugRenderTree {
  // Methods for traversing and inspecting the render tree
  // (Actual interface would be defined by Ember's implementation)
  [key: string]: any;
}

interface DeprecationHandler {
  (message: string, options: any, next: Function): void;
}

interface InstrumentationCallbacks {
  before?: (name: string, timestamp: number, payload: any) => any;
  after?: (name: string, timestamp: number, payload: any, beforeValue: any) => void;
}

interface EmberEnvironment {
  _DEBUG_RENDER_TREE?: boolean;
  EXTEND_PROTOTYPES?: {
    Array?: boolean;
    Function?: boolean;
    String?: boolean;
  };
}

interface Backburner {
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}
```

## Key Design Decisions

### 1. Type Checking via Functions Instead of Classes

**Rationale**: 
- Avoids exposing internal class constructors
- Provides a stable API that won't break if internal class hierarchy changes
- Allows Ember to optimize or refactor internals without breaking inspector
- Inspector doesn't need to import or hold references to class constructors

**Example Migration**:
```javascript
// Before (using classes)
if (object instanceof EmberObject) { /* ... */ }
if (value instanceof Service) { /* ... */ }

// After (using functions)
if (api.typeChecking.isEmberObject(object)) { /* ... */ }
if (api.typeChecking.isService(value)) { /* ... */ }
```

### 2. Class/Mixin Name Resolution

**Rationale**:
- Inspector needs to display friendly names like "Evented Mixin" instead of "(unknown mixin)"
- Currently maintains its own map of class references to names
- This map requires importing all Ember classes/mixins
- Ember knows its own class names and can provide them without exposing class references

**Example Migration**:
```javascript
// Before (inspector maintains map)
import { Evented, PromiseProxyMixin, /* ... */ } from '../utils/ember';
const emberNames = new Map([
  [Evented, 'Evented Mixin'],
  [PromiseProxyMixin, 'PromiseProxy Mixin'],
  // ...
]);
let name = emberNames.get(mixin) || '';

// After (Ember provides name resolution)
let name = api.naming.getClassName(mixin) || '';
```

**Benefits**:
- Inspector doesn't need to import or reference Ember classes
- Ember can add/remove/rename classes without breaking inspector
- Works consistently across all Ember versions
- Reduces inspector's dependency on Ember internals

### 3. High-Level Tracking API

**Rationale**:
- Inspector doesn't need low-level tag operations
- Hides implementation details (tags, revisions, validation)
- Focuses on what inspector actually needs: change detection and dependency info
- Easier to maintain across Ember versions
- Allows Ember to change tracking implementation without breaking inspector

**What Inspector Actually Does**:
1. **Change Detection**: "Has this property changed?" → `hasPropertyChanged(tracker)`
2. **Dependency Discovery**: "What does it depend on?" → `getPropertyDependencies(obj, key)`
3. **Change Attribution**: "Which dependencies changed?" → `getChangedDependencies(obj, key, tracker)`

**Example Migration**:
```javascript
// Before (low-level tag operations)
const tracked = {};
tracked[propertyName] = {
  tag: tagForProperty(object, propertyName),
  revision: 0
};

// Later: check for changes
const changed = !tagValidate(tracked[propertyName].tag, tracked[propertyName].revision);
if (changed) {
  tracked[propertyName].tag = track(() => {
    value = object[propertyName];
  });
  const deps = getTrackedDependencies(object, propertyName, tracked[propertyName]);
  tracked[propertyName].revision = tagValue(tracked[propertyName].tag);
}

// After (high-level API)
const tracked = {};
tracked[propertyName] = api.tracking.createPropertyTracker(object, propertyName);

// Later: check for changes
const changed = api.tracking.hasPropertyChanged(tracked[propertyName]);
if (changed) {
  value = object[propertyName];
  const deps = api.tracking.getChangedDependencies(object, propertyName, tracked[propertyName]);
}
```

**Benefits**:
- Inspector code is simpler and more readable
- No need to understand tags, revisions, or validation
- Ember can optimize tracking implementation
- Works consistently across different tracking implementations

### 4. Computed Property Utilities

**Rationale**:
- Abstracts away ComputedProperty class internals
- Provides inspector-specific operations
- Handles differences between computed properties and native getters

## Migration Strategy

1. **Phase 1**: Add the new API to ember-source while maintaining backward compatibility
   - Implement `loadCompatInspector()` in ember-source
   - Keep existing internal module access working
   - Add feature detection in inspector

2. **Phase 2**: Update ember-inspector to prefer the new API when available
   - Add fallback logic: try new API first, fall back to old approach
   - Test with multiple Ember versions
   - Update documentation

3. **Phase 3**: Deprecate direct access to internal modules
   - Add deprecation warnings when internal modules are accessed
   - Provide migration guide
   - Give ecosystem time to adapt

4. **Phase 4**: Remove internal module access (major version bump)
   - Remove deprecated internal module exports
   - Inspector fully relies on public API
   - Clean up fallback code in inspector

## Benefits

1. **Stability**: Public API contract prevents breaking changes
2. **Performance**: Optimized API can be provided without exposing internals
3. **Security**: Controlled access to debugging capabilities
4. **Maintainability**: Clear separation between public and private APIs
5. **Future-proofing**: Easier to evolve both ember-source and ember-inspector independently
6. **Simplicity**: High-level APIs are easier to use and understand
7. **Encapsulation**: Implementation details hidden behind function boundaries
8. **Flexibility**: Functions can adapt to internal changes without breaking inspector
9. **Reduced Coupling**: Inspector doesn't need to import or reference Ember classes

## Implementation Notes

- The API should be versioned to handle different Ember versions
- Functions should handle `null`/`undefined` gracefully
- Type checking functions should return `false` for non-objects rather than throwing
- Tracking functions should return `null` or empty results when tracking is not available
- `PropertyTracker` is opaque - inspector never needs to inspect its contents
- `getClassName()` should return `null` for unknown classes rather than throwing
- The API should include comprehensive JSDoc/TypeScript definitions
- Documentation should clearly indicate which features are available in which Ember versions
- Consider adding a `version` property to the API object for feature detection

## Summary of Key API Simplifications

### Tracking API
**Before**: Inspector manipulates low-level Glimmer tracking primitives
- `tagForProperty()` - Get tag object
- `tagValue()` - Get revision number
- `tagValidate()` - Check if valid
- `track()` - Track access
- Manual tag structure analysis for dependencies

**After**: Inspector uses high-level change detection API
- `createPropertyTracker()` - Set up tracking
- `hasPropertyChanged()` - Simple boolean check
- `getPropertyDependencies()` - Get dependency list
- `getChangedDependencies()` - Get what changed
- `isTrackedProperty()` - Check if tracked

### Type Checking API
**Before**: Inspector uses `instanceof` with imported classes
- Requires importing all Ember classes
- Breaks when class hierarchy changes
- Tight coupling to Ember internals

**After**: Inspector uses type checking functions
- `isEmberObject()`, `isService()`, etc.
- No class imports needed
- Stable API independent of internals

### Name Resolution API
**Before**: Inspector maintains map of class references to names
- Imports all Ember classes and mixins
- Manually maintains name mappings
- Breaks when classes are added/removed

**After**: Ember provides name resolution
- `getClassName(classOrMixin)` returns name
- No class imports needed
- Ember manages its own class names

**Result**: Inspector code is simpler, more maintainable, and completely decoupled from Ember internals.