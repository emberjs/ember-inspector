/* eslint-disable ember/no-private-routing-service */
// eslint-disable-next-line ember/no-mixins
import PortMixin from 'ember-debug/mixins/port-mixin';
import bound from 'ember-debug/utils/bound-method';
import {
  isComputed,
  isDescriptor,
  getDescriptorFor,
} from 'ember-debug/utils/type-check';
import { compareVersion } from 'ember-debug/utils/version';
import { typeOf } from './utils/type-check';
import Ember from './utils/ember';

const {
  Object: EmberObject,
  inspect: emberInspect,
  meta: emberMeta,
  computed,
  get,
  set,
  guidFor,
  isNone,
  cacheFor,
  VERSION,
  run,
  ActionHandler,
  ArrayProxy,
  Component,
  ControllerMixin,
  CoreObject,
  Evented,
  MutableArray,
  MutableEnumerable,
  NativeArray,
  ObjectProxy,
  Observable,
  PromiseProxyMixin,
  TargetActionSupport,
} = Ember;
const { oneWay } = computed;
const { backburner, join } = run;

const GlimmerComponent = (() => {
  try {
    return window.require('@glimmer/component').default;
  } catch (e) {
    // ignore, return undefined
  }
})();

let tagValue, tagValidate, track, tagForProperty;

try {
  // Try to load the most recent library
  let GlimmerValidator = Ember.__loader.require('@glimmer/validator');

  tagValue = GlimmerValidator.value || GlimmerValidator.valueForTag;
  tagValidate = GlimmerValidator.validate || GlimmerValidator.validateTag;
  track = GlimmerValidator.track;
} catch (e) {
  try {
    // Fallback to the previous implementation
    let GlimmerReference = Ember.__loader.require('@glimmer/reference');

    tagValue = GlimmerReference.value;
    tagValidate = GlimmerReference.validate;
  } catch (e) {
    // ignore
  }
}

try {
  let metal = Ember.__loader.require('@ember/-internals/metal');

  tagForProperty = metal.tagForProperty;
  // If track was not already loaded, use metal's version (the previous version)
  track = track || metal.track;
} catch (e) {
  // ignore
}

const HAS_GLIMMER_TRACKING = tagValue && tagValidate && track && tagForProperty;

const keys = Object.keys || Ember.keys;

/**
 * Add Known Ember Mixins and Classes so we can label them correctly in the inspector
 */
const emberNames = new Map([
  [Evented, 'Evented Mixin'],
  [PromiseProxyMixin, 'PromiseProxy Mixin'],
  [MutableArray, 'MutableArray Mixin'],
  [MutableEnumerable, 'MutableEnumerable Mixin'],
  [NativeArray, 'NativeArray Mixin'],
  [Observable, 'Observable Mixin'],
  [ControllerMixin, 'Controller Mixin'],
  [TargetActionSupport, 'TargetActionSupport Mixin'],
  [ActionHandler, 'ActionHandler Mixin'],
  [CoreObject, 'CoreObject'],
  [EmberObject, 'EmberObject'],
  [Component, 'Component'],
]);

try {
  const Views = Ember.__loader.require('@ember/-internals/views');
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport Mixin');
  emberNames.set(Views.ViewMixin, 'View Mixin');
  emberNames.set(Views.ActionSupport, 'ActionSupport Mixin');
  emberNames.set(Views.ClassNamesSupport, 'ClassNamesSupport Mixin');
  emberNames.set(Views.ChildViewsSupport, 'ChildViewsSupport Mixin');
  emberNames.set(Views.ViewStateSupport, 'ViewStateSupport  Mixin');
  // this one is not a Mixin, but an .extend({}), which results in a class
  emberNames.set(Views.CoreView, 'CoreView');
} catch (e) {
  // do nothing
}

/**
 * Determine the type and get the value of the passed property
 * @param {*} object The parent object we will look for `key` on
 * @param {string} key The key for the property which points to a computed, EmberObject, etc
 * @param {*} computedValue A value that has already been computed with calculateCP
 * @return {{inspect: (string|*), type: string}|{computed: boolean, inspect: string, type: string}|{inspect: string, type: string}}
 */
function inspectValue(object, key, computedValue) {
  let string;
  const value = computedValue;

  if (arguments.length === 3 && computedValue === undefined) {
    return { type: `type-undefined`, inspect: 'undefined' };
  }

  // TODO: this is not very clean. We should refactor calculateCP, etc, rather than passing computedValue
  if (computedValue !== undefined) {
    return { type: `type-${typeOf(value)}`, inspect: inspect(value) };
  }

  if (value instanceof EmberObject) {
    return { type: 'type-ember-object', inspect: value.toString() };
  } else if (isComputed(object, key)) {
    string = '<computed>';
    return { type: 'type-descriptor', inspect: string };
  } else if (isDescriptor(value)) {
    return { type: 'type-descriptor', inspect: value.toString() };
  } else {
    return { type: `type-${typeOf(value)}`, inspect: inspect(value) };
  }
}

