import PortMixin from "ember-debug/mixins/port-mixin";
var Ember = window.Ember;
var EmberObject = Ember.Object;
var typeOf = Ember.typeOf;
var Descriptor = Ember.Descriptor;
var emberInspect = Ember.inspect;
var computed = Ember.computed;
var oneWay = computed.oneWay;
var ComputedProperty = Ember.ComputedProperty;
var get = Ember.get;
var set = Ember.set;
var guidFor = Ember.guidFor;
var emberMeta = Ember.meta;
var isNone = Ember.isNone;
var keys = Ember.keys;

function inspectValue(value) {
  var string;
  if (value instanceof EmberObject) {
    return { type: "type-ember-object", inspect: value.toString() };
  } else if (isComputed(value)) {
    string = "<computed>";
    return { type: "type-descriptor", inspect: string, computed: true };
  } else if (isDescriptor(value)) {
    return { type: "type-descriptor", inspect: value.toString(), computed: true };
  } else {
    return { type: "type-" + typeOf(value), inspect: inspect(value) };
  }
}

function isDescriptor(value) {
  // Ember < 1.11
  if (Descriptor !== undefined) {
    return value instanceof Descriptor;
  }
  // Ember >= 1.11
  return value && typeof value === 'object' && value.isDescriptor;
}

function inspect(value) {
  if (typeof value === 'function') {
    return "function() { ... }";
  } else if (value instanceof EmberObject) {
    return value.toString();
  } else if (typeOf(value) === 'array') {
    if (value.length === 0) {
      return '[]';
    } else if (value.length === 1) {
      return '[ ' + inspect(value[0]) + ' ]';
    } else {
      return '[ ' + inspect(value[0]) + ', ... ]';
    }
  } else if (value instanceof Error) {
    return 'Error: ' + value.message;
  } else if (value === null) {
    return 'null';
  } else if (typeOf(value) === 'date') {
    return value.toString();
  } else if (typeof value === 'object') {
    // `Ember.inspect` is able to handle this use case,
    // but it is very slow as it loops over all props,
    // so summarize to just first 2 props
    var ret = [], v, count = 0, broken = false;
    for (var key in value) {
      if (!('hasOwnProperty' in value) || value.hasOwnProperty(key)) {
        if (count++ > 1) {
          broken = true;
          break;
        }
        v = value[key];
        if (v === 'toString') { continue; } // ignore useless items
        if (typeOf(v) === 'function') { v = "function() { ... }"; }
        if (typeOf(v) === 'array') { v = '[Array : ' + v.length + ']'; }
        if (typeOf(v) === 'object') { v = '[Object]'; }
        ret.push(key + ": " + v);
      }
    }
    var suffix = ' }';
    if (broken) {
      suffix = ' ...}';
    }
    return '{ ' + ret.join(', ') + suffix;
  } else {
    return emberInspect(value);
  }
}

