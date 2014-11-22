import Ember from "ember";

var EmberDebug;
var port, name, message;
var run = Ember.run;
var App;
var objectInspector;
var computed = Ember.computed;
var compile = Ember.Handlebars.compile;

function setupApp(){
  App = Ember.Application.create();
  App.setupForTesting();
  App.injectTestHelpers();

  App.Router.map(function() {
    this.route('simple');
  });

  Ember.TEMPLATES.simple = compile('Simple {{input class="simple-input"}} {{view Ember.View classNames="simple-view"}}');
}

module("Object Inspector", {
  setup: function() {
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
  teardown: function() {
    name = null;
    message = null;
    EmberDebug.destroyContainer();
    run(App, 'destroy');
  }
});

test("An Ember Object is correctly transformed into an inspection hash", function() {
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

  equal(name, 'objectInspector:updateObject');

  equal(message.name, 'Object:My Object');

  var firstDetail = message.details[0];
  equal(firstDetail.name, 'Own Properties');

  equal(firstDetail.properties.length, 3, 'methods are not included');

  var idProperty = firstDetail.properties[0];
  equal(idProperty.name, 'id');
  equal(idProperty.value.type, 'type-number');
  equal(idProperty.value.inspect, '1');

  var nullProperty = firstDetail.properties[1];
  equal(nullProperty.name, 'nullVal');
  equal(nullProperty.value.type, 'type-null');
  equal(nullProperty.value.inspect, 'null');

  var prop = firstDetail.properties[2];
  equal(prop.name, 'dateVal');
  equal(prop.value.type, 'type-date');
  equal(prop.value.inspect, date.toString());

  var secondDetail = message.details[1];
  equal(secondDetail.name, 'Parent Object');

  idProperty = secondDetail.properties[0];
  equal(idProperty.name, 'id');
  equal(idProperty.overridden, 'Own Properties');

  var nameProperty = secondDetail.properties[1];
  equal(nameProperty.name, 'name');
  equal(nameProperty.value.inspect, 'My Object');

});

test("Computed properties are correctly calculated", function() {
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

  equal(computedProperty.name, 'hi');
  ok(computedProperty.value.computed);
  equal(computedProperty.value.type, 'type-descriptor');
  equal(computedProperty.value.inspect, '<computed>');

  var id = message.objectId;

  port.trigger('objectInspector:calculate', {
    objectId: id,
    property: 'hi',
    mixinIndex: 1
  });

  equal(message.objectId, id);
  equal(message.property, 'hi');
  equal(message.mixinIndex, 1);
  equal(message.value.type, 'type-string');
  equal(message.value.inspect, 'Hello');
  ok(message.value.computed);

});

test("Cached Computed properties are pre-calculated", function() {
  var inspected = Ember.Object.extend({
    hi: computed(function() {
      return 'Hello';
    }).property()
  }).create();

  // pre-calculate CP
  inspected.get('hi');

  objectInspector.sendObject(inspected);

  var computedProperty = message.details[1].properties[0];

  equal(computedProperty.name, 'hi');
  ok(computedProperty.value.computed);
  equal(computedProperty.value.type, 'type-string');
  equal(computedProperty.value.inspect, 'Hello');

});

test("Properties are correctly bound", function() {
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

  equal(name, 'objectInspector:updateProperty');

  equal(message.objectId, id);
  equal(message.property, 'name');
  equal(message.mixinIndex, 1);
  equal(message.value.computed, false);
  equal(message.value.inspect, 'Alex');
  equal(message.value.type, 'type-string');

  // un-cached computed properties are not bound until calculated

  message = null;

  inspected.set('hi', 'Hey');

  equal(message, null, 'Computed properties are not bound as long as they haven\'t been calculated');

  port.trigger('objectInspector:calculate', {
    objectId: id,
    property: 'hi',
    mixinIndex: 1
  });

  message = null;
  inspected.set('hi', 'Hello!');

  equal(message.objectId, id);
  equal(message.property, 'hi');
  equal(message.mixinIndex, 1);
  ok(message.value.computed);
  equal(message.value.inspect, 'Hello!');
  equal(message.value.type, 'type-string');

});

test("Properties can be updated through a port message", function() {
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

  equal(inspected.get('name'), 'Alex');

  // A property updated message is published
  equal(name, 'objectInspector:updateProperty');
  equal(message.property, 'name');
  equal(message.value.inspect, 'Alex');
  equal(message.value.type, 'type-string');
});

test("Date properties are converted to dates before being updated", function() {
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

  equal(inspected.get('date').getFullYear(), 2015);
  equal(inspected.get('date').getMonth(), 0);
  equal(inspected.get('date').getDate(), 1);
});

test("Property grouping can be customized using _debugInfo", function() {
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

  equal(message.details[0].name, 'Basic Info');
  equal(message.details[0].properties[0].name, 'name');
  equal(message.details[0].properties[1].name, 'gender');
  ok(message.details[0].expand);

  equal(message.details[1].name, 'Family Info');
  equal(message.details[1].properties[0].name, 'maritalStatus');

  equal(message.details[2].name, 'Own Properties');
  equal(message.details[2].properties.length, 0, "Correctly skips properties");

  equal(message.details[3].name, 'TestObject');
  equal(message.details[3].properties.length, 2, "Does not duplicate properties");
  equal(message.details[3].properties[0].name, 'hasChildren');
  equal(message.details[3].properties[1].value.type, 'type-descriptor', "Does not calculate expensive properties");

  ok(message.details[4].name !== 'MixinToSkip', "Correctly skips properties");

});

test("Read Only Computed properties mush have a readOnly property", function() {
  var inspected = Ember.Object.extend({
    readCP: computed(function() {}).property().readOnly(),
    writeCP: computed(function() {}).property()
  }).create();

  objectInspector.sendObject(inspected);

  var properties = message.details[1].properties;

  ok(properties[0].readOnly);
  ok(!properties[1].readOnly);
});

test("Views are correctly handled when destroyed during transitions", function() {
  var objectId = null;

  visit('/simple');

  andThen(function() {
    objectId = find('.simple-view').get(0).id;
    var view = Ember.View.views[objectId];
    objectInspector.sendObject(view);
    return wait();
  });

  andThen(function() {
    ok(objectInspector.sentObjects[objectId], "Object successfully retained.");
  });

  visit('/');

  andThen (function() {
    ok(true, "No exceptions thrown");
  });
});

test("Objects are dropped on destruction", function() {
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
    ok(!!objectInspector.sentObjects[objectId]);
    object.destroy();
    return wait();
  })
  .then(function() {
    ok(didDestroy, 'Original willDestroy is preserved.');
    ok(!objectInspector.sentObjects[objectId], 'Object is dropped');
    equal(name, 'objectInspector:droppedObject');
    deepEqual(message, { objectId: objectId });
  });

});

test("Properties ending with `Binding` are skipped", function() {
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
    equal(props.length, 2, "Props should be foo and bar without fooBinding");
    equal(props[0].name, 'bar');
    equal(props[1].name, 'foo');
  });
});

test("Properties listed in _debugInfo but don't exist should be skipped silently", function() {
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
    equal(props.length, 1, "bar should be silently skipped");
    equal(props[0].name, 'foo');
  });
});