function inspect(value) {
  if (typeof value === 'function') {
    return 'function() { ... }';
  } else if (value instanceof EmberObject) {
    return value.toString();
  } else if (typeOf(value) === 'array') {
    if (value.length === 0) {
      return '[]';
    } else if (value.length === 1) {
      return `[ ${inspect(value[0])} ]`;
    } else {
      return `[ ${inspect(value[0])}, ... ]`;
    }
  } else if (value instanceof Error) {
    return `Error: ${value.message}`;
  } else if (value === null) {
    return 'null';
  } else if (typeOf(value) === 'date') {
    return value.toString();
  } else if (typeof value === 'object') {
    // `Ember.inspect` is able to handle this use case,
    // but it is very slow as it loops over all props,
    // so summarize to just first 2 props
    let ret = [];
    let v;
    let count = 0;
    let broken = false;

    for (let key in value) {
      if (!('hasOwnProperty' in value) || value.hasOwnProperty(key)) {
        if (count++ > 1) {
          broken = true;
          break;
        }
        v = value[key];
        if (v === 'toString') {
          continue;
        } // ignore useless items
        if (typeOf(v).includes('function')) {
          v = 'function() { ... }';
        }
        if (typeOf(v) === 'array') {
          v = `[Array : ${v.length}]`;
        }
        if (typeOf(v) === 'object') {
          v = '[Object]';
        }
        ret.push(`${key}: ${v}`);
      }
    }
    let suffix = ' }';
    if (broken) {
      suffix = ' ...}';
    }
    return `{ ${ret.join(', ')}${suffix}`;
  } else {
    return emberInspect(value);
  }
}

function isMandatorySetter(descriptor) {
  if (descriptor.set && descriptor.set === Ember.MANDATORY_SETTER_FUNCTION) {
    return true;
  }
  if (
    descriptor.set &&
    Function.prototype.toString
      .call(descriptor.set)
      .includes('You attempted to update')
  ) {
    return true;
  }
  return false;
}

function getTagTrackedProps(tag, ownTag, level = 0) {
  const props = [];
  // do not include tracked properties from dependencies
  if (!tag || level > 1) {
    return props;
  }
  if (tag.subtag) {
    if (tag.subtag._propertyKey) props.push(tag.subtag._propertyKey);
    props.push(...getTagTrackedProps(tag.subtag, ownTag, level + 1));
  }
  if (tag.subtags) {
    tag.subtags.forEach((t) => {
      if (t === ownTag) return;
      if (t._propertyKey) props.push(t._propertyKey);
      props.push(...getTagTrackedProps(t, ownTag, level + 1));
    });
  }
  return props;
}

function getTrackedDependencies(object, property, tag) {
  const proto = Object.getPrototypeOf(object);
  if (!proto) return [];
  const cpDesc = emberMeta(object).peekDescriptors(property);
  const dependentKeys = [];
  if (cpDesc) {
    dependentKeys.push(...(cpDesc._dependentKeys || []));
  }
  if (HAS_GLIMMER_TRACKING) {
    const ownTag = tagForProperty(object, property);
    dependentKeys.push(...getTagTrackedProps(tag, ownTag));
  }

  return [...new Set([...dependentKeys])];
}

