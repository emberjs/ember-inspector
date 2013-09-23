import PortMixin from "mixins/port_mixin";

var ObjectInspector = Ember.Object.extend(PortMixin, {
  namespace: null,

  port: Ember.computed.alias('namespace.port'),

  application: Ember.computed.alias('namespace.application'),

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
      this.sendMessage('updateProperty', value);
      message.computed = true;
      this.bindPropertyToDebugger(message);
    },
    saveProperty: function(message) {
      this.saveProperty(message.objectId, message.mixinIndex, message.property, message.value);
    },
    sendToConsole: function(message) {
      this.sendToConsole(message.objectId, message.property);
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
    }
  },

  saveProperty: function(objectId, mixinIndex, prop, val) {
    var object = this.sentObjects[objectId];
    Ember.set(object, prop, val);
  },

  sendToConsole: function(objectId, prop) {
    var object = this.sentObjects[objectId];
    var value;

    if (Ember.isNone(prop)) {
      value = this.sentObjects[objectId];
    } else {
      value =  Ember.get(object, prop);
    }

    window.$E = value;
    console.log('Ember Inspector ($E): ', value);
  },

  digIntoObject: function(objectId, property) {
    var parentObject = this.sentObjects[objectId],
      object = Ember.get(parentObject, property);

    if (object instanceof Ember.Object) {
      var details = this.mixinsForObject(object);

      this.sendMessage('updateObject', {
        parentObject: objectId,
        property: property,
        objectId: details.objectId,
        name: object.toString(),
        details: details.mixins
      });
    }
  },

  sendObject: function(object) {
    var details = this.mixinsForObject(object);
    this.sendMessage('updateObject', {
      objectId: details.objectId,
      name: object.toString(),
      details: details.mixins
    });

  },


  retainObject: function(object) {
    var meta = Ember.meta(object),
        guid = Ember.guidFor(object),
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
    if(!object) {
      return;
    }
    var meta = Ember.meta(object),
        guid = Ember.guidFor(object);

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
        mixinDetails = [],
        self = this;

    var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
    mixinDetails.push({ name: "Own Properties", properties: ownProps, expand: true });

    mixins.forEach(function(mixin) {
      var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
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
    calculateCPs(object, mixinDetails, expensiveProperties);

    var objectId = this.retainObject(object);

    this.bindProperties(objectId, mixinDetails);

    return { objectId: objectId, mixins: mixinDetails };
  },

  valueForObjectProperty: function(objectId, property, mixinIndex) {
    var object = this.sentObjects[objectId], value;

    if (object.isDestroying) {
      value = '<DESTROYED>';
    } else {
      value = object.get(property);
    }

    value = inspectValue(value);
    value.computed = true;

    return {
      objectId: objectId,
      property: property,
      value: value,
      mixinIndex: mixinIndex
    };
  },

  bindPropertyToDebugger: function(message) {
    var objectId = message.objectId,
        property = message.property,
        mixinIndex = message.mixinIndex,
        computed = message.computed,
        self = this;

    var object = this.sentObjects[objectId];

    function handler() {
      var value = Ember.get(object, property);
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
  }
});


function propertiesForMixin(mixin) {
  var seen = {}, properties = [];

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
  var found, type;

  for (var i=0, l=properties.length; i<l; i++) {
    if (properties[i].name === name) {
      found = i;
      break;
    }
  }

  if (found) { properties.splice(i, 1); }

  if (name) {
    type = name.PrototypeMixin ? 'ember-class' : 'ember-mixin';
  }
  var prop = { name: name, value: inspectValue(value) };
  prop.isMandatorySetter = options.isMandatorySetter;
  prop.readOnly = options.readOnly;
  properties.push(prop);
}

function fixMandatorySetters(mixinDetails) {
  var seen = {};
  var propertiesToRemove = [];

  mixinDetails.forEach(function(detail, detailIdx) {
    detail.properties.forEach(function(property, propertyIdx) {
      if(property.isMandatorySetter) {
        seen[property.name] = {
          name: property.name,
          value: property.value.inspect,
          detailIdx: detailIdx,
          property: property
        };
      } else if(seen.hasOwnProperty(property.name) && seen[property.name] === property.value.inspect) {
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

function inspectValue(value) {
  var string;

  if (value instanceof Ember.Object) {
    return { type: "type-ember-object", inspect: value.toString() };
  } else if (isComputed(value)) {
    string = "<computed>";
    return { type: "type-descriptor", inspect: string, computed: true };
  } else if (value instanceof Ember.Descriptor) {
    return { type: "type-descriptor", inspect: value.toString(), computed: true };
  } else {
    return { type: "type-" + Ember.typeOf(value), inspect: inspect(value) };
  }
}



function inspect(value) {
  if (typeof value === 'function') {
    return "function() { ... }";
  } else if (value instanceof Ember.Object) {
    return value.toString();
  } else if (Ember.typeOf(value) === 'array') {
    if (value.length === 0) { return '[]'; }
    else if (value.length === 1) { return '[ ' + inspect(value[0]) + ' ]'; }
    else { return '[ ' + inspect(value[0]) + ', ... ]'; }
  } else {
    return Ember.inspect(value);
  }
}

function calculateCPs(object, mixinDetails, expensiveProperties) {
  expensiveProperties = expensiveProperties || [];

  mixinDetails.forEach(function(mixin) {
    mixin.properties.forEach(function(item) {
      if (item.overridden) {
        return true;
      }
      if (item.value.computed) {
        var cache = Ember.cacheFor(object, item.name);
        if (cache !== undefined || expensiveProperties.indexOf(item.name) === -1) {
          item.value = inspectValue(Ember.get(object, item.name));
          item.value.computed = true;
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

  if(groups.length) {
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
      newMixin.properties.push(neededProperties[prop]);
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
  skipProperties.push('isDestroyed', 'isDestroying');
  // Views have un-observable private properties.
  // These should be excluded
  if (object instanceof Ember.View) {
    skipProperties.push('currentState', 'state');
  }

  return debugInfo;
}

function isComputed(value) {
  return value instanceof Ember.ComputedProperty;
}

// Not used
function inspectController(controller) {
  return controller.get('_debugContainerKey') || controller.toString();
}

export default ObjectInspector;