var ObjectInspector = EmberObject.extend(PortMixin, {
  namespace: null,

  adapter: oneWay('namespace.adapter'),

  port: oneWay('namespace.port'),

  application: oneWay('namespace.application'),

  init: function() {
    this._super();
    this.set('sentObjects', {});
    this.set('boundObservers', {});
  },

  willDestroy: function() {
    this._super();
    for (var objectId in this.sentObjects) {
      this.releaseObject(objectId);
    }
  },

  sentObjects: {},

  boundObservers: {},

  _errorsFor: computed(function() { return {}; }),

  portNamespace: 'objectInspector',

  messages: {
    digDeeper: function(message) {
      this.digIntoObject(message.objectId, message.property);
    },
    releaseObject: function(message) {
      this.releaseObject(message.objectId);
    },
    calculate: function(message) {
      var value;
      value = this.valueForObjectProperty(message.objectId, message.property, message.mixinIndex);
      if (value) {
        this.sendMessage('updateProperty', value);
        message.computed = true;
        this.bindPropertyToDebugger(message);
      }
      this.sendMessage('updateErrors', {
        objectId: message.objectId,
        errors: errorsToSend(this.get('_errorsFor')[message.objectId])
      });
    },
    saveProperty: function(message) {
      var value = message.value;
      if (message.dataType && message.dataType === 'date') {
        value = new Date(value);
      }
      this.saveProperty(message.objectId, message.mixinIndex, message.property, value);
    },
    sendToConsole: function(message) {
      this.sendToConsole(message.objectId, message.property);
    },
    sendControllerToConsole: function(message) {
      var container = this.get('application.__container__');
      this.sendValueToConsole(container.lookup('controller:' + message.name));
    },
    sendRouteHandlerToConsole: function(message) {
      var container = this.get('application.__container__');
      this.sendValueToConsole(container.lookup('route:' + message.name));
    },
    inspectRoute: function(message) {
      var container = this.get('application.__container__');
      this.sendObject(container.lookup('router:main').router.getHandler(message.name));
    },
    inspectController: function(message) {
      var container = this.get('application.__container__');
      this.sendObject(container.lookup('controller:' + message.name));
    },
    inspectById: function(message) {
      var obj = this.sentObjects[message.objectId];
      this.sendObject(obj);
    },
    inspectByContainerLookup: function(message) {
      var container = this.get('application.__container__');
      this.sendObject(container.lookup(message.name));
    },
    traceErrors: function(message) {
      var errors = this.get('_errorsFor')[message.objectId];
      var self = this;
      toArray(errors).forEach(function(error) {
        var stack = error.error;
        if (stack && stack.stack) {
          stack = stack.stack;
        } else {
          stack = error;
        }
        self.get('adapter').log('Object Inspector error for ' + error.property, stack);
      });
    }
  },

  canSend: function(val) {
    return (val instanceof EmberObject) || typeOf(val) === 'array';
  },

  saveProperty: function(objectId, mixinIndex, prop, val) {
    var object = this.sentObjects[objectId];
    set(object, prop, val);
  },

  sendToConsole: function(objectId, prop) {
    var object = this.sentObjects[objectId];
    var value;

    if (isNone(prop)) {
      value = this.sentObjects[objectId];
    } else {
      value = get(object, prop);
    }

    this.sendValueToConsole(value);
  },

  sendValueToConsole: function(value) {
    window.$E = value;
    if (value instanceof Error) {
      value = value.stack;
    }
    this.get("adapter").log('Ember Inspector ($E): ', value);
  },

  digIntoObject: function(objectId, property) {
    var parentObject = this.sentObjects[objectId],
      object = get(parentObject, property);

    if (this.canSend(object)) {
      var details = this.mixinsForObject(object);

      this.sendMessage('updateObject', {
        parentObject: objectId,
        property: property,
        objectId: details.objectId,
        name: object.toString(),
        details: details.mixins,
        errors: details.errors
      });
    }
  },

  sendObject: function(object) {
    if (!this.canSend(object)) {
      throw new Error("Can't inspect " + object + ". Only Ember objects and arrays are supported.");
    }
    var details = this.mixinsForObject(object);
    this.sendMessage('updateObject', {
      objectId: details.objectId,
      name: object.toString(),
      details: details.mixins,
      errors: details.errors
    });

  },


  retainObject: function(object) {
    var meta = emberMeta(object),
        guid = guidFor(object),
        self = this;

    meta._debugReferences = meta._debugReferences || 0;
    meta._debugReferences++;

    this.sentObjects[guid] = object;

    if (meta._debugReferences === 1 && object.reopen) {
      // drop object on destruction
      var _oldWillDestroy = object._oldWillDestroy = object.willDestroy;
      object.reopen({
        willDestroy: function() {
          self.dropObject(guid);
          return _oldWillDestroy.apply(this, arguments);
        }
      });
    }

    return guid;
  },

  releaseObject: function(objectId) {
    var object = this.sentObjects[objectId];
    if (!object) {
      return;
    }
    var meta = emberMeta(object),
        guid = guidFor(object);

    meta._debugReferences--;

    if (meta._debugReferences === 0) {
      this.dropObject(guid);
    }

  },

  dropObject: function(objectId) {
    var object = this.sentObjects[objectId];

    if (object.reopen) {
      object.reopen({ willDestroy: object._oldWillDestroy });
      delete object._oldWillDestroy;
    }

    this.removeObservers(objectId);
    delete this.sentObjects[objectId];

    delete this.get('_errorsFor')[objectId];

    this.sendMessage('droppedObject', { objectId: objectId });
  },

  removeObservers: function(objectId) {
    var observers = this.boundObservers[objectId],
        object = this.sentObjects[objectId];

    if (observers) {
      observers.forEach(function(observer) {
        Ember.removeObserver(object, observer.property, observer.handler);
      });
    }

    delete this.boundObservers[objectId];
  },

  mixinsForObject: function(object) {
    var mixins = Ember.Mixin.mixins(object),
        mixinDetails = [];

    var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
    mixinDetails.push({ name: "Own Properties", properties: ownProps, expand: true });

    mixins.forEach(function(mixin) {
      var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor;
      if (!name) {
        name = 'Unknown mixin';
      }
      mixinDetails.push({ name: name.toString(), properties: propertiesForMixin(mixin) });
    });

    fixMandatorySetters(mixinDetails);
    applyMixinOverrides(mixinDetails);

    var propertyInfo = null;
    var debugInfo = getDebugInfo(object);
    if (debugInfo) {
      propertyInfo = getDebugInfo(object).propertyInfo;
      mixinDetails = customizeProperties(mixinDetails, propertyInfo);
    }

    var expensiveProperties = null;
    if (propertyInfo) {
      expensiveProperties = propertyInfo.expensiveProperties;
    }

    var objectId = this.retainObject(object);

    var errorsForObject = this.get('_errorsFor')[objectId] = {};
    calculateCPs(object, mixinDetails, errorsForObject, expensiveProperties);

    this.bindProperties(objectId, mixinDetails);

    var errors = errorsToSend(errorsForObject);
    return { objectId: objectId, mixins: mixinDetails, errors: errors };
  },

  valueForObjectProperty: function(objectId, property, mixinIndex) {
    var object = this.sentObjects[objectId], value;

    if (object.isDestroying) {
      value = '<DESTROYED>';
    } else {
      value = calculateCP(object, property, this.get('_errorsFor')[objectId]);
    }

    if (!value || !(value instanceof CalculateCPError)) {
      value = inspectValue(value);
      value.computed = true;


      return {
        objectId: objectId,
        property: property,
        value: value,
        mixinIndex: mixinIndex
      };
    }
  },

  bindPropertyToDebugger: function(message) {
    var objectId = message.objectId,
        property = message.property,
        mixinIndex = message.mixinIndex,
        computed = message.computed,
        self = this;

    var object = this.sentObjects[objectId];

    function handler() {
      var value = get(object, property);
      value = inspectValue(value);
      value.computed = computed;

      self.sendMessage('updateProperty', {
        objectId: objectId,
        property: property,
        value: value,
        mixinIndex: mixinIndex
      });
    }

    Ember.addObserver(object, property, handler);
    this.boundObservers[objectId] = this.boundObservers[objectId] || [];
    this.boundObservers[objectId].push({ property: property, handler: handler });

  },

  bindProperties: function(objectId, mixinDetails) {
    var self = this;
    mixinDetails.forEach(function(mixin, mixinIndex) {
      mixin.properties.forEach(function(item) {
        if (item.overridden) {
          return true;
        }
        if (item.value.type !== 'type-descriptor' && item.value.type !== 'type-function') {
          var computed = !!item.value.computed;
          self.bindPropertyToDebugger({
            objectId: objectId,
            property: item.name,
            mixinIndex: mixinIndex,
            computed: computed
          });
        }
      });
    });
  },

  inspect: inspect,
  inspectValue: inspectValue
});