export default EmberObject.extend(PortMixin, {
  namespace: null,

  adapter: oneWay('namespace.adapter'),

  port: oneWay('namespace.port'),

  currentObject: null,

  updateCurrentObject() {
    if (this.currentObject) {
      const { object, mixinDetails, objectId } = this.currentObject;
      mixinDetails.forEach((mixin, mixinIndex) => {
        mixin.properties.forEach((item) => {
          if (item.overridden) {
            return true;
          }
          try {
            let cache = cacheFor(object, item.name);
            if (item.isExpensive && !cache) return true;
            if (item.value.type === 'type-function') return true;

            let value = null;
            let changed = false;
            const values = (this.objectPropertyValues[objectId] =
              this.objectPropertyValues[objectId] || {});
            const tracked = (this.trackedTags[objectId] =
              this.trackedTags[objectId] || {});

            const desc = Object.getOwnPropertyDescriptor(object, item.name);
            const isSetter = desc && isMandatorySetter(desc);

            if (HAS_GLIMMER_TRACKING && item.canTrack && !isSetter) {
              let tagInfo = tracked[item.name] || {
                tag: tagForProperty(object, item.name),
                revision: 0,
              };
              if (!tagInfo.tag) return;

              changed = !tagValidate(tagInfo.tag, tagInfo.revision);
              if (changed) {
                tagInfo.tag = track(() => {
                  value = get(object, item.name);
                });
                tagInfo.revision = tagValue(tagInfo.tag);
              }
              tracked[item.name] = tagInfo;
            } else {
              value = calculateCP(object, item, {});
              if (values[item.name] !== value) {
                changed = true;
                values[item.name] = value;
              }
            }

            if (changed) {
              value = inspectValue(object, item.name, value);
              value.isCalculated = true;
              let dependentKeys = null;
              if (tracked[item.name]) {
                dependentKeys = getTrackedDependencies(
                  object,
                  item.name,
                  tracked[item.name].tag
                );
              }
              this.sendMessage('updateProperty', {
                objectId,
                property: item.name,
                value,
                mixinIndex,
                dependentKeys,
              });
            }
          } catch (e) {
            // dont do anything
          }
        });
      });
    }
  },

  init() {
    this._super();
    this.set('sentObjects', {});
    backburner.on('end', bound(this, this.updateCurrentObject));
  },

  willDestroy() {
    this._super();
    for (let objectId in this.sentObjects) {
      this.releaseObject(objectId);
    }
    backburner.off('end', bound(this, this.updateCurrentObject));
  },

  sentObjects: {},

  parentObjects: {},

  objectPropertyValues: {},

  trackedTags: {},

  _errorsFor: computed(function () {
    return {};
  }),

  portNamespace: 'objectInspector',

  messages: {
    digDeeper(message) {
      this.digIntoObject(message.objectId, message.property);
    },
    releaseObject(message) {
      this.releaseObject(message.objectId);
    },
    calculate(message) {
      let value;
      value = this.valueForObjectProperty(
        message.objectId,
        message.property,
        message.mixinIndex
      );
      if (value) {
        this.sendMessage('updateProperty', value);
        message.isCalculated = true;
      }
      this.sendMessage('updateErrors', {
        objectId: message.objectId,
        errors: errorsToSend(this._errorsFor[message.objectId]),
      });
    },
    saveProperty(message) {
      let value = message.value;
      if (message.dataType && message.dataType === 'date') {
        value = new Date(value);
      }
      this.saveProperty(message.objectId, message.property, value);
    },
    sendToConsole(message) {
      this.sendToConsole(message.objectId, message.property);
    },
    sendControllerToConsole(message) {
      const container = this.get('namespace.owner');
      this.sendValueToConsole(container.lookup(`controller:${message.name}`));
    },
    sendRouteHandlerToConsole(message) {
      const container = this.get('namespace.owner');
      this.sendValueToConsole(container.lookup(`route:${message.name}`));
    },
    sendContainerToConsole() {
      const container = this.get('namespace.owner');
      this.sendValueToConsole(container);
    },
    /**
     * Lookup the router instance, and find the route with the given name
     * @param message The message sent
     * @param {string} messsage.name The name of the route to lookup
     */
    inspectRoute(message) {
      const container = this.get('namespace.owner');
      const router = container.lookup('router:main');
      const routerLib = router._routerMicrolib || router.router;
      // 3.9.0 removed intimate APIs from router
      // https://github.com/emberjs/ember.js/pull/17843
      // https://deprecations.emberjs.com/v3.x/#toc_remove-handler-infos
      if (compareVersion(VERSION, '3.9.0') !== -1) {
        // Ember >= 3.9.0
        this.sendObject(routerLib.getRoute(message.name));
      } else {
        // Ember < 3.9.0
        this.sendObject(routerLib.getHandler(message.name));
      }
    },
    inspectController(message) {
      const container = this.get('namespace.owner');
      this.sendObject(container.lookup(`controller:${message.name}`));
    },
    inspectById(message) {
      const obj = this.sentObjects[message.objectId];
      if (obj) {
        this.sendObject(obj);
      }
    },
    inspectByContainerLookup(message) {
      const container = this.get('namespace.owner');
      this.sendObject(container.lookup(message.name));
    },
    traceErrors(message) {
      let errors = this._errorsFor[message.objectId];
      toArray(errors).forEach((error) => {
        let stack = error.error;
        if (stack && stack.stack) {
          stack = stack.stack;
        } else {
          stack = error;
        }
        this.adapter.log(`Object Inspector error for ${error.property}`, stack);
      });
    },
  },

  canSend(val) {
    return (
      val &&
      (val instanceof EmberObject ||
        val instanceof Object ||
        typeOf(val) === 'object' ||
        typeOf(val) === 'array')
    );
  },

  saveProperty(objectId, prop, val) {
    let object = this.sentObjects[objectId];
    join(() => set(object, prop, val));
  },

  sendToConsole(objectId, prop) {
    let object = this.sentObjects[objectId];
    let value;

    if (isNone(prop)) {
      value = this.sentObjects[objectId];
    } else {
      value = calculateCP(object, { name: prop }, {});
    }

    this.sendValueToConsole(value);
  },

  sendValueToConsole(value) {
    window.$E = value;
    if (value instanceof Error) {
      value = value.stack;
    }
    let args = [value];
    if (value instanceof EmberObject) {
      args.unshift(inspect(value));
    }
    this.adapter.log('Ember Inspector ($E): ', ...args);
  },

  digIntoObject(objectId, property) {
    let parentObject = this.sentObjects[objectId];
    let object = calculateCP(parentObject, { name: property }, {});

    if (this.canSend(object)) {
      const currentObject = this.currentObject;
      let details = this.mixinsForObject(object);
      this.parentObjects[details.objectId] = currentObject;
      this.sendMessage('updateObject', {
        parentObject: objectId,
        property,
        objectId: details.objectId,
        name: getClassName(object),
        details: details.mixins,
        errors: details.errors,
      });
    }
  },

  sendObject(object) {
    if (!this.canSend(object)) {
      throw new Error(
        `Can't inspect ${object}. Only Ember objects and arrays are supported.`
      );
    }
    let details = this.mixinsForObject(object);
    this.sendMessage('updateObject', {
      objectId: details.objectId,
      name: getClassName(object),
      details: details.mixins,
      errors: details.errors,
    });
  },

  retainObject(object) {
    let meta = emberMeta(object);
    let guid = guidFor(object);

    meta._debugReferences = meta._debugReferences || 0;
    meta._debugReferences++;

    this.sentObjects[guid] = object;

    if (meta._debugReferences === 1 && object.reopen) {
      // drop object on destruction
      let _oldWillDestroy = (object._oldWillDestroy = object.willDestroy);
      let self = this;
      object.reopen({
        willDestroy() {
          self.dropObject(guid);
          return _oldWillDestroy.apply(this, arguments);
        },
      });
    }

    return guid;
  },

  releaseObject(objectId) {
    let object = this.sentObjects[objectId];
    if (!object) {
      return;
    }
    let meta = emberMeta(object);
    let guid = guidFor(object);

    meta._debugReferences--;

    if (meta._debugReferences === 0) {
      this.dropObject(guid);
    }
  },

  dropObject(objectId) {
    let object = this.sentObjects[objectId];
    if (this.parentObjects[objectId]) {
      this.currentObject = this.parentObjects[objectId];
    }
    delete this.parentObjects[objectId];

    if (object && object.reopen) {
      object.reopen({ willDestroy: object._oldWillDestroy });
      delete object._oldWillDestroy;
    }

    delete this.sentObjects[objectId];
    delete this.objectPropertyValues[objectId];
    delete this.trackedTags[objectId];
    if (this.currentObject && this.currentObject.objectId === objectId) {
      this.currentObject = null;
    }

    delete this._errorsFor[objectId];

    this.sendMessage('droppedObject', { objectId });
  },

  /**
   * This function, and the rest of Ember Inspector, currently refer to the
   * output entirely as mixins. However, this is no longer accurate! This has
   * been refactored to return a list of objects that represent both the classes
   * themselves and their mixins. For instance, the following class definitions:
   *
   * ```js
   * class Foo extends EmberObject {}
   *
   * class Bar extends Foo {}
   *
   * class Baz extends Bar.extend(Mixin1, Mixin2) {}
   *
   * let obj = Baz.create();
   * ```
   *
   * Will result in this in the inspector:
   *
   * ```
   * - Own Properties
   * - Baz
   * - Mixin1
   * - Mixin2
   * - Bar
   * - Foo
   * - EmberObject
   * ```
   *
   * The "mixins" returned by this function directly represent these things too.
   * Each class object consists of the actual own properties of that class's
   * prototype, and is followed by the mixins (if any) that belong to that
   * class. Own Properties represents the actual own properties of the object
   * itself.
   *
   * TODO: The rest of the Inspector should be updated to reflect this new data
   * model, and these functions should be updated with new names. Mixins should
   * likely be embedded _on_ the class definitions, but this was designed to be
   * backwards compatible.
   */
  mixinDetailsForObject(object) {
    const mixins = [];

    const own = ownMixins(object);

    const objectMixin = {
      id: guidFor(object),
      name: getClassName(object),
      properties: ownProperties(object, own),
    };

    mixins.push(objectMixin);

    // insert ember mixins
    for (let mixin of own) {
      let name = (
        mixin[Ember.NAME_KEY] ||
        mixin.ownerConstructor ||
        emberNames.get(mixin) ||
        ''
      ).toString();

      if (!name && typeof mixin.toString === 'function') {
        try {
          name = mixin.toString();

          if (name === '(unknown)') {
            name = '(unknown mixin)';
          }
        } catch (e) {
          name = '(Unable to convert Object to string)';
        }
      }

      const mix = {
        properties: propertiesForMixin(mixin),
        name,
        isEmberMixin: true,
        id: guidFor(mixin),
      };

      mixins.push(mix);
    }

    const proto = Object.getPrototypeOf(object);

    if (proto && proto !== Object.prototype) {
      mixins.push(...this.mixinDetailsForObject(proto));
    }

    return mixins;
  },

  mixinsForObject(object) {
    if (
      object instanceof ObjectProxy &&
      object.content &&
      !object._showProxyDetails
    ) {
      object = object.content;
    }

    if (
      object instanceof ArrayProxy &&
      object.content &&
      !object._showProxyDetails
    ) {
      object = object.slice(0, 101);
    }

    let mixinDetails = this.mixinDetailsForObject(object);

    mixinDetails[0].name = 'Own Properties';
    mixinDetails[0].expand = true;

    if (mixinDetails[1] && !mixinDetails[1].isEmberMixin) {
      mixinDetails[1].expand = true;
    }

    fixMandatorySetters(mixinDetails);
    applyMixinOverrides(mixinDetails);

    let propertyInfo = null;
    let debugInfo = getDebugInfo(object);
    if (debugInfo) {
      propertyInfo = getDebugInfo(object).propertyInfo;
      mixinDetails = customizeProperties(mixinDetails, propertyInfo);
    }

    let expensiveProperties = null;
    if (propertyInfo) {
      expensiveProperties = propertyInfo.expensiveProperties;
    }

    let objectId = this.retainObject(object);

    let errorsForObject = (this._errorsFor[objectId] = {});
    const tracked = (this.trackedTags[objectId] =
      this.trackedTags[objectId] || {});
    calculateCPs(
      object,
      mixinDetails,
      errorsForObject,
      expensiveProperties,
      tracked
    );

    this.currentObject = { object, mixinDetails, objectId };

    let errors = errorsToSend(errorsForObject);
    return { objectId, mixins: mixinDetails, errors };
  },

  valueForObjectProperty(objectId, property, mixinIndex) {
    let object = this.sentObjects[objectId],
      value;

    if (object.isDestroying) {
      value = '<DESTROYED>';
    } else {
      value = calculateCP(
        object,
        { name: property },
        this._errorsFor[objectId]
      );
    }

    if (!value || !(value instanceof CalculateCPError)) {
      value = inspectValue(object, property, value);
      value.isCalculated = true;

      return { objectId, property, value, mixinIndex };
    }
  },

  inspect,
  inspectValue,
});

