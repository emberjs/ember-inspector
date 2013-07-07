import "mixins/port_mixin" as PortMixin;

var ObjectInspector = Ember.Object.extend(PortMixin, {
  namespace: null,

  port: Ember.computed.alias('namespace.port'),

  application: Ember.computed.alias('namespace.application'),

  init: function() {
    this._super();
    this.set('sentObjects', {});
    this.set('boundObservers', {});
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
      this.bindPropertyToDebugger(message);
    },
    inspectRoute: function(message) {
      var container = this.get('application.__container__');
      this.sendObject(container.lookup('router:main').router.getHandler(message.name));
    }
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
        guid = Ember.guidFor(object);

    meta._debugReferences = meta._debugReferences || 0;
    meta._debugReferences++;

    this.sentObjects[guid] = object;

    return guid;
  },

  releaseObject: function(objectId) {
    var object = this.sentObjects[objectId];

    var meta = Ember.meta(object),
        guid = Ember.guidFor(object);

    meta._debugReferences--;

    if (meta._debugReferences === 0) {
      this.dropObject(guid);
    }
  },

  dropObject: function(objectId) {
    var observers = this.boundObservers[objectId],
        object = this.sentObjects[objectId];

    if (observers) {
      observers.forEach(function(observer) {
        Ember.removeObserver(object, observer.property, observer.handler);
      });
    }

    delete this.boundObservers[objectId];
    delete this.sentObjects[objectId];
  },

  mixinsForObject: function(object) {
    var mixins = Ember.Mixin.mixins(object),
        mixinDetails = [];

    var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
    mixinDetails.push({ name: "Own Properties", properties: ownProps });

    mixins.forEach(function(mixin) {
      mixin.toString();
      var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
      mixinDetails.push({ name: name.toString(), properties: propertiesForMixin(mixin) });
    });

    applyMixinOverrides(mixinDetails);

    return { objectId: this.retainObject(object), mixins: mixinDetails };
  },

  valueForObjectProperty: function(objectId, property, mixinIndex) {
    var object = this.sentObjects[objectId], value;

    if (object.isDestroying) {
      value = '<DESTROYED>';
    } else {
      value = object.get(property);
    }

    return {
      objectId: objectId,
      property: property,
      value: inspect(value),
      mixinIndex: mixinIndex
    };
  },

  bindPropertyToDebugger: function(message) {
    var objectId = message.objectId,
        property = message.property,
        mixinIndex = message.mixinIndex,
        self = this;

    var object = this.sentObjects[objectId];

    function handler() {
      var value = Ember.get(object, property);

      self.sendMessage('updateProperty', {
        objectId: objectId,
        property: property,
        value: inspect(value),
        mixinIndex: mixinIndex
      });
    }

    Ember.addObserver(object, property, handler);
    this.boundObservers[objectId] = this.boundObservers[objectId] || [];
    this.boundObservers[objectId].push({ property: property, handler: handler });
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
    if (isMandatorySetter(hash, prop)) { continue; }

    replaceProperty(properties, prop, hash[prop]);
  }
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
}


function replaceProperty(properties, name, value) {
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

  properties.push({ name: name, value: inspectValue(value) });
}



function inspectValue(value) {
  var string;

  if (value instanceof Ember.Object) {
    return { type: "type-ember-object", inspect: value.toString() };
  } else if (value instanceof Ember.ComputedProperty) {
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

// Not used
function inspectController(controller) {
  return controller.get('_debugContainerKey') || controller.toString();
}


export = ObjectInspector;