function propertiesForMixin(mixin) {
  var properties = [];

  mixin.mixins.forEach(function(mixin) {
    if (mixin.properties) {
      addProperties(properties, mixin.properties);
    }
  });

  return properties;
}

function addProperties(properties, hash) {
  for (var prop in hash) {
    if (!hash.hasOwnProperty(prop)) { continue; }
    if (prop.charAt(0) === '_') { continue; }

    // remove `fooBinding` type props
    if (prop.match(/Binding$/)) { continue; }

    // when mandatory setter is removed, an `undefined` value may be set
    if (hash[prop] === undefined) { continue; }
    var options = { isMandatorySetter: isMandatorySetter(hash, prop) };
    if (isComputed(hash[prop])) {
      options.readOnly = hash[prop]._readOnly;
    }
    replaceProperty(properties, prop, hash[prop], options);
  }
}

function replaceProperty(properties, name, value, options) {
  var found;

  for (var i = 0, l = properties.length; i < l; i++) {
    if (properties[i].name === name) {
      found = i;
      break;
    }
  }

  if (found) { properties.splice(i, 1); }

  var prop = { name: name, value: inspectValue(value) };
  prop.isMandatorySetter = options.isMandatorySetter;
  prop.readOnly = options.readOnly;
  properties.push(prop);
}