function getClassName(object) {
  let name = '';
  let className =
    (object.constructor &&
      (emberNames.get(object.constructor) || object.constructor.name)) ||
    '';

  if (object.constructor && object.constructor.prototype === object) {
    let { constructor } = object;

    if (
      constructor.toString &&
      constructor.toString !== Object.prototype.toString
    ) {
      name = constructor.toString();
    } else {
      name = constructor.name;
    }
  } else if (
    'toString' in object &&
    object.toString !== Object.prototype.toString
  ) {
    name = object.toString();
  }

  // If the class has a decent looking name, and the `toString` is one of the
  // default Ember toStrings, replace the constructor portion of the toString
  // with the class name. We check the length of the class name to prevent doing
  // this when the value is minified.
  if (
    name.match(/<.*:.*>/) &&
    !className.startsWith('_') &&
    className.length > 2 &&
    className !== 'Class'
  ) {
    return name.replace(/<.*:/, `<${className}:`);
  }

  return name || className;
}

function ownMixins(object) {
  // TODO: We need to expose an API for getting _just_ the own mixins directly
  let meta = emberMeta(object);
  let parentMeta = meta.parent;
  let mixins = new Set();

  // Filter out anonymous mixins that are directly in a `class.extend`
  let baseMixins =
    object.constructor &&
    object.constructor.PrototypeMixin &&
    object.constructor.PrototypeMixin.mixins;

  meta.forEachMixins((m) => {
    // Find mixins that:
    // - Are not in the parent classes
    // - Are not primitive (has mixins, doesn't have properties)
    // - Don't include any of the base mixins from a class extend
    if (
      (!parentMeta || !parentMeta.hasMixin(m)) &&
      !m.properties &&
      m.mixins &&
      (!baseMixins || !m.mixins.some((m) => baseMixins.includes(m)))
    ) {
      mixins.add(m);
    }
  });

  return mixins;
}

