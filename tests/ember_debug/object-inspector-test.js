/* eslint-disable ember/no-new-mixins */
import { find, visit } from '@ember/test-helpers';
import Mixin from '@ember/object/mixin';
import Component from '@ember/component';
import { inspect } from '@ember/debug';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';
import EmberObject, { computed } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
import Service from '@ember/service';
import { VERSION } from '@ember/version';
import { tracked } from '@glimmer/tracking';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import require from 'require';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { compareVersion } from 'ember-debug/utils/version';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

const GlimmerComponent = (function() {
  try {
    return require('@glimmer/component').default;
  } catch(e) {
    // ignore, return undefined
  }
})();

let objectInspector;

// TODO switch to an adapter architecture, similar to the acceptance tests
async function captureMessage(type, callback) {
  if (!EmberDebug.port) {
    throw new Error('Cannot call captureMessage without a port');
  }

  let send = EmberDebug.port.send;

  try {
    let captured;

    EmberDebug.port.send = (name, message) => {
      if (!captured && name === type) {
        captured = message;
      } else {
        send.call(EmberDebug.port, name, message);
      }
    };

    await callback();

    if (captured) {
      return captured;
    } else {
      throw new Error(`Did not send a message of type ${type}`);
    }
  } finally {
    EmberDebug.port.send = send;
  }
}

async function inspectObject(object) {
  if (!objectInspector) {
    throw new Error('Cannot call captureMessage without objectInspector');
  }

  return captureMessage('objectInspector:updateObject', () => {
    objectInspector.sendObject(object);
  });
}

