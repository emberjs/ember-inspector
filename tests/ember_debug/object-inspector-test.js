import { find, settled, visit } from '@ember/test-helpers';
import Mixin from '@ember/object/mixin';
import Component from '@ember/component';
import { inspect } from '@ember/debug';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';
import EmberObject, { computed } from '@ember/object';
import Service from '@ember/service';
import { VERSION } from '@ember/version';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import require from 'require';
import { destroyEIApp, setupEIApp } from '../helpers/setup-destroy-ei-app';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

let EmberDebug;
let port, name, message;
let App;
let objectInspector;

function setupApp() {
  this.owner.register('component:x-simple', Component);
  this.owner.register('template:simple', hbs`Simple {{input class="simple-input"}} {{x-simple class="simple-view"}}`);
}

let ignoreErrors = true;

module('Ember Debug - Object Inspector', function(hooks) {
  // eslint-disable-next-line object-shorthand
  hooks.beforeEach(async function() {
    EmberDebug = require('ember-debug/main').default;
    EmberDebug.Port = EmberDebug.Port.extend({
      init() { },
      send(n, m) {
        if (ignoreErrors && n.match(/[Ee]rror/)) {
          return;
        }
        name = n;
        message = m;
      }
    });

    App = await setupEIApp.call(this, EmberDebug, function() {
      this.route('simple');
    });

    setupApp.call(this);

    await settled();
    objectInspector = EmberDebug.get('objectInspector');
    port = EmberDebug.port;
  });

  hooks.afterEach(async function() {
    name = null;
    message = null;
    await destroyEIApp.call(this, EmberDebug, App);
  });

  test('An Ember Object is correctly transformed into an inspection hash', function(assert) {
    let date = new Date();

    let Parent = EmberObject.extend({
      id: null,
      name: 'My Object'
    });

    Parent.reopenClass({
      toString() {
        return 'Parent Object';
      }
    });

    let inspected = Parent.create({
      id: 1,
      toString() {
        return `Object:${this.get('name')}`;
      },
      nullVal: null,
      dateVal: date
    });

    objectInspector.sendObject(inspected);

    assert.equal(name, 'objectInspector:updateObject');

    assert.equal(message.name, 'Object:My Object');

    let firstDetail = message.details[0];
    assert.equal(firstDetail.name, 'Own Properties');

    assert.equal(firstDetail.properties.length, 5, 'methods are included');

    let idProperty = firstDetail.properties[0];
    assert.equal(idProperty.name, 'id');
    assert.equal(idProperty.value.type, 'type-number');
    assert.equal(idProperty.value.inspect, '1');

    let toStringProperty = firstDetail.properties[1];
    assert.equal(toStringProperty.name, 'toString');
    assert.equal(toStringProperty.value.type, 'type-function');

    let nullProperty = firstDetail.properties[2];
    assert.equal(nullProperty.name, 'nullVal');
    assert.equal(nullProperty.value.type, 'type-null');
    assert.equal(nullProperty.value.inspect, 'null');

    let prop = firstDetail.properties[3];
    assert.equal(prop.name, 'dateVal');
    assert.equal(prop.value.type, 'type-date');
    assert.equal(prop.value.inspect, date.toString());

    let nameProperty = firstDetail.properties[4];
    assert.equal(nameProperty.name, 'name');
    assert.equal(nameProperty.value.inspect, inspect('My Object'));

    let secondDetail = message.details[1];
    assert.equal(secondDetail.name, '(unknown)');
  });

  test('An ES6 Class is correctly transformed into an inspection hash', function(assert) {
    const compareVersion = require('ember-debug/utils/version').compareVersion;
    if (compareVersion(VERSION, '3.9.0') === -1) {
      assert.expect(0);
      return;
    }
    let date = new Date();

    class Parent {
      // eslint-disable-next-line constructor-super
      constructor(param) {
        Object.assign(this, param);
      }

      id = null;
      name = 'My Object';

      toString() {
        return 'Parent Object';
      }

      get(k) {
        return this[k];
      }

      @computed
      get aCP() {
        return true;
      }
    }

    let inspected = new Parent({
      id: 1,
      toString() {
        return `Object:${this.get('name')}`;
      },
      nullVal: null,
      dateVal: date
    });

    objectInspector.sendObject(inspected);

    assert.equal(name, 'objectInspector:updateObject');

    assert.equal(message.name, 'Object:My Object');

    let firstDetail = message.details[0];
    assert.equal(firstDetail.name, 'Own Properties');

    assert.equal(firstDetail.properties.length, 7, 'methods are included');


    let idProperty = firstDetail.properties[0];
    assert.equal(idProperty.name, 'id');
    assert.equal(idProperty.value.type, 'type-number');
    assert.equal(idProperty.value.inspect, '1');

    let nullProperty = firstDetail.properties[1];
    assert.equal(nullProperty.name, 'name');
    assert.equal(nullProperty.value.type, 'type-string');
    assert.equal(nullProperty.value.inspect, '"My Object"');

    let prop = firstDetail.properties[2];

    assert.equal(prop.name, 'toString');
    assert.equal(prop.value.type, 'type-function');

    prop = firstDetail.properties[3];
    assert.equal(prop.name, 'nullVal');
    assert.equal(prop.value.type, 'type-null');
    assert.equal(prop.value.inspect, 'null');

    prop = firstDetail.properties[4];
    assert.equal(prop.name, 'dateVal');
    assert.equal(prop.value.type, 'type-date');
    assert.equal(prop.value.inspect, date.toString());

    prop = firstDetail.properties[5];
    assert.equal(prop.name, 'aCP');
    assert.equal(prop.value.type, 'type-boolean');

    prop = firstDetail.properties[6];
    assert.equal(prop.name, 'get');
    assert.equal(prop.value.type, 'type-function');

  });

  test('Computed properties are correctly calculated', function(assert) {
    let inspected = EmberObject.extend({
      hi: computed(function() {
        assert.step('calculating computed');
        return 'Hello';
      }),
      _debugInfo() {
        return {
          propertyInfo: {
            expensiveProperties: ['hi']
          }
        };
      }
    }).create();

    assert.step('inspector: sendObject');
    objectInspector.sendObject(inspected);
    let computedProperty = message.details[0].properties[0];
    assert.equal(computedProperty.name, 'hi');
    assert.ok(computedProperty.isComputed);
    assert.equal(computedProperty.value.type, 'type-descriptor');
    assert.equal(computedProperty.value.inspect, '<computed>');

    let id = message.objectId;

    assert.step('inspector: calculate');
    port.trigger('objectInspector:calculate', {
      objectId: id,
      property: 'hi',
      mixinIndex: 1
    });

    assert.equal(name, 'objectInspector:updateProperty');
    assert.equal(message.objectId, id);
    assert.equal(message.property, 'hi');
    assert.equal(message.mixinIndex, 1);
    assert.equal(message.value.type, 'type-string');
    assert.equal(message.value.inspect, inspect('Hello'));
    assert.ok(message.value.isCalculated);

    assert.verifySteps([
      'inspector: sendObject',
      'inspector: calculate',
      'calculating computed'
    ]);
  });

  test('Cached Computed properties are pre-calculated', function(assert) {
    let inspected = EmberObject.extend({
      hi: computed(function() {
        return 'Hello';
      })
    }).create();

    // pre-calculate CP
    inspected.get('hi');

    objectInspector.sendObject(inspected);

    let computedProperty = message.details[0].properties[0];

    assert.equal(computedProperty.name, 'hi');
    assert.ok(computedProperty.value.isCalculated);
    assert.equal(computedProperty.value.type, 'type-string');
    assert.equal(computedProperty.value.inspect, inspect('Hello'));
  });

  test('Properties are correctly bound', async function(assert) {
    let inspected = EmberObject.extend({
      name: 'Teddy',

      hi: computed({
        get() {
          return 'hello';
        },
        set(key, val) {
          return val;
        }
      }),

      _debugInfo() {
        return {
          propertyInfo: {
            expensiveProperties: ['hi']
          }
        };
      }

    }).create();

    objectInspector.sendObject(inspected);

    let id = message.objectId;

    inspected.set('name', 'Alex');

    await new Promise(res => setTimeout(res, 400));

    assert.equal(name, 'objectInspector:updateProperty');

    assert.equal(message.objectId, id);
    assert.equal(message.property, 'name');
    assert.equal(message.mixinIndex, 0);
    assert.equal(message.value.isCalculated, true);
    assert.equal(message.value.inspect, inspect('Alex'));
    assert.equal(message.value.type, 'type-string');

    // un-cached computed properties are not bound until calculated

    message = null;

    inspected.set('hi', 'Hey');

    await new Promise(res => setTimeout(res, 400));

    assert.equal(message.objectId, id);
    assert.equal(message.property, 'hi');
    assert.equal(message.mixinIndex, 0);
    assert.ok(message.value.isCalculated);
    assert.equal(message.value.inspect, inspect('Hey'));
    assert.equal(message.value.type, 'type-string');

    message = null;

    port.trigger('objectInspector:calculate', {
      objectId: id,
      property: 'hi',
      mixinIndex: 1
    });

    inspected.set('hi', 'Hello!');

    await new Promise(res => setTimeout(res, 500));

    assert.equal(message.objectId, id);
    assert.equal(message.property, 'hi');
    assert.equal(message.mixinIndex, 0);
    assert.ok(message.value.isCalculated);
    assert.equal(message.value.inspect, inspect('Hello!'));
    assert.equal(message.value.type, 'type-string');
  });

  test('Properties can be updated through a port message', async function(assert) {
    let inspected = EmberObject.extend({
      name: 'Teddy'
    }).create();

    objectInspector.sendObject(inspected);

    let id = message.objectId;

    port.trigger('objectInspector:saveProperty', {
      objectId: id,
      mixinIndex: 1,
      property: 'name',
      value: 'Alex'
    });

    assert.equal(inspected.get('name'), 'Alex');

    await new Promise(res => setTimeout(res, 400));

    // A property updated message is published
    assert.equal(name, 'objectInspector:updateProperty');
    assert.equal(message.property, 'name');
    assert.equal(message.value.inspect, inspect('Alex'));
    assert.equal(message.value.type, 'type-string');
  });

  test('Date properties are converted to dates before being updated', function(assert) {
    let newDate = new Date(2015, 0, 1);

    let inspected = EmberObject.extend({
      date: null
    }).create();

    objectInspector.sendObject(inspected);

    let id = message.objectId;

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

  test('Property grouping can be customized using _debugInfo', function(assert) {
    // eslint-disable-next-line ember/no-new-mixins
    let mixinToSkip = Mixin.create({
      toString() {
        return 'MixinToSkip';
      }
    });

    let Inspected = EmberObject.extend(mixinToSkip, {
      name: 'Teddy',
      gender: 'Male',
      hasChildren: false,
      expensiveProperty: computed(function() { return ''; }),
      _debugInfo() {
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

    let inspected = Inspected.create({
      maritalStatus: 'Single',
      propertyToSkip: null
    });

    objectInspector.sendObject(inspected);

    assert.equal(message.name, 'TestObject');

    assert.equal(message.details[0].name, 'Basic Info');
    assert.equal(message.details[0].properties[0].name, 'name');
    assert.equal(message.details[0].properties[1].name, 'gender');
    assert.ok(message.details[0].expand);

    assert.equal(message.details[1].name, 'Family Info');
    assert.equal(message.details[1].properties[0].name, 'maritalStatus');

    assert.equal(message.details[2].name, 'Own Properties');
    assert.equal(message.details[2].properties.length, 2, 'Correctly merges properties');
    assert.equal(message.details[2].properties[0].value.isCalculated, undefined, 'Does not calculate expensive properties');
    assert.equal(message.details[2].properties[1].name, 'hasChildren');

    assert.ok(message.details[3].name !== 'MixinToSkip', 'Correctly skips mixins');
  });


  test('Service should be successfully tagged as service on serialization', function(assert) {
    let inspectedService = Service.extend({
      fooBoo() {
        return true;
      }
    }).create();

    let inspected = EmberObject.extend({
      service: inspectedService
    }).create();

    objectInspector.sendObject(inspected);

    let serializedServiceProperty = message.details[0].properties[0];

    assert.equal(serializedServiceProperty.isService, true);
  });

  test('Proxy Service should be successfully tagged as service on serialization', function(assert) {
    let inspectedService = Service.extend({
      unknownProperty() {
        return true;
      }
    }).create();

    let inspected = EmberObject.extend({
      service: inspectedService
    }).create();

    objectInspector.sendObject(inspected);

    let serializedServiceProperty = message.details[0].properties[0];

    assert.equal(serializedServiceProperty.isService, true);
  });

  test('Computed property dependent keys and code should be successfully serialized', function(assert) {
    let computedFn = function() {
      return this.get('foo') + this.get('bar');
    };

    let inspected = EmberObject.extend({
      foo: true,
      bar: false,
      fooAndBar: computed('foo', 'bar', computedFn)
    }).create();

    objectInspector.sendObject(inspected);
    let serializedComputedProperty = message.details[0].properties[0];

    assert.equal(serializedComputedProperty.code, computedFn.toString());
    assert.equal(serializedComputedProperty.dependentKeys[0], 'foo');
    assert.equal(serializedComputedProperty.dependentKeys[1], 'bar');
  });

  test('Views are correctly handled when destroyed during transitions', async function(assert) {
    let objectId = null;

    await visit('/simple');

    objectId = find('.simple-view').id;
    let view = this.owner.lookup('-view-registry:main')[objectId];
    objectInspector.sendObject(view);
    await settled();

    assert.ok(!!objectInspector.sentObjects[objectId], 'Object successfully retained.');

    await visit('/');

    assert.ok(true, 'No exceptions thrown');
  });

  test('Objects are dropped on destruction', async function(assert) {
    let didDestroy = false;
    let object = EmberObject.create({
      willDestroy() {
        didDestroy = true;
      }
    });
    let objectId = guidFor(object);

    await settled();

    objectInspector.sendObject(object);
    await settled();

    assert.ok(!!objectInspector.sentObjects[objectId]);
    run(object, 'destroy');
    await settled();

    assert.ok(didDestroy, 'Original willDestroy is preserved.');
    assert.ok(!objectInspector.sentObjects[objectId], 'Object is dropped');
    assert.equal(name, 'objectInspector:droppedObject');
    assert.deepEqual(message, { objectId });

  });

  test('Properties ending with `Binding` are skipped', async function(assert) {
    let object = EmberObject.create({
      bar: 'test',
      fooBinding: 'bar'
    });

    await settled();

    objectInspector.sendObject(object);
    await settled();

    let props = message.details[0].properties;
    if (!hasEmberVersion(3, 0)) {
      assert.equal(props.length, 2, 'Props should be foo and bar without fooBinding');
      assert.equal(props[1].name, 'foo');
    } else {
      assert.equal(props.length, 1, 'Props should be only bar without fooBinding, in Ember 3.0+');
    }
    assert.equal(props[0].name, 'bar');
  });

  test('Properties listed in _debugInfo but don\'t exist should be skipped silently', async function(assert) {
    let object = EmberObject.create({
      foo: 'test',
      _debugInfo() {
        return {
          propertyInfo: {
            groups: [{
              name: 'Attributes', properties: ['foo', 'bar']
            }]
          }
        };
      }

    });

    await settled();

    run(objectInspector, 'sendObject', object);
    await settled();

    let props = message.details[0].properties;
    assert.equal(props.length, 1, 'bar should be silently skipped');
    assert.equal(props[0].name, 'foo');
  });

  test('Errors while computing CPs are handled', async function(assert) {
    // catch error port messages (ignored by default)
    ignoreErrors = false;

    let count = 0;
    let object;
    run(() => {
      object = EmberObject.extend({
        foo: computed(function() {
          if (count++ < 2) {
            throw new Error('CP Calculation');
          }
          return 'bar';
        })
      }).create();
    });

    run(objectInspector, 'sendObject', object);
    await settled();

    let errors = message.errors;
    assert.equal(errors.length, 1);
    assert.equal(errors[0].property, 'foo');
    ignoreErrors = false;

    // Calculate CP a second time
    run(() => {
      port.trigger('objectInspector:calculate', {
        objectId: guidFor(object),
        property: 'foo',
        mixinIndex: 1
      });
    });
    await settled();
    ignoreErrors = true;
    assert.equal(name, 'objectInspector:updateErrors');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].property, 'foo');

    // Calculate CP a third time (no error this time)
    run(() => {
      port.trigger('objectInspector:calculate', {
        objectId: guidFor(object),
        property: 'foo',
        mixinIndex: 1
      });
    });
    await settled();
    assert.equal(name, 'objectInspector:updateProperty');
    assert.equal(message.value.inspect, inspect('bar'));

    // teardown
    ignoreErrors = true;
  });
});