function ownProperties(object, ownMixins) {
  let meta = emberMeta(object);

  if (Array.isArray(object)) {
    // slice to max 101, for performance and so that the object inspector will show a `more items` indicator above 100
    object = object.slice(0, 101);
  }

  let props = Object.getOwnPropertyDescriptors(object);
  delete props.constructor;

  // meta has the correct descriptors for CPs
  meta.forEachDescriptors((name, desc) => {
    // only for own properties
    if (props[name]) {
      props[name] = desc;
    }
  });

  // remove properties set by mixins
  // especially for Object.extend(mixin1, mixin2), where a new class is created which holds the merged properties
  // if all properties are removed, it will be marked as useless mixin and will not be shown
  ownMixins.forEach((m) => {
    if (m.mixins) {
      m.mixins.forEach((mix) => {
        Object.keys(mix.properties || {}).forEach((k) => {
          const pDesc = Object.getOwnPropertyDescriptor(mix.properties, k);
          if (pDesc && props[k] && pDesc.get && pDesc.get === props[k].get) {
            delete props[k];
          }
          if (
            pDesc &&
            props[k] &&
            'value' in pDesc &&
            pDesc.value === props[k].value
          ) {
            delete props[k];
          }
          if (pDesc && props[k] && pDesc._getter === props[k]._getter) {
            delete props[k];
          }
        });
      });
    }
  });

  Object.keys(props).forEach((k) => {
    if (typeof props[k].value === 'function') {
      return;
    }
    props[k].isDescriptor = true;
  });

  // Clean the properties, removing private props and bindings, etc
  return addProperties([], props);
}