module('Ember Debug - Object Inspector', function(hooks) {
  setupEmberDebugTest(hooks);

  hooks.beforeEach(async function() {
    this.owner.register('component:x-simple', Component);
    this.owner.register('template:simple', hbs`Simple {{input class="simple-input"}} {{x-simple class="simple-view"}}`);

    objectInspector = EmberDebug.get('objectInspector');
  });

  test('An Ember Object is correctly transformed into an inspection hash', async function(assert) {
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

    let message = await inspectObject(inspected);

    assert.equal(message.name, 'Object:My Object');

    let firstDetail = message.details[0];
    assert.equal(firstDetail.name, 'Own Properties');

    assert.equal(firstDetail.properties.length, 4, 'methods are included');

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

    let secondDetail = message.details[1];
    assert.ok(secondDetail.name.includes('Parent Object'));

    idProperty = secondDetail.properties[0];
    assert.equal(idProperty.name, 'id');
    assert.equal(idProperty.overridden, 'Own Properties');

    let nameProperty = secondDetail.properties[1];
    assert.equal(nameProperty.name, 'name');
    assert.equal(nameProperty.value.inspect, inspect('My Object'));
  });

  test('An ES6 Class is correctly transformed into an inspection hash', async function(assert) {
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

    let message = await captureMessage('objectInspector:updateObject', () => {
      objectInspector.sendObject(inspected);
    });

    assert.equal(message.name, 'Object:My Object');

    let firstDetail = message.details[0];
    assert.equal(firstDetail.name, 'Own Properties');

    assert.equal(firstDetail.properties.length, 5, 'methods are included');


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

    let secondDetail = message.details[1];
    prop = secondDetail.properties[0];
    assert.equal(prop.name, 'toString');
    assert.equal(prop.value.type, 'type-function');

    prop = secondDetail.properties[1];
    assert.equal(prop.name, 'get');
    assert.equal(prop.value.type, 'type-function');

    prop = secondDetail.properties[2];
    assert.equal(prop.name, 'aCP');
    assert.equal(prop.value.type, 'type-boolean');
  });

  test('Correct mixin order with es6 class', async function (assert) {
    class MyMixinClass extends Mixin {
      toString() {
        return 'MyMixin';
      }
    }
    const MyMixin = MyMixinClass.create({
      a: 'custom',
    });

    class MyMixin2Class extends Mixin {
      toString() {
        return 'MyMixin2';
      }
    }
    const MyMixin2 = MyMixin2Class.create({
      b: 'custom2',
    });

    class Baz extends EmberObject {}
    class Bar extends Baz {}
    class FooBar extends Bar.extend(MyMixin, MyMixin2) {}

    class Foo extends FooBar {
      foobar = 1
    }

    const inspected = Foo.create({
      ownProp: 'hi'
    });

    let message = await inspectObject(inspected);

    const mixinNames = message.details.map(d => d.name);
    const expectedMixinNames = [
      'Own Properties',
      'Foo',
      'FooBar',
      'MyMixin',
      'MyMixin2',
      'Bar',
      'Baz',
      'EmberObject',
      'Observable Mixin',
      'CoreObject'
    ];

    expectedMixinNames.forEach((expectedMixinName, i) => {
      assert.ok(mixinNames[i].includes(expectedMixinName), `${mixinNames[i]} : ${expectedMixinName}`);
    });
  });

  test('Proxies are skipped by default', async function (assert) {
    let inspected = EmberObject.extend({
      test: 'a',
      get abc() {
        return 1;
      }
    }).create();
    const proxy = ObjectProxy.create({
      content: inspected
    });
    let message = await inspectObject(proxy);
    let computedProperty = message.details[1].properties[0];
    assert.equal(computedProperty.name, 'test');
    assert.equal(computedProperty.value.inspect, inspect('a'));

    let getterProperty = message.details[1].properties[1];
    assert.equal(getterProperty.name, 'abc');
    assert.equal(getterProperty.value.inspect, inspect(1));
  });

  test('Object Proxies are not skipped with _showProxyDetails', async function (assert) {
    let inspected = EmberObject.extend({
      test: 'a'
    }).create();
    const proxy = ObjectProxy.create({
      content: inspected,
      _showProxyDetails: true,
      prop: 'b'
    });
    let message = await inspectObject(proxy);
    let computedProperty = message.details[0].properties[1];
    assert.equal(computedProperty.name, 'prop');
    assert.equal(computedProperty.value.inspect, inspect('b'));
  });

  test('Array Proxies show content from toArray', async function (assert) {
    // support ArrayProxy -> MutableArray for ember data many-array
    // https://api.emberjs.com/ember-data/release/classes/ManyArray
    // https://github.com/emberjs/data/blob/master/packages/store/addon/-private/system/promise-proxies.js#L130
    const array = EmberObject.extend(MutableArray, {
      length: 1,
      content: ['internal'],
      objectAt() {
         return 1;
      }
    }).create();

    const proxy = ArrayProxy.create({
      content: array
    });

    let message = await inspectObject(proxy);

    let property = message.details[0].properties[0];
    assert.equal(property.name, 0);
    assert.equal(property.value.inspect, 1);

    property = message.details[0].properties[1];
    assert.equal(property.name, 'length');
    assert.equal(property.value.inspect, 1);
  });

  test('Correct mixin properties', async function (assert) {
    class MyMixin extends Mixin {
      toString() {
        return 'MyMixin1';
      }
    }
    class MyMixin2 extends Mixin {
      toString() {
        return 'MyMixin2';
      }
    }

    const mix1 = MyMixin.create({a: 'custom1'});
    const mix2 = MyMixin2.create({b: 'custom2'});

    class Foo extends EmberObject.extend(mix1, mix2) {}

    const instance = Foo.create({
      ownProp: 'b'
    });

    let { details } = await inspectObject(instance);

    assert.equal(details[0].properties.length, 1, 'should not show mixin properties');
    assert.equal(details[0].properties[0].name, 'ownProp');

    assert.equal(details[2].name, 'MyMixin1');
    assert.equal(details[2].properties.length, 1, 'should only show own mixin properties');
    assert.equal(details[2].properties[0].value.inspect, inspect('custom1'));

    assert.equal(details[3].name, 'MyMixin2');
    assert.equal(details[3].properties.length, 1, 'should only show own mixin properties');
    assert.equal(details[3].properties[0].value.inspect, inspect('custom2'));
  });

  test('Computed properties are correctly calculated', async function(assert) {
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
    let message = await inspectObject(inspected);
    let computedProperty = message.details[1].properties[0];
    assert.equal(computedProperty.name, 'hi');
    assert.ok(computedProperty.isComputed);
    assert.equal(computedProperty.value.type, 'type-descriptor');
    assert.equal(computedProperty.value.inspect, '<computed>');

    let id = message.objectId;

    assert.step('inspector: calculate');
    message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId: id,
        property: 'hi',
        mixinIndex: 1
      });
    });
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

  test('Cached Computed properties are pre-calculated', async function(assert) {
    let inspected = EmberObject.extend({
      hi: computed(function() {
        return 'Hello';
      })
    }).create();

    // pre-calculate CP
    inspected.get('hi');

    let message = await inspectObject(inspected);

    let computedProperty = message.details[1].properties[0];

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

    let { objectId } = await inspectObject(inspected);

    let message = await captureMessage('objectInspector:updateProperty', () => {
      run(() => inspected.set('name', 'Alex'));
    });

    assert.equal(message.objectId, objectId);
    assert.equal(message.property, 'name');
    assert.equal(message.mixinIndex, 1);
    assert.equal(message.value.isCalculated, true);
    assert.equal(message.value.inspect, inspect('Alex'));
    assert.equal(message.value.type, 'type-string');

    // un-cached computed properties are not bound until calculated

    message = await captureMessage('objectInspector:updateProperty', () => {
      run(() => inspected.set('hi', 'Hey'));
    });

    assert.equal(message.objectId, objectId);
    assert.equal(message.property, 'hi');
    assert.equal(message.mixinIndex, 1);
    assert.ok(message.value.isCalculated);
    assert.equal(message.value.inspect, inspect('Hey'));
    assert.equal(message.value.type, 'type-string');

    message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId,
        property: 'hi',
        mixinIndex: 1
      });
    });

    assert.equal(message.objectId, objectId);
    assert.equal(message.property, 'hi');
    assert.equal(message.mixinIndex, 1);
    assert.ok(message.value.isCalculated);
    assert.equal(message.value.inspect, inspect('Hey'));
    assert.equal(message.value.type, 'type-string');

    message = await captureMessage('objectInspector:updateProperty', () => {
      run(() => inspected.set('hi', 'Hello!'));
    });

    assert.equal(message.objectId, objectId);
    assert.equal(message.property, 'hi');
    assert.equal(message.mixinIndex, 1);
    assert.ok(message.value.isCalculated);
    assert.equal(message.value.inspect, inspect('Hello!'));
    assert.equal(message.value.type, 'type-string');
  });

  test('Properties can be updated through a port message', async function(assert) {
    let inspected = EmberObject.extend({
      name: 'Teddy'
    }).create();

    let { objectId } = await inspectObject(inspected);

    let message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:saveProperty', {
        objectId,
        mixinIndex: 1,
        property: 'name',
        value: 'Alex'
      });
    });

    assert.equal(inspected.get('name'), 'Alex');

    assert.equal(message.property, 'name');
    assert.equal(message.value.inspect, inspect('Alex'));
    assert.equal(message.value.type, 'type-string');
  });

  test('Date properties are converted to dates before being updated', async function(assert) {
    let newDate = new Date(2015, 0, 1);

    let inspected = EmberObject.extend({
      date: null
    }).create();

    let { objectId } = await inspectObject(inspected);

    let message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:saveProperty', {
        objectId,
        mixinIndex: 1,
        property: 'date',
        value: newDate.getTime(),
        dataType: 'date'
      });
    });

    assert.equal(inspected.get('date').getFullYear(), 2015);
    assert.equal(inspected.get('date').getMonth(), 0);
    assert.equal(inspected.get('date').getDate(), 1);

    assert.equal(message.property, 'date');
    assert.equal(message.value.inspect, inspect(newDate));
    assert.equal(message.value.type, 'type-date');
  });

  test('Property grouping can be customized using _debugInfo', async function(assert) {
    let mixinToSkip = Mixin.create({});

    let Inspected = EmberObject.extend(mixinToSkip, {
      name: 'Teddy',
      gender: 'Male',
      hasChildren: false,
      toString: function() {
        return 'TestObject';
      },
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

    let inspected = Inspected.create({
      maritalStatus: 'Single',
      propertyToSkip: null
    });

    let message = await inspectObject(inspected);

    assert.equal(message.name, 'TestObject');

    assert.equal(message.details[0].name, 'Basic Info');
    assert.equal(message.details[0].properties[0].name, 'name');
    assert.equal(message.details[0].properties[1].name, 'gender');
    assert.ok(message.details[0].expand);

    assert.equal(message.details[1].name, 'Family Info');
    assert.equal(message.details[1].properties[0].name, 'maritalStatus');

    assert.equal(message.details[2].name, 'Own Properties');
    assert.equal(message.details[2].properties.length, 0, 'Correctly skips properties');

    assert.equal(message.details[3].name, 'TestObject');
    assert.equal(message.details[3].properties.length, 3, 'Correctly merges properties');
    assert.equal(message.details[3].properties[0].name, 'toString');
    assert.equal(message.details[3].properties[1].name, 'hasChildren');
    assert.equal(message.details[3].properties[2].name, 'expensiveProperty', 'property name is correct');
    assert.equal(message.details[3].properties[2].value.isCalculated, undefined, 'Does not calculate expensive properties');

    assert.ok(message.details[3].name !== 'MixinToSkip', 'Correctly skips mixins');
  });

  test('Property grouping can be customized using _debugInfo when using Proxy', async function(assert) {
    class MyMixin extends Mixin {
      toString() {
        return 'MixinToSkip';
      }
    }

    let mixinToSkip = MyMixin.create({});

    let Inspected = EmberObject.extend(mixinToSkip, {
      name: 'Teddy',
      gender: 'Male',
      hasChildren: false,
      toString: function() {
        return 'TestObject';
      },
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

    let inspected = Inspected.create({
      maritalStatus: 'Single',
      propertyToSkip: null
    });

    const proxy = ObjectProxy.create({
      content: inspected
    });

    let message = await inspectObject(proxy);

    assert.ok(message.name.includes('ObjectProxy'), 'object name should start with <ObjectProxy:');

    assert.equal(message.details[0].name, 'Basic Info');
    assert.equal(message.details[0].properties[0].name, 'name');
    assert.equal(message.details[0].properties[1].name, 'gender');
    assert.ok(message.details[0].expand);

    assert.equal(message.details[1].name, 'Family Info');
    assert.equal(message.details[1].properties[0].name, 'maritalStatus');

    assert.equal(message.details[2].name, 'Own Properties');
    assert.equal(message.details[2].properties.length, 0, 'Correctly skips properties');

    assert.equal(message.details[3].name, 'TestObject');
    assert.equal(message.details[3].properties.length, 3, 'Correctly merges properties');
    assert.equal(message.details[3].properties[1].name, 'hasChildren');
    assert.equal(message.details[3].properties[2].name, 'expensiveProperty', 'property name is correct');
    assert.equal(message.details[3].properties[2].value.isCalculated, undefined, 'Does not calculate expensive properties');

    assert.ok(message.details[3].name !== 'MixinToSkip', 'Correctly skips mixins');
  });


  test('Service should be successfully tagged as service on serialization', async function(assert) {
    let inspectedService = Service.extend({
      fooBoo() {
        return true;
      }
    }).create();

    let inspected = EmberObject.extend({
      service: inspectedService
    }).create();

    let message = await inspectObject(inspected);

    let serializedServiceProperty = message.details[1].properties[0];

    assert.equal(serializedServiceProperty.isService, true);
  });

  test('Proxy Service should be successfully tagged as service on serialization', async function(assert) {
    let inspectedService = Service.extend({
      unknownProperty() {
        return true;
      }
    }).create();

    let inspected = EmberObject.extend({
      service: inspectedService
    }).create();

    let message = await inspectObject(inspected);

    let serializedServiceProperty = message.details[1].properties[0];

    assert.equal(serializedServiceProperty.isService, true);
  });

  test('Computed property dependent keys and code should be successfully serialized', async function(assert) {
    let computedFn = function() {
      return this.get('foo') + this.get('bar');
    };

    let inspected = EmberObject.extend({
      foo: true,
      bar: false,
      fooAndBar: computed('foo', 'bar', computedFn)
    }).create();

    let message = await inspectObject(inspected);
    let serializedComputedProperty = message.details[1].properties[2];

    assert.equal(serializedComputedProperty.code, computedFn.toString());
    assert.equal(serializedComputedProperty.dependentKeys[0], 'foo');
    assert.equal(serializedComputedProperty.dependentKeys[1], 'bar');
  });

  test('Views are correctly handled when destroyed during transitions', async function(assert) {
    let objectId = null;

    await visit('/simple');

    objectId = find('.simple-view').id;
    let view = this.owner.lookup('-view-registry:main')[objectId];
    await inspectObject(view);

    assert.ok(objectInspector.sentObjects[objectId], 'Object successfully retained.');

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

    let message = await inspectObject(object);

    assert.equal(message.objectId, objectId, 'objectId matches');

    assert.ok(objectInspector.sentObjects[objectId], 'Object successfully retained.');

    message = await captureMessage('objectInspector:droppedObject', () => {
      run(object, 'destroy');
    });

    assert.ok(didDestroy, 'Original willDestroy is preserved.');
    assert.ok(!objectInspector.sentObjects[objectId], 'Object is dropped');
    assert.deepEqual(message, { objectId });
  });

  test('Properties ending with `Binding` are skipped', async function(assert) {
    let object = EmberObject.create({
      bar: 'test',
      fooBinding: 'bar'
    });

    let message = await inspectObject(object);

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

    let message = await inspectObject(object);

    let props = message.details[0].properties;
    assert.equal(props.length, 1, 'bar should be silently skipped');
    assert.equal(props[0].name, 'foo');
  });

  test('Errors while computing CPs are handled', async function(assert) {
    let count = 0;
    let object = run(() => EmberObject.extend({
      foo: computed(function() {
        if (count++ < 2) {
          throw new Error('CP Calculation');
        }
        return 'bar';
      })
    }).create());

    let message = await inspectObject(object);

    let { objectId } = message;
    assert.equal(objectId, guidFor(object), 'objectId matches');

    let errors = message.errors;
    assert.equal(errors.length, 1);
    assert.equal(errors[0].property, 'foo');

    // Calculate CP a second time
    message = await captureMessage('objectInspector:updateErrors', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId,
        property: 'foo',
        mixinIndex: 1
      });
    });

    assert.equal(message.errors.length, 1);
    assert.equal(message.errors[0].property, 'foo');

    // Calculate CP a third time (no error this time)
    message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId: guidFor(object),
        property: 'foo',
        mixinIndex: 1
      });
    });

    assert.equal(message.value.inspect, inspect('bar'));
  });

  test('Plain properties work', async function(assert) {
    let inspected = EmberObject.create({ hi: 123 });
    let message = await inspectObject(inspected);

    let plainProperty = message.details[0].properties[0];
    assert.equal(plainProperty.name, 'hi');
    assert.ok(plainProperty.isProperty);
    assert.equal(plainProperty.value.type, 'type-number');
    assert.equal(plainProperty.value.inspect, '123');
  });

  test('Getters work', async function(assert) {
    class Foo {
      get hi() { return 123 }
    }

    let inspected = new Foo();

    let message = await inspectObject(inspected);
    let getter = message.details[1].properties[0];
    assert.equal(getter.name, 'hi');
    assert.ok(getter.isGetter);
    assert.ok(!getter.isTracked);
    assert.equal(getter.value.type, 'type-number');
    assert.equal(getter.value.inspect, '123');
  });

  if (hasEmberVersion(3, 13)) {
    test('Tracked properties work', async function(assert) {
      class Foo {
        @tracked hi = 123;
      }

      let inspected = new Foo();

      assert.step('inspector: sendObject');
      let message = await inspectObject(inspected);
      let trackedProp = message.details[1].properties[0];
      assert.equal(trackedProp.name, 'hi');
      assert.ok(trackedProp.isTracked);
      assert.equal(trackedProp.value.type, 'type-number');
      assert.equal(trackedProp.value.inspect, 123);

      assert.step('inspector: update value');
      message = await captureMessage('objectInspector:updateProperty', () => {
        run(() => inspected.hi++);
      });

      assert.step('inspector: updateProperty');
      assert.equal(message.property, 'hi');
      assert.equal(message.mixinIndex, 1);
      assert.equal(message.value.type, 'type-number');
      assert.equal(message.value.inspect, inspect(124));
      assert.ok(message.value.isCalculated);

      assert.verifySteps([
        'inspector: sendObject',
        'inspector: update value',
        'inspector: updateProperty',
      ]);
    });

    test('Tracked getters update', async function(assert) {
      class Foo {
        @tracked hi = 123;
      }

      let dataSource = new Foo();

      class Bar {
        get hello() {
          return dataSource.hi;
        }
      }

      let inspected = new Bar();

      assert.step('inspector: sendObject');
      let message = await inspectObject(inspected);
      let trackedProp = message.details[1].properties[0];
      assert.equal(trackedProp.name, 'hello');
      assert.ok(trackedProp.isGetter);
      assert.equal(trackedProp.value.type, 'type-number');
      assert.equal(trackedProp.value.inspect, 123);

      assert.step('inspector: update value');
      message = await captureMessage('objectInspector:updateProperty', () => {
        run(() => dataSource.hi++);
      });

      assert.step('inspector: updateProperty');
      assert.equal(message.property, 'hello');
      assert.equal(message.mixinIndex, 1);
      assert.equal(message.value.type, 'type-number');
      assert.equal(message.value.inspect, inspect(124));
      assert.ok(message.value.isCalculated);

      assert.verifySteps([
        'inspector: sendObject',
        'inspector: update value',
        'inspector: updateProperty',
      ]);
    });
  }

  // @glimmer/component 1.0 doesn't seem to support 3.4, even though it has the manager API
  // Assertion Failed: Could not find custom component manager 'glimmer'
  if (hasEmberVersion(3, 8) && GlimmerComponent) {
    test('Inspecting GlimmerComponent does not cause errors', async function(assert) {
      let instance;

      class FooComponent extends GlimmerComponent {
        constructor(...args) {
          super(...args);
          instance = this;
        }

        get foo() {
          return 'foo';
        }

        bar = 'bar';

        baz() {
          return 'baz';
        }
      }

      this.owner.register('component:foo', FooComponent);
      this.owner.register('template:simple', hbs`<Foo />`);

      await visit('/simple');

      assert.ok(instance instanceof FooComponent, 'an instance of FooComponent has been created');

      let { details, errors } = await inspectObject(instance);

      assert.ok(details, 'has details');
      assert.deepEqual(errors, [], 'has no errors');

      let properties = [];

      for (let mixin of details) {
        for (let property of mixin.properties) {
          properties.push(property.name);
        }
      }

      assert.ok(properties.indexOf('args') > -1, 'contains args');
      assert.ok(properties.indexOf('foo') > -1, 'contains foo');
      assert.ok(properties.indexOf('bar') > -1, 'contains bar');
      assert.ok(properties.indexOf('baz') > -1, 'contains baz');

      assert.ok(properties.indexOf('bounds') === -1, 'does not contain bounds');
      assert.ok(properties.indexOf('element') === -1, 'does not contain element');
      assert.ok(properties.indexOf('debugName') === -1, 'does not contain debugName');
    });
  }
});
