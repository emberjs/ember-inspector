import Ember from "ember";
import { module, test } from 'qunit';

var EmberDebug;
var port, name, message;
var run = Ember.run;
var App;
var objectInspector;
var computed = Ember.computed;
var compile = Ember.Handlebars.compile;

function setupApp() {
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });

  App.SimpleView = Ember.View;

  Ember.TEMPLATES.simple = compile('Simple {{input class="simple-input"}} {{view "simple" classNames="simple-view"}}');
}

module("Ember Debug - Object Inspector", {
  beforeEach() {
    /* globals require */
    EmberDebug = require('ember-debug/main')["default"];
    EmberDebug.Port = EmberDebug.Port.extend({
      init: function() {},
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
    run(function() {
      setupApp();
      EmberDebug.set('application', App);
    });
    run(EmberDebug, 'start');
    objectInspector = EmberDebug.get('objectInspector');
    port = EmberDebug.port;
  },
  afterEach() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("An Ember Object is correctly transformed into an inspection hash", function(assert) {
  var date = new Date();

  var Parent = Ember.Object.extend({
    id: null,
    name: 'My Object'
  });

  Parent.reopenClass({
    toString: function() {
      return 'Parent Object';
    }
  });

  var inspected = Parent.create({
    id: 1,
    toString: function() {
      return 'Object:' + this.get('name');
    },
    nullVal: null,
    dateVal: date
  });

  objectInspector.sendObject(inspected);

  assert.equal(name, 'objectInspector:updateObject');

  assert.equal(message.name, 'Object:My Object');

  var firstDetail = message.details[0];
  assert.equal(firstDetail.name, 'Own Properties');

  assert.equal(firstDetail.properties.length, 3, 'methods are not included');

  var idProperty = firstDetail.properties[0];
  assert.equal(idProperty.name, 'id');
  assert.equal(idProperty.value.type, 'type-number');
  assert.equal(idProperty.value.inspect, '1');

  var nullProperty = firstDetail.properties[1];
  assert.equal(nullProperty.name, 'nullVal');
  assert.equal(nullProperty.value.type, 'type-null');
  assert.equal(nullProperty.value.inspect, 'null');

  var prop = firstDetail.properties[2];
  assert.equal(prop.name, 'dateVal');
  assert.equal(prop.value.type, 'type-date');
  assert.equal(prop.value.inspect, date.toString());

  var secondDetail = message.details[1];
  assert.equal(secondDetail.name, 'Parent Object');

  idProperty = secondDetail.properties[0];
  assert.equal(idProperty.name, 'id');
  assert.equal(idProperty.overridden, 'Own Properties');

  var nameProperty = secondDetail.properties[1];
  assert.equal(nameProperty.name, 'name');
  assert.equal(nameProperty.value.inspect, 'My Object');

});

test("Computed properties are correctly calculated", function(assert) {
  var inspected = Ember.Object.extend({
    hi: computed(function() {
      return 'Hello';
    }).property(),
    _debugInfo: function() {
      return {
        propertyInfo: {
          expensiveProperties: ['hi']
        }
      };
    }
  }).create();

  objectInspector.sendObject(inspected);

  var computedProperty = message.details[1].properties[0];

  assert.equal(computedProperty.name, 'hi');
  assert.ok(computedProperty.value.computed);
  assert.equal(computedProperty.value.type, 'type-descriptor');
  assert.equal(computedProperty.value.inspect, '<computed>');

  var id = message.objectId;

  port.trigger('objectInspector:calculate', {
    objectId: id,
    property: 'hi',
    mixinIndex: 1
  });

  assert.equal(message.objectId, id);
  assert.equal(message.property, 'hi');
  assert.equal(message.mixinIndex, 1);
  assert.equal(message.value.type, 'type-string');
  assert.equal(message.value.inspect, 'Hello');
  assert.ok(message.value.computed);

});

test("Cached Computed properties are pre-calculated", function(assert) {
  var inspected = Ember.Object.extend({
    hi: computed(function() {
      return 'Hello';
    }).property()
  }).create();

  // pre-calculate CP
  inspected.get('hi');

  objectInspector.sendObject(inspected);

  var computedProperty = message.details[1].properties[0];

  assert.equal(computedProperty.name, 'hi');
  assert.ok(computedProperty.value.computed);
  assert.equal(computedProperty.value.type, 'type-string');
  assert.equal(computedProperty.value.inspect, 'Hello');

});

test("Properties are correctly bound", function(assert) {
  var inspected = Ember.Object.extend({
    name: 'Teddy',

    hi: computed(function(key, val) {
      if (val !== undefined) {
        return val;
      }
      return 'hello';
    }).property(),

    _debugInfo: function() {
      return {
        propertyInfo: {
          expensiveProperties: ['hi']
        }
      };
    }

  }).create();

  objectInspector.sendObject(inspected);

  var id = message.objectId;

  inspected.set('name', 'Alex');

  assert.equal(name, 'objectInspector:updateProperty');

  assert.equal(message.objectId, id);
  assert.equal(message.property, 'name');
  assert.equal(message.mixinIndex, 1);
  assert.equal(message.value.computed, false);
  assert.equal(message.value.inspect, 'Alex');
  assert.equal(message.value.type, 'type-string');

  // un-cached computed properties are not bound until calculated

  message = null;

  inspected.set('hi', 'Hey');

  assert.equal(message, null, 'Computed properties are not bound as long as they haven\'t been calculated');

  port.trigger('objectInspector:calculate', {
    objectId: id,
    property: 'hi',
    mixinIndex: 1
  });

  message = null;
  inspected.set('hi', 'Hello!');

  assert.equal(message.objectId, id);
  assert.equal(message.property, 'hi');
  assert.equal(message.mixinIndex, 1);
  assert.ok(message.value.computed);
  assert.equal(message.value.inspect, 'Hello!');
  assert.equal(message.value.type, 'type-string');

});

test("Properties can be updated through a port message", function(assert) {
  var inspected = Ember.Object.extend({
    name: 'Teddy'
  }).create();

  objectInspector.sendObject(inspected);

  var id = message.objectId;

  port.trigger('objectInspector:saveProperty', {
    objectId: id,
    mixinIndex: 1,
    property: 'name',
    value: 'Alex'
  });

  assert.equal(inspected.get('name'), 'Alex');

  // A property updated message is published
  assert.equal(name, 'objectInspector:updateProperty');
  assert.equal(message.property, 'name');
  assert.equal(message.value.inspect, 'Alex');
  assert.equal(message.value.type, 'type-string');
});

test("Date properties are converted to dates before being updated", function(assert) {
  var newDate = new Date('2015-01-01');

  var inspected = Ember.Object.extend({
    date: null
  }).create();

  objectInspector.sendObject(inspected);

  var id = message.objectId;

  port.trigger('objectInspector:saveProperty', {
    objectId: id,
    mixinIndex: 1,
    property: 'date',
    value: newDate.getTime(),
    dataType: 'date'
  });

  assert.equal(inspected.get('date').getFullYear(), 2015);
  assert.equal(inspected.get('date').getMonth(), 0);
  assert.equal(inspected.get('date').getDate(), 1);
});

test("Property grouping can be customized using _debugInfo", function(assert) {
  var mixinToSkip = Ember.Mixin.create({});
  mixinToSkip[Ember.NAME_KEY] = 'MixinToSkip';

  var Inspected = Ember.Object.extend(mixinToSkip, {
    name: 'Teddy',
    gender: 'Male',
    hasChildren: false,
    expensiveProperty: computed(function() { return ''; }).property(),
    _debugInfo: function() {
      return {
        propertyInfo: {
            includeOtherProperties: true,
            skipProperties: ['propertyToSkip'],
            skipMixins: ['MixinToSkip'],
            expensiveProperties: ['expensiveProperty'],
            groups: [
              {
                name: 'Basic Info',
                properties: ['name', 'gender'],
                expand: true
              },
              {
                name: 'Family Info',
                properties: ['maritalStatus']
              }
            ]
          }
      };
    }
  });

  Inspected.toString = function() {
    return 'TestObject';
  };

  var inspected = Inspected.create({
    maritalStatus: 'Single',
    propertyToSkip: null
  });

  objectInspector.sendObject(inspected);

  assert.equal(message.details[0].name, 'Basic Info');
  assert.equal(message.details[0].properties[0].name, 'name');
  assert.equal(message.details[0].properties[1].name, 'gender');
  assert.ok(message.details[0].expand);

  assert.equal(message.details[1].name, 'Family Info');
  assert.equal(message.details[1].properties[0].name, 'maritalStatus');

  assert.equal(message.details[2].name, 'Own Properties');
  assert.equal(message.details[2].properties.length, 0, "Correctly skips properties");

  assert.equal(message.details[3].name, 'TestObject');
  assert.equal(message.details[3].properties.length, 2, "Does not duplicate properties");
  assert.equal(message.details[3].properties[0].name, 'hasChildren');
  assert.equal(message.details[3].properties[1].value.type, 'type-descriptor', "Does not calculate expensive properties");

  assert.ok(message.details[4].name !== 'MixinToSkip', "Correctly skips properties");

});

test("Read Only Computed properties mush have a readOnly property", function(assert) {
  var inspected = Ember.Object.extend({
    readCP: computed(function() {}).property().readOnly(),
    writeCP: computed(function() {}).property()
  }).create();

  objectInspector.sendObject(inspected);

  var properties = message.details[1].properties;

  assert.ok(properties[0].readOnly);
  assert.ok(!properties[1].readOnly);
});

test("Views are correctly handled when destroyed during transitions", function(assert) {
  var objectId = null;

  visit('/simple');

  andThen(function() {
    objectId = find('.simple-view').get(0).id;
    var view = Ember.View.views[objectId];
    objectInspector.sendObject(view);
    return wait();
  });

  andThen(function() {
    assert.ok(!!objectInspector.sentObjects[objectId], "Object successfully retained.");
  });

  visit('/');

  andThen(function() {
    assert.ok(true, "No exceptions thrown");
  });
});

test("Objects are dropped on destruction", function(assert) {
  var didDestroy = false;
  var object = Ember.Object.create({
    willDestroy: function() {
      didDestroy = true;
    }
  });
  var objectId = Ember.guidFor(object);

  wait()
  .then(function() {
    objectInspector.sendObject(object);
    return wait();
  })
  .then(function() {
    assert.ok(!!objectInspector.sentObjects[objectId]);
    object.destroy();
    return wait();
  })
  .then(function() {
    assert.ok(didDestroy, 'Original willDestroy is preserved.');
    assert.ok(!objectInspector.sentObjects[objectId], 'Object is dropped');
    assert.equal(name, 'objectInspector:droppedObject');
    assert.deepEqual(message, { objectId: objectId });
  });

});

test("Properties ending with `Binding` are skipped", function(assert) {
  var object = Ember.Object.create({
    bar: 'test',
    fooBinding: 'bar'
  });

  wait();

  andThen(function() {
    objectInspector.sendObject(object);
    return wait();
  });

  andThen(function() {
    var props = message.details[0].properties;
    assert.equal(props.length, 2, "Props should be foo and bar without fooBinding");
    assert.equal(props[0].name, 'bar');
    assert.equal(props[1].name, 'foo');
  });
});

test("Properties listed in _debugInfo but don't exist should be skipped silently", function(assert) {
  var object = Ember.Object.create({
    foo: 'test',
    _debugInfo: function() {
      return {
        propertyInfo: {
          groups: [{
            name: 'Attributes', properties: ['foo', 'bar']
          }]
        }
      };
    }

  });

  wait();

  andThen(function() {
    objectInspector.sendObject(object);
    return wait();
  });

  andThen(function() {
    var props = message.details[0].properties;
    assert.equal(props.length, 1, "bar should be silently skipped");
    assert.equal(props[0].name, 'foo');
  });
});