function propertiesForMixin(mixin) {
  let properties = [];

  if (mixin.mixins) {
    mixin.mixins.forEach((mixin) => {
      if (mixin.properties) {
        addProperties(properties, mixin.properties);
      }
    });
  }

  return properties;
}

function addProperties(properties, hash) {
  for (let prop in hash) {
    if (!hash.hasOwnProperty(prop)) {
      continue;
    }
    if (prop.charAt(0) === '_') {
      continue;
    }

    // remove `fooBinding` type props
    if (prop.match(/Binding$/)) {
      continue;
    }

    // when mandatory setter is removed, an `undefined` value may be set
    const desc =
      getDescriptorFor(hash, prop) ||
      Object.getOwnPropertyDescriptor(hash, prop);
    if (!desc) continue;
    if (
      hash[prop] === undefined &&
      desc.value === undefined &&
      !desc.get &&
      !desc._getter
    ) {
      continue;
    }

    let options = { isMandatorySetter: isMandatorySetter(desc) };

    if (typeof hash[prop] === 'object' && hash[prop] !== null) {
      options.isService =
        !('type' in hash[prop]) &&
        typeof hash[prop].unknownProperty === 'function'
          ? get(hash[prop], 'type') === 'service'
          : hash[prop].type === 'service';

      if (!options.isService) {
        if (hash[prop].constructor) {
          options.isService = hash[prop].constructor.isServiceFactory;
        }
      }

      if (!options.isService) {
        options.isService = desc.value instanceof Ember.Service;
      }
    }
    if (options.isService) {
      replaceProperty(properties, prop, inspectValue(hash, prop), options);
      continue;
    }

    if (isComputed(hash, prop)) {
      options.isComputed = true;
      options.dependentKeys = (desc._dependentKeys || []).map((key) =>
        key.toString()
      );

      if (typeof desc.get === 'function') {
        options.code = Function.prototype.toString.call(desc.get);
      }
      if (typeof desc._getter === 'function') {
        options.isCalculated = true;
        options.code = Function.prototype.toString.call(desc._getter);
      }
      if (!options.code) {
        options.code = '';
      }

      options.readOnly = desc._readOnly;
      options.auto = desc._auto;
      options.canTrack = options.code !== '';
    }

    if (desc.get) {
      options.isGetter = true;
      options.canTrack = true;
      if (!desc.set) {
        options.readOnly = true;
      }
    }
    if (desc.hasOwnProperty('value') || options.isMandatorySetter) {
      delete options.isGetter;
      delete options.isTracked;
      options.isProperty = true;
      options.canTrack = false;
    }
    replaceProperty(properties, prop, inspectValue(hash, prop), options);
  }

  return properties;
}