function fixMandatorySetters(mixinDetails) {
  var seen = {};
  var propertiesToRemove = [];

  mixinDetails.forEach(function(detail, detailIdx) {
    detail.properties.forEach(function(property) {
      if (property.isMandatorySetter) {
        seen[property.name] = {
          name: property.name,
          value: property.value.inspect,
          detailIdx: detailIdx,
          property: property
        };
      } else if (seen.hasOwnProperty(property.name) && seen[property.name] === property.value.inspect) {
        propertiesToRemove.push(seen[property.name]);
        delete seen[property.name];
      }
    });
  });

  propertiesToRemove.forEach(function(prop) {
    var detail = mixinDetails[prop.detailIdx];
    var index = detail.properties.indexOf(prop.property);
    if (index !== -1) {
      detail.properties.splice(index, 1);
    }
  });

}

function applyMixinOverrides(mixinDetails) {
  var seen = {};
  mixinDetails.forEach(function(detail) {
    detail.properties.forEach(function(property) {
      if (Object.prototype.hasOwnProperty(property.name)) { return; }

      if (seen[property.name]) {
        property.overridden = seen[property.name];
        delete property.value.computed;
      }

      seen[property.name] = detail.name;

    });
  });
}

function isMandatorySetter(object, prop) {
  var descriptor = Object.getOwnPropertyDescriptor(object, prop);
  if (descriptor.set && descriptor.set === Ember.MANDATORY_SETTER_FUNCTION) {
    return true;
  }
  return false;
}

function calculateCPs(object, mixinDetails, errorsForObject, expensiveProperties) {
  expensiveProperties = expensiveProperties || [];

  mixinDetails.forEach(function(mixin) {
    mixin.properties.forEach(function(item) {
      if (item.overridden) {
        return true;
      }
      if (item.value.computed) {
        var cache = Ember.cacheFor(object, item.name);
        if (cache !== undefined || expensiveProperties.indexOf(item.name) === -1) {
          var value = calculateCP(object, item.name, errorsForObject);
          if (!value || !(value instanceof CalculateCPError)) {
            item.value = inspectValue(value);
            item.value.computed = true;
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
  var newMixinDetails = [],
      neededProperties = {},
      groups = propertyInfo.groups || [],
      skipProperties = propertyInfo.skipProperties || [],
      skipMixins = propertyInfo.skipMixins || [];

  if (groups.length) {
    mixinDetails[0].expand = false;
  }

  groups.forEach(function(group) {
    group.properties.forEach(function(prop) {
      neededProperties[prop] = true;
    });
  });

  mixinDetails.forEach(function(mixin) {
    var newProperties = [];
    mixin.properties.forEach(function(item) {
      if (skipProperties.indexOf(item.name) !== -1) {
        return true;
      }
      if (!item.overridden && neededProperties.hasOwnProperty(item.name) && neededProperties[item.name]) {
        neededProperties[item.name] = item;
      } else {
        newProperties.push(item);
      }
    });
    mixin.properties = newProperties;
    if (skipMixins.indexOf(mixin.name) === -1) {
      newMixinDetails.push(mixin);
    }
  });

  groups.slice().reverse().forEach(function(group) {
    var newMixin = { name: group.name, expand: group.expand, properties: [] };
    group.properties.forEach(function(prop) {
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
  var debugInfo = null;
  if (object._debugInfo && typeof object._debugInfo === 'function') {
    debugInfo = object._debugInfo();
  }
  debugInfo = debugInfo || {};
  var propertyInfo = debugInfo.propertyInfo || (debugInfo.propertyInfo = {});
  var skipProperties = propertyInfo.skipProperties = propertyInfo.skipProperties || (propertyInfo.skipProperties = []);

  skipProperties.push('isDestroyed', 'isDestroying', 'container');
  // 'currentState' and 'state' are un-observable private properties.
  // The rest are skipped to reduce noise in the inspector.
  if (object instanceof Ember.View) {
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
      'states'
    );
  }


  for (var prop in object) {
    // remove methods
    if (typeof object[prop] === 'function') {
      skipProperties.push(prop);
    }

  }
  return debugInfo;
}

function isComputed(value) {
  return value instanceof ComputedProperty;
}

function toArray(errors) {
  return keys(errors).map(function(key) {
    return errors[key];
  });
}

function calculateCP(object, property, errorsForObject) {
  delete errorsForObject[property];
  try {
    return get(object, property);
  } catch (e) {
    errorsForObject[property] = {
      property: property,
      error: e
    };
    return new CalculateCPError();
  }
}

function CalculateCPError() {}

function errorsToSend(errors) {
  return toArray(errors).map(function(error) {
    return { property: error.property };
  });
}

export default ObjectInspector;
