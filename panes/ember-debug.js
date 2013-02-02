(function() {

if (Ember.Debug) { return; }

var port;

var channel = new MessageChannel(), port1 = channel.port1;
window.postMessage('debugger-client', [channel.port2], '*');

port1.addEventListener('message', function(event) {
  var message = event.data, value;

  if (message.type === 'calculate') {
    value = valueForObjectProperty(message.objectId, message.property, message.mixinIndex);
    port1.postMessage(value);
  } else if (message.type === 'digDeeper') {
    value = digIntoObject(message.objectId, message.property);
    if (value) { port1.postMessage(value); }
  }
});

port1.start();

var sentObjects = {},
    sentObjectId = 0;

function mixinsForObject(object) {
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

  sentObjects[++sentObjectId] = object;
  return { objectId: sentObjectId, mixins: mixinDetails };
}

function valueForObjectProperty(objectId, property, mixinIndex) {
  var object = sentObjects[objectId], value;

  if (object.isDestroying) {
    value = '<DESTROYED>';
  } else {
    value = object.get(property);
  }

  return { from: 'inspectedWindow', objectId: objectId, property: property, value: inspect(value), mixinIndex: mixinIndex };
}

function digIntoObject(objectId, property) {
  var parentObject = sentObjects[objectId],
      object = Ember.get(parentObject, property);

  if (object instanceof Ember.Object) {
    var details = mixinsForObject(object);
    port1.postMessage({ from: 'inspectedWindow', parentObject: objectId, property: property, objectId: details.objectId, name: object.toString(), details: details.mixins });
  } else {
    console.log(object);
  }
}

Ember.Debug = Ember.Namespace.create();

Ember.Debug.mixinsForObject = function(object) {
  var details = mixinsForObject(object);
  port1.postMessage({ from: 'inspectedWindow', objectId: details.objectId, name: object.toString(), details: details.mixins });
};

Ember.Debug.valueForObjectProperty = valueForObjectProperty;

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
    replaceProperty(properties, prop, hash[prop]);
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
    if (!value._dependentKeys) { string = "<computed>"; }
    else { string = "<computed> \u27a4 " + value._dependentKeys.join(", "); }
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

})();