function replaceProperty(properties, name, value, options) {
  let found;

  let i, l;
  for (i = 0, l = properties.length; i < l; i++) {
    if (properties[i].name === name) {
      found = i;
      break;
    }
  }

  if (found) {
    properties.splice(i, 1);
  }

  let prop = { name, value };
  prop.isMandatorySetter = options.isMandatorySetter;
  prop.readOnly = options.readOnly;
  prop.auto = options.auto;
  prop.canTrack = options.canTrack;
  prop.isComputed = options.isComputed;
  prop.isProperty = options.isProperty;
  prop.isTracked = options.isTracked;
  prop.isGetter = options.isGetter;
  prop.dependentKeys = options.dependentKeys || [];
  let hasServiceFootprint =
    prop.value && typeof prop.value.inspect === 'string'
      ? prop.value.inspect.includes('@service:')
      : false;
  prop.isService = options.isService || hasServiceFootprint;
  prop.code = options.code;
  properties.push(prop);
}

function fixMandatorySetters(mixinDetails) {
  let seen = {};
  let propertiesToRemove = [];

  mixinDetails.forEach((detail, detailIdx) => {
    detail.properties.forEach((property) => {
      if (property.isMandatorySetter) {
        seen[property.name] = {
          name: property.name,
          value: property.value.inspect,
          detailIdx,
          property,
        };
      } else if (seen.hasOwnProperty(property.name) && seen[property.name]) {
        propertiesToRemove.push(seen[property.name]);
        delete seen[property.name];
      }
    });
  });

  propertiesToRemove.forEach((prop) => {
    let detail = mixinDetails[prop.detailIdx];
    let index = detail.properties.indexOf(prop.property);
    if (index !== -1) {
      detail.properties.splice(index, 1);
    }
  });
}

function applyMixinOverrides(mixinDetails) {
  let seen = {};
  mixinDetails.forEach((detail) => {
    detail.properties.forEach((property) => {
      if (Object.prototype.hasOwnProperty(property.name)) {
        return;
      }

      if (seen[property.name]) {
        property.overridden = seen[property.name];
        delete property.value.isCalculated;
      }

      seen[property.name] = detail.name;
    });
  });
}

function calculateCPs(
  object,
  mixinDetails,
  errorsForObject,
  expensiveProperties,
  tracked
) {
  expensiveProperties = expensiveProperties || [];
  mixinDetails.forEach((mixin) => {
    mixin.properties.forEach((item) => {
      if (item.overridden) {
        return true;
      }
      if (!item.value.isCalculated) {
        let cache = cacheFor(object, item.name);
        item.isExpensive = expensiveProperties.indexOf(item.name) >= 0;
        if (cache !== undefined || !item.isExpensive) {
          let value;
          if (item.canTrack && HAS_GLIMMER_TRACKING) {
            const tagInfo = (tracked[item.name] = {});
            tagInfo.tag = track(() => {
              value = calculateCP(object, item, errorsForObject);
            });
            if (tagInfo.tag === tagForProperty(object, item.name)) {
              if (!item.isComputed && !item.isService) {
                item.code = '';
                item.isTracked = true;
              }
            }
            tagInfo.revision = tagValue(tagInfo.tag);
            item.dependentKeys = getTrackedDependencies(
              object,
              item.name,
              tagInfo.tag
            );
          } else {
            value = calculateCP(object, item, errorsForObject);
          }
          if (!value || !(value instanceof CalculateCPError)) {
            item.value = inspectValue(object, item.name, value);
            item.value.isCalculated = true;
            if (item.value.type === 'type-function') {
              item.code = '';
            }
          }
        }
      }
    });
  });
}

/**
 Customizes an object's properties
 based on the property `propertyInfo` of
 the object's `_debugInfo` method.

 Possible options:
 - `groups` An array of groups that contains the properties for each group
 For example:
 ```javascript
 groups: [
 { name: 'Attributes', properties: ['firstName', 'lastName'] },
 { name: 'Belongs To', properties: ['country'] }
 ]
 ```
 - `includeOtherProperties` Boolean,
 - `true` to include other non-listed properties,
 - `false` to only include given properties
 - `skipProperties` Array containing list of properties *not* to include
 - `skipMixins` Array containing list of mixins *not* to include
 - `expensiveProperties` An array of computed properties that are too expensive.
 Adding a property to this array makes sure the CP is not calculated automatically.

 Example:
 ```javascript
 {
   propertyInfo: {
     includeOtherProperties: true,
     skipProperties: ['toString', 'send', 'withTransaction'],
     skipMixins: [ 'Ember.Evented'],
     calculate: ['firstName', 'lastName'],
     groups: [
       {
         name: 'Attributes',
         properties: [ 'id', 'firstName', 'lastName' ],
         expand: true // open by default
       },
       {
         name: 'Belongs To',
         properties: [ 'maritalStatus', 'avatar' ],
         expand: true
       },
       {
         name: 'Has Many',
         properties: [ 'phoneNumbers' ],
         expand: true
       },
       {
         name: 'Flags',
         properties: ['isLoaded', 'isLoading', 'isNew', 'isDirty']
       }
     ]
   }
 }
 ```
 */
function customizeProperties(mixinDetails, propertyInfo) {
  let newMixinDetails = [];
  let neededProperties = {};
  let groups = propertyInfo.groups || [];
  let skipProperties = propertyInfo.skipProperties || [];
  let skipMixins = propertyInfo.skipMixins || [];

  if (groups.length) {
    mixinDetails[0].expand = false;
  }

  groups.forEach((group) => {
    group.properties.forEach((prop) => {
      neededProperties[prop] = true;
    });
  });

  mixinDetails.forEach((mixin) => {
    let newProperties = [];
    mixin.properties.forEach((item) => {
      if (skipProperties.indexOf(item.name) !== -1) {
        return true;
      }

      if (
        !item.overridden &&
        neededProperties.hasOwnProperty(item.name) &&
        neededProperties[item.name]
      ) {
        neededProperties[item.name] = item;
      } else {
        newProperties.push(item);
      }
    });
    mixin.properties = newProperties;
    if (
      mixin.properties.length === 0 &&
      mixin.name.toLowerCase().includes('unknown')
    ) {
      // nothing useful for this mixin
      return;
    }
    if (skipMixins.indexOf(mixin.name) === -1) {
      newMixinDetails.push(mixin);
    }
  });

  groups
    .slice()
    .reverse()
    .forEach((group) => {
      let newMixin = { name: group.name, expand: group.expand, properties: [] };
      group.properties.forEach(function (prop) {
        // make sure it's not `true` which means property wasn't found
        if (neededProperties[prop] !== true) {
          newMixin.properties.push(neededProperties[prop]);
        }
      });
      newMixinDetails.unshift(newMixin);
    });

  return newMixinDetails;
}

function getDebugInfo(object) {
  let debugInfo = null;
  let objectDebugInfo = get(object, '_debugInfo');
  if (objectDebugInfo && typeof objectDebugInfo === 'function') {
    if (object instanceof Ember.ObjectProxy && object.content) {
      object = object.content;
    }
    debugInfo = objectDebugInfo.call(object);
  }
  debugInfo = debugInfo || {};
  let propertyInfo = debugInfo.propertyInfo || (debugInfo.propertyInfo = {});
  let skipProperties = (propertyInfo.skipProperties =
    propertyInfo.skipProperties || (propertyInfo.skipProperties = []));

  skipProperties.push('isDestroyed', 'isDestroying', 'container');
  // 'currentState' and 'state' are un-observable private properties.
  // The rest are skipped to reduce noise in the inspector.
  if (Ember.Component && object instanceof Ember.Component) {
    skipProperties.push(
      'currentState',
      'state',
      'buffer',
      'outletSource',
      'lengthBeforeRender',
      'lengthAfterRender',
      'template',
      'layout',
      'templateData',
      'domManager',
      'states',
      'element',
      'targetObject'
    );
  } else if (GlimmerComponent && object instanceof GlimmerComponent) {
    // These properties don't really exist on Glimmer Components, but
    // reading their values trigger a development mode assertion. The
    // more correct long term fix is to make getters lazy (shows "..."
    // in the UI and only computed them when requested (when the user
    // clicked on the "..." in the UI).
    skipProperties.push('bounds', 'debugName', 'element');
  }
  return debugInfo;
}

function toArray(errors) {
  return keys(errors).map((key) => errors[key]);
}

function calculateCP(object, item, errorsForObject) {
  const property = item.name;
  delete errorsForObject[property];
  try {
    if (object instanceof Ember.ArrayProxy && property == parseInt(property)) {
      return object.objectAt(property);
    }
    return item.isGetter ? object[property] : get(object, property);
  } catch (error) {
    errorsForObject[property] = { property, error };
    return new CalculateCPError();
  }
}

function CalculateCPError() {}

function errorsToSend(errors) {
  return toArray(errors).map((error) => ({ property: error.property }));
}
