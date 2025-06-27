/* eslint-disable ember/avoid-leaking-state-in-ember-objects, ember/no-classic-classes, ember/no-new-mixins, ember/no-runloop */
import { find, visit } from '@ember/test-helpers';
import Mixin from '@ember/object/mixin';
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inspect } from '@ember/debug';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import EmberObject, { computed } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import ArrayProxy from '@ember/array/proxy';
import ObjectProxy from '@ember/object/proxy';
import Service from '@ember/service';
import { VERSION } from '@ember/version';
import { tracked } from '@glimmer/tracking';
import { module, skip, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import require from 'require';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { compareVersion } from 'ember-debug/version';
import EmberDebug from 'ember-debug/main';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';
import EmberRoute from '@ember/routing/route';
import Controller from '@ember/controller';

const GlimmerComponent = (function () {
  try {
    return require('@glimmer/component').default;
  } catch {
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

module('Ember Debug - Object Inspector', function (hooks) {
  setupEmberDebugTest(hooks, {
    routes() {
      this.route('simple');
    },
  });

  hooks.beforeEach(async function () {
    this.owner.register('route:application', EmberRoute);

    this.owner.register('controller:application', Controller);

    this.owner.register(
      'template:application',
      hbs(
        '<div class="application" style="line-height: normal;">{{outlet}}</div>',
        { moduleName: 'my-app/templates/application.hbs' },
      ),
    );
    this.owner.register('route:simple', EmberRoute);
    this.owner.register('component:x-simple', Component);
    this.owner.register(
      'template:simple',
      hbs`
      {{! template-lint-disable}}
      Simple <Input class="simple-input"/> {{x-simple class="simple-view"}}
      `,
    );

    objectInspector = EmberDebug.objectInspector;
  });

  test('An Ember Object is correctly transformed into an inspection hash', async function (assert) {
    let date = new Date();

    let Parent = EmberObject.extend({
      id: null,
      name: 'My Object',
    });

    Parent.reopenClass({
      toString() {
        return 'Parent Object';
      },
    });

    let inspected = Parent.create({
      id: 1,
      toString() {
        return `Object:${this.name}`;
      },
      nullVal: null,
      dateVal: date,
    });

    let message = await inspectObject(inspected);

    assert.strictEqual(message.name, 'Object:My Object');

    let firstDetail = message.details[0];
    assert.strictEqual(firstDetail.name, 'Own Properties');

    assert.strictEqual(
      firstDetail.properties.length,
      4,
      'methods are included',
    );

    let idProperty = firstDetail.properties[0];
    assert.strictEqual(idProperty.name, 'id');
    assert.strictEqual(idProperty.value.type, 'type-number');
    assert.strictEqual(idProperty.value.inspect, '1');

    let toStringProperty = firstDetail.properties[1];
    assert.strictEqual(toStringProperty.name, 'toString');
    assert.strictEqual(toStringProperty.value.type, 'type-function');

    let nullProperty = firstDetail.properties[2];
    assert.strictEqual(nullProperty.name, 'nullVal');
    assert.strictEqual(nullProperty.value.type, 'type-null');
    assert.strictEqual(nullProperty.value.inspect, 'null');

    let prop = firstDetail.properties[3];
    assert.strictEqual(prop.name, 'dateVal');
    assert.strictEqual(prop.value.type, 'type-date');
    assert.strictEqual(prop.value.inspect, date.toString());

    let secondDetail = message.details[1];
    assert.ok(secondDetail.name.includes('Parent Object'));

    idProperty = secondDetail.properties[0];
    assert.strictEqual(idProperty.name, 'id');
    assert.strictEqual(idProperty.overridden, 'Own Properties');

    let nameProperty = secondDetail.properties[1];
    assert.strictEqual(nameProperty.name, 'name');
    assert.strictEqual(nameProperty.value.inspect, inspect('My Object'));
  });

  test.skip('An ES6 Class is correctly transformed into an inspection hash', async function (assert) {
    if (compareVersion(VERSION, '3.9.0') === -1) {
      assert.expect(0);
      return;
    }
    let date = new Date();

    class ObjectWithTracked {
      @tracked item1 = 'item1';
      @tracked item2 = 'item2';
    }

    class Parent {
      constructor(param) {
        Object.assign(this, param);
      }

      @tracked trackedProperty = 'tracked';
      objectWithTracked = new ObjectWithTracked();

      id = null;
      name = 'My Object';

      toString() {
        return 'Parent Object';
      }

      get getterWithTracked() {
        const a = this.objectWithTracked.item1 + this.objectWithTracked.item2;
        return a + this.trackedProperty;
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
        return `Object:${this.name}`;
      },
      nullVal: null,
      dateVal: date,
    });

    let message = await captureMessage('objectInspector:updateObject', () => {
      objectInspector.sendObject(inspected);
    });

    assert.strictEqual(message.name, 'Object:My Object');

    let firstDetail = message.details[0];
    assert.strictEqual(firstDetail.name, 'Own Properties');

    assert.strictEqual(
      firstDetail.properties.length,
      6,
      'methods are included',
    );

    let objectWithTrackedProperty = firstDetail.properties[0];
    assert.strictEqual(objectWithTrackedProperty.name, 'objectWithTracked');
    assert.strictEqual(objectWithTrackedProperty.value.type, 'type-object');
    assert.strictEqual(objectWithTrackedProperty.value.inspect, '{  }');

    let idProperty = firstDetail.properties[1];
    assert.strictEqual(idProperty.name, 'id');
    assert.strictEqual(idProperty.value.type, 'type-number');
    assert.strictEqual(idProperty.value.inspect, '1');

    let nullProperty = firstDetail.properties[2];
    assert.strictEqual(nullProperty.name, 'name');
    assert.strictEqual(nullProperty.value.type, 'type-string');
    assert.strictEqual(nullProperty.value.inspect, '"My Object"');

    let prop = firstDetail.properties[3];

    assert.strictEqual(prop.name, 'toString');
    assert.strictEqual(prop.value.type, 'type-function');

    prop = firstDetail.properties[4];
    assert.strictEqual(prop.name, 'nullVal');
    assert.strictEqual(prop.value.type, 'type-null');
    assert.strictEqual(prop.value.inspect, 'null');

    prop = firstDetail.properties[5];
    assert.strictEqual(prop.name, 'dateVal');
    assert.strictEqual(prop.value.type, 'type-date');
    assert.strictEqual(prop.value.inspect, date.toString());

    let secondDetail = message.details[1];
    prop = secondDetail.properties[0];
    assert.strictEqual(prop.name, 'toString');
    assert.strictEqual(prop.value.type, 'type-function');

    prop = secondDetail.properties[1];
    assert.strictEqual(prop.name, 'getterWithTracked');
    assert.strictEqual(prop.value.type, 'type-string');
    assert.strictEqual(prop.value.inspect, '"item1item2tracked"');
    let dependentKeys =
      compareVersion(VERSION, '3.16.10') === 0
        ? [{ name: 'item1' }, { name: 'item2' }, { name: 'trackedProperty' }]
        : [
            { name: 'ObjectWithTracked' },
            { child: 'item1' },
            { child: 'item2' },
            { name: 'Object:My Object.trackedProperty' },
          ];
    assert.deepEqual(prop.dependentKeys, dependentKeys);

    prop = secondDetail.properties[2];
    assert.strictEqual(prop.name, 'get');
    assert.strictEqual(prop.value.type, 'type-function');

    prop = secondDetail.properties[3];
    assert.strictEqual(prop.name, 'aCP');
    assert.strictEqual(prop.value.type, 'type-boolean');
    assert.strictEqual(prop.dependentKeys.toString(), '');

    inspected.objectWithTracked.item1 = 'item1-changed';
    message = await captureMessage('objectInspector:updateObject', () => {
      objectInspector.sendObject(inspected);
    });

    secondDetail = message.details[1];
    prop = secondDetail.properties[1];
    assert.strictEqual(prop.name, 'getterWithTracked');
    assert.strictEqual(prop.value.type, 'type-string');
    assert.strictEqual(prop.value.inspect, '"item1-changeditem2tracked"');
    dependentKeys =
      compareVersion(VERSION, '3.16.10') === 0
        ? [{ name: 'item1' }, { name: 'item2' }, { name: 'trackedProperty' }]
        : [
            { name: 'ObjectWithTracked' },
            { child: 'item1', changed: true },
            { child: 'item2' },
            { name: 'Object:My Object.trackedProperty' },
          ];
    assert.deepEqual(prop.dependentKeys, dependentKeys);
  });

  skip('Correct mixin order with es6 class', async function (assert) {
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
      foobar = 1;
    }

    const inspected = Foo.create({
      ownProp: 'hi',
    });

    let message = await inspectObject(inspected);

    const mixinNames = message.details.map((d) => d.name);
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
      'CoreObject',
    ];

    expectedMixinNames.forEach((expectedMixinName, i) => {
      assert.ok(
        mixinNames[i].includes(expectedMixinName),
        `${mixinNames[i]} : ${expectedMixinName}`,
      );
    });
  });

  test('Proxies are skipped by default', async function (assert) {
    let inspected = EmberObject.extend({
      test: 'a',
      get abc() {
        return 1;
      },
    }).create();
    const proxy = ObjectProxy.create({
      content: inspected,
    });
    let message = await inspectObject(proxy);
    let computedProperty = message.details[1].properties[0];
    assert.strictEqual(computedProperty.name, 'test');
    assert.strictEqual(computedProperty.value.inspect, inspect('a'));

    let getterProperty = message.details[1].properties[1];
    assert.strictEqual(getterProperty.name, 'abc');
    assert.strictEqual(getterProperty.value.inspect, inspect(1));
  });

  test('Object Proxies are not skipped with _showProxyDetails', async function (assert) {
    let inspected = EmberObject.extend({
      test: 'a',
    }).create();
    const proxy = ObjectProxy.create({
      content: inspected,
      _showProxyDetails: true,
      prop: 'b',
    });
    let message = await inspectObject(proxy);
    let computedProperty = message.details[0].properties[1];
    assert.strictEqual(computedProperty.name, 'prop');
    assert.strictEqual(computedProperty.value.inspect, inspect('b'));
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
      },
    }).create();

    const proxy = ArrayProxy.create({
      content: array,
    });

    let message = await inspectObject(proxy);

    let property = message.details[0].properties[0];
    assert.strictEqual(property.name, '0');
    assert.strictEqual(property.value.inspect, '1');

    property = message.details[0].properties[1];
    assert.strictEqual(property.name, 'length');
    assert.strictEqual(property.value.inspect, '1');
  });

  skip('Correct mixin properties', async function (assert) {
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

    const mix1 = MyMixin.create({ a: 'custom1' });
    const mix2 = MyMixin2.create({ b: 'custom2' });

    class Foo extends EmberObject.extend(mix1, mix2) {}

    const instance = Foo.create({
      ownProp: 'b',
    });

    let { details } = await inspectObject(instance);

    assert.strictEqual(
      details[0].properties.length,
      1,
      'should not show mixin properties',
    );
    assert.strictEqual(details[0].properties[0].name, 'ownProp');

    assert.strictEqual(details[2].name, 'MyMixin1');
    assert.strictEqual(
      details[2].properties.length,
      1,
      'should only show own mixin properties',
    );
    assert.strictEqual(
      details[2].properties[0].value.inspect,
      inspect('custom1'),
    );

    assert.strictEqual(details[3].name, 'MyMixin2');
    assert.strictEqual(
      details[3].properties.length,
      1,
      'should only show own mixin properties',
    );
    assert.strictEqual(
      details[3].properties[0].value.inspect,
      inspect('custom2'),
    );
  });

  test('Computed properties are correctly calculated', async function (assert) {
    let inspected = EmberObject.extend({
      hi: computed(function () {
        assert.step('calculating computed');
        return 'Hello';
      }),
      _debugInfo() {
        return {
          propertyInfo: {
            expensiveProperties: ['hi'],
          },
        };
      },
    }).create();

    assert.step('inspector: sendObject');
    let message = await inspectObject(inspected);
    let computedProperty = message.details[1].properties[0];
    assert.strictEqual(computedProperty.name, 'hi');
    assert.ok(computedProperty.isComputed);
    assert.strictEqual(computedProperty.value.type, 'type-descriptor');
    assert.strictEqual(computedProperty.value.inspect, '<computed>');

    let id = message.objectId;

    assert.step('inspector: calculate');
    message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId: id,
        property: 'hi',
        mixinIndex: 1,
      });
    });
    assert.strictEqual(message.objectId, id);
    assert.strictEqual(message.property, 'hi');
    assert.strictEqual(message.mixinIndex, 1);
    assert.strictEqual(message.value.type, 'type-string');
    assert.strictEqual(message.value.inspect, inspect('Hello'));
    assert.ok(message.value.isCalculated);

    assert.verifySteps([
      'inspector: sendObject',
      'inspector: calculate',
      'calculating computed',
    ]);
  });

  test('Cached Computed properties are pre-calculated', async function (assert) {
    let inspected = EmberObject.extend({
      hi: computed(function () {
        return 'Hello';
      }),
    }).create();

    // pre-calculate CP
    inspected.get('hi');

    let message = await inspectObject(inspected);

    let computedProperty = message.details[1].properties[0];

    assert.strictEqual(computedProperty.name, 'hi');
    assert.ok(computedProperty.value.isCalculated);
    assert.strictEqual(computedProperty.value.type, 'type-string');
    assert.strictEqual(computedProperty.value.inspect, inspect('Hello'));
  });

  test('Properties are correctly bound', async function (assert) {
    let inspected = EmberObject.extend({
      name: 'Teddy',

      hi: computed({
        get() {
          return 'hello';
        },
        set(key, val) {
          return val;
        },
      }),

      _debugInfo() {
        return {
          propertyInfo: {
            expensiveProperties: ['hi'],
          },
        };
      },
    }).create();

    let { objectId } = await inspectObject(inspected);

    let message = await captureMessage('objectInspector:updateProperty', () => {
      run(() => inspected.set('name', 'Alex'));
    });

    assert.strictEqual(message.objectId, objectId);
    assert.strictEqual(message.property, 'name');
    assert.strictEqual(message.mixinIndex, 1);
    assert.true(message.value.isCalculated);
    assert.strictEqual(message.value.inspect, inspect('Alex'));
    assert.strictEqual(message.value.type, 'type-string');

    // un-cached computed properties are not bound until calculated

    message = await captureMessage('objectInspector:updateProperty', () => {
      run(() => inspected.set('hi', 'Hey'));
    });

    assert.strictEqual(message.objectId, objectId);
    assert.strictEqual(message.property, 'hi');
    assert.strictEqual(message.mixinIndex, 1);
    assert.ok(message.value.isCalculated);
    assert.strictEqual(message.value.inspect, inspect('Hey'));
    assert.strictEqual(message.value.type, 'type-string');

    message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId,
        property: 'hi',
        mixinIndex: 1,
      });
    });

    assert.strictEqual(message.objectId, objectId);
    assert.strictEqual(message.property, 'hi');
    assert.strictEqual(message.mixinIndex, 1);
    assert.ok(message.value.isCalculated);
    assert.strictEqual(message.value.inspect, inspect('Hey'));
    assert.strictEqual(message.value.type, 'type-string');

    message = await captureMessage('objectInspector:updateProperty', () => {
      run(() => inspected.set('hi', 'Hello!'));
    });

    assert.strictEqual(message.objectId, objectId);
    assert.strictEqual(message.property, 'hi');
    assert.strictEqual(message.mixinIndex, 1);
    assert.ok(message.value.isCalculated);
    assert.strictEqual(message.value.inspect, inspect('Hello!'));
    assert.strictEqual(message.value.type, 'type-string');
  });

  test('Properties can be updated through a port message', async function (assert) {
    let inspected = EmberObject.extend({
      name: 'Teddy',
    }).create();

    let { objectId } = await inspectObject(inspected);

    let message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:saveProperty', {
        objectId,
        mixinIndex: 1,
        property: 'name',
        value: 'Alex',
      });
    });

    assert.strictEqual(inspected.name, 'Alex');

    assert.strictEqual(message.property, 'name');
    assert.strictEqual(message.value.inspect, inspect('Alex'));
    assert.strictEqual(message.value.type, 'type-string');
  });

  test('Date properties are converted to dates before being updated', async function (assert) {
    let newDate = new Date(2015, 0, 1);

    let inspected = EmberObject.extend({
      date: null,
    }).create();

    let { objectId } = await inspectObject(inspected);

    let message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:saveProperty', {
        objectId,
        mixinIndex: 1,
        property: 'date',
        value: newDate.getTime(),
        dataType: 'date',
      });
    });

    assert.strictEqual(inspected.date.getFullYear(), 2015);
    assert.strictEqual(inspected.date.getMonth(), 0);
    assert.strictEqual(inspected.date.getDate(), 1);

    assert.strictEqual(message.property, 'date');
    assert.strictEqual(message.value.inspect, inspect(newDate));
    assert.strictEqual(message.value.type, 'type-date');
  });

  test('Property grouping can be customized using _debugInfo', async function (assert) {
    let mixinToSkip = Mixin.create({});

    let Inspected = EmberObject.extend(mixinToSkip, {
      name: 'Teddy',
      gender: 'Male',
      hasChildren: false,
      toString: function () {
        return 'TestObject';
      },
      expensiveProperty: computed(function () {
        return '';
      }),
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
                expand: true,
              },
              {
                name: 'Family Info',
                properties: ['maritalStatus'],
              },
            ],
          },
        };
      },
    });

    Inspected.reopenClass({
      toString: function () {
        return 'TestObject';
      },
    });

    let inspected = Inspected.create({
      maritalStatus: 'Single',
      propertyToSkip: null,
    });

    let message = await inspectObject(inspected);

    assert.strictEqual(message.name, 'TestObject');

    assert.strictEqual(message.details[0].name, 'Basic Info');
    assert.strictEqual(message.details[0].properties[0].name, 'name');
    assert.strictEqual(message.details[0].properties[1].name, 'gender');
    assert.ok(message.details[0].expand);

    assert.strictEqual(message.details[1].name, 'Family Info');
    assert.strictEqual(message.details[1].properties[0].name, 'maritalStatus');

    assert.strictEqual(message.details[2].name, 'Own Properties');
    assert.strictEqual(
      message.details[2].properties.length,
      0,
      'Correctly skips properties',
    );

    assert.strictEqual(message.details[3].name, 'TestObject');
    assert.strictEqual(
      message.details[3].properties.length,
      3,
      'Correctly merges properties',
    );

    const toString = message.details[3].properties.find(
      (p) => p.name === 'toString',
    );
    const hasChildren = message.details[3].properties.find(
      (p) => p.name === 'hasChildren',
    );
    const expensiveProperty = message.details[3].properties.find(
      (p) => p.name === 'expensiveProperty',
    );
    assert.ok(toString, 'has toString');
    assert.ok(hasChildren, 'has hasChildren');
    assert.strictEqual(
      expensiveProperty.name,
      'expensiveProperty',
      'property name is correct',
    );
    assert.strictEqual(
      expensiveProperty.value.isCalculated,
      undefined,
      'Does not calculate expensive properties',
    );

    assert.notStrictEqual(
      message.details[3].name,
      'MixinToSkip',
      'Correctly skips mixins',
    );
  });

  test('Property grouping can be customized using _debugInfo when using Proxy', async function (assert) {
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
      toString: function () {
        return 'TestObject';
      },
      expensiveProperty: computed(function () {
        return '';
      }),
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
                expand: true,
              },
              {
                name: 'Family Info',
                properties: ['maritalStatus'],
              },
            ],
          },
        };
      },
    });

    Inspected.reopenClass({
      toString: function () {
        return 'TestObject';
      },
    });

    let inspected = Inspected.create({
      maritalStatus: 'Single',
      propertyToSkip: null,
    });

    const proxy = ObjectProxy.create({
      content: inspected,
    });

    let message = await inspectObject(proxy);

    assert.ok(
      message.name.includes('ObjectProxy'),
      'object name should start with <ObjectProxy:',
    );

    assert.strictEqual(message.details[0].name, 'Basic Info');
    assert.strictEqual(message.details[0].properties[0].name, 'name');
    assert.strictEqual(message.details[0].properties[1].name, 'gender');
    assert.ok(message.details[0].expand);

    assert.strictEqual(message.details[1].name, 'Family Info');
    assert.strictEqual(message.details[1].properties[0].name, 'maritalStatus');

    assert.strictEqual(message.details[2].name, 'Own Properties');
    assert.strictEqual(
      message.details[2].properties.length,
      0,
      'Correctly skips properties',
    );

    assert.strictEqual(message.details[3].name, 'TestObject');
    assert.strictEqual(
      message.details[3].properties.length,
      3,
      'Correctly merges properties',
    );

    const hasChildren = message.details[3].properties.find(
      (p) => p.name === 'hasChildren',
    );
    const expensiveProperty = message.details[3].properties.find(
      (p) => p.name === 'expensiveProperty',
    );
    assert.strictEqual(hasChildren.name, 'hasChildren');
    assert.strictEqual(
      expensiveProperty.name,
      'expensiveProperty',
      'property name is correct',
    );
    assert.strictEqual(
      expensiveProperty.value.isCalculated,
      undefined,
      'Does not calculate expensive properties',
    );

    assert.notStrictEqual(
      message.details[3].name,
      'MixinToSkip',
      'Correctly skips mixins',
    );
  });

  test('Service should be successfully tagged as service on serialization', async function (assert) {
    let inspectedService = Service.extend({
      fooBoo() {
        return true;
      },
    }).create();

    let inspected = EmberObject.extend({
      service: inspectedService,
    }).create();

    let message = await inspectObject(inspected);

    let serializedServiceProperty = message.details[1].properties[0];

    assert.true(serializedServiceProperty.isService);
  });

  test('Proxy Service should be successfully tagged as service on serialization', async function (assert) {
    let inspectedService = Service.extend({
      unknownProperty() {
        return true;
      },
    }).create();

    let inspected = EmberObject.extend({
      service: inspectedService,
    }).create();

    let message = await inspectObject(inspected);

    let serializedServiceProperty = message.details[1].properties[0];

    assert.true(serializedServiceProperty.isService);
  });

  test('Computed property dependent keys and code should be successfully serialized', async function (assert) {
    let computedFn = function () {
      return this.foo + this.bar;
    };

    let inspected = EmberObject.extend({
      foo: true,
      bar: false,
      fooAndBar: computed('foo', 'bar', computedFn),
    }).create();

    let message = await inspectObject(inspected);
    let serializedComputedProperty = message.details[1].properties[2];

    assert.strictEqual(serializedComputedProperty.code, computedFn.toString());
    assert.strictEqual(serializedComputedProperty.dependentKeys[0].name, 'foo');
    assert.strictEqual(serializedComputedProperty.dependentKeys[1].name, 'bar');
  });

  test('Views are correctly handled when destroyed during transitions', async function (assert) {
    let objectId = null;

    await visit('/simple');

    objectId = find('.simple-view').id;
    let view = this.owner.lookup('-view-registry:main')[objectId];
    await inspectObject(view);

    assert.ok(
      objectInspector.sentObjects[objectId],
      'Object successfully retained.',
    );

    await visit('/');

    assert.ok(true, 'No exceptions thrown');
  });

  test('Objects are dropped on destruction', async function (assert) {
    let didDestroy = false;
    let object = EmberObject.create({
      willDestroy() {
        didDestroy = true;
      },
    });
    let objectId = guidFor(object);

    let message = await inspectObject(object);

    assert.strictEqual(message.objectId, objectId, 'objectId matches');

    assert.ok(
      objectInspector.sentObjects[objectId],
      'Object successfully retained.',
    );

    message = await captureMessage('objectInspector:droppedObject', () => {
      run(object, 'destroy');
    });

    assert.ok(didDestroy, 'Original willDestroy is preserved.');
    assert.notOk(objectInspector.sentObjects[objectId], 'Object is dropped');
    assert.deepEqual(message, { objectId });
  });

  test('Properties ending with `Binding` are skipped', async function (assert) {
    let object = EmberObject.create({
      bar: 'test',
      fooBinding: 'bar',
    });

    let message = await inspectObject(object);

    let props = message.details[0].properties;
    if (!hasEmberVersion(3, 0)) {
      assert.strictEqual(
        props.length,
        2,
        'Props should be foo and bar without fooBinding',
      );
      assert.strictEqual(props[1].name, 'foo');
    } else {
      assert.strictEqual(
        props.length,
        1,
        'Props should be only bar without fooBinding, in Ember 3.0+',
      );
    }
    assert.strictEqual(props[0].name, 'bar');
  });

  test("Properties listed in _debugInfo but don't exist should be skipped silently", async function (assert) {
    let object = EmberObject.create({
      foo: 'test',
      _debugInfo() {
        return {
          propertyInfo: {
            groups: [
              {
                name: 'Attributes',
                properties: ['foo', 'bar'],
              },
            ],
          },
        };
      },
    });

    let message = await inspectObject(object);

    let props = message.details[0].properties;
    assert.strictEqual(props.length, 1, 'bar should be silently skipped');
    assert.strictEqual(props[0].name, 'foo');
  });

  test('Errors while computing CPs are handled', async function (assert) {
    let count = 0;
    let object = run(() =>
      EmberObject.extend({
        foo: computed(function () {
          if (count++ < 2) {
            throw new Error('CP Calculation');
          }
          return 'bar';
        }),
      }).create(),
    );

    let message = await inspectObject(object);

    let { objectId } = message;
    assert.strictEqual(objectId, guidFor(object), 'objectId matches');

    let errors = message.errors;
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].property, 'foo');

    // Calculate CP a second time
    message = await captureMessage('objectInspector:updateErrors', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId,
        property: 'foo',
        mixinIndex: 1,
      });
    });

    assert.strictEqual(message.errors.length, 1);
    assert.strictEqual(message.errors[0].property, 'foo');

    // Calculate CP a third time (no error this time)
    message = await captureMessage('objectInspector:updateProperty', () => {
      EmberDebug.port.trigger('objectInspector:calculate', {
        objectId: guidFor(object),
        property: 'foo',
        mixinIndex: 1,
      });
    });

    assert.strictEqual(message.value.inspect, inspect('bar'));
  });

  test('Plain properties work', async function (assert) {
    let inspected = EmberObject.create({ hi: 123 });
    let message = await inspectObject(inspected);

    let plainProperty = message.details[0].properties[0];
    assert.strictEqual(plainProperty.name, 'hi');
    assert.ok(plainProperty.isProperty);
    assert.strictEqual(plainProperty.value.type, 'type-number');
    assert.strictEqual(plainProperty.value.inspect, '123');
  });

  test('Plain properties with period in name do not use nested value', async function (assert) {
    let inspected = EmberObject.create({
      'hi.there': 123,
      hi: { there: 456 },
    });
    let message = await inspectObject(inspected);

    let plainProperty = message.details[0].properties[0];
    assert.strictEqual(plainProperty.name, 'hi.there');
    assert.ok(plainProperty.isProperty);
    assert.strictEqual(plainProperty.value.type, 'type-number');
    assert.strictEqual(plainProperty.value.inspect, '123');

    plainProperty = message.details[0].properties[1];
    assert.strictEqual(plainProperty.name, 'hi');
    assert.ok(plainProperty.isProperty);
    assert.strictEqual(plainProperty.value.type, 'type-object');
    assert.strictEqual(plainProperty.value.inspect, '{ there: 456 }');
  });

  test('Getters work', async function (assert) {
    class Foo {
      get hi() {
        return 123;
      }
    }

    let inspected = new Foo();

    let message = await inspectObject(inspected);
    let getter = message.details[1].properties[0];
    assert.strictEqual(getter.name, 'hi');
    assert.ok(getter.isGetter);
    assert.notOk(getter.isTracked);
    assert.strictEqual(getter.value.type, 'type-number');
    assert.strictEqual(getter.value.inspect, '123');
  });

  if (hasEmberVersion(3, 13)) {
    test('Tracked properties work', async function (assert) {
      class Foo {
        @tracked hi = 123;
      }

      let inspected = new Foo();

      assert.step('inspector: sendObject');
      let message = await inspectObject(inspected);
      let trackedProp = message.details[1].properties[0];
      assert.strictEqual(trackedProp.name, 'hi');
      assert.ok(trackedProp.isTracked);
      assert.strictEqual(trackedProp.value.type, 'type-number');
      assert.strictEqual(trackedProp.value.inspect, '123');

      assert.step('inspector: update value');
      message = await captureMessage('objectInspector:updateProperty', () => {
        run(() => inspected.hi++);
      });

      assert.step('inspector: updateProperty');
      assert.strictEqual(message.property, 'hi');
      assert.strictEqual(message.mixinIndex, 1);
      assert.strictEqual(message.value.type, 'type-number');
      assert.strictEqual(message.value.inspect, inspect(124));
      assert.ok(message.value.isCalculated);

      assert.verifySteps([
        'inspector: sendObject',
        'inspector: update value',
        'inspector: updateProperty',
      ]);
    });

    test('Tracked getters update', async function (assert) {
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
      assert.strictEqual(trackedProp.name, 'hello');
      assert.ok(trackedProp.isGetter);
      assert.strictEqual(trackedProp.value.type, 'type-number');
      assert.strictEqual(trackedProp.value.inspect, '123');

      assert.step('inspector: update value');
      message = await captureMessage('objectInspector:updateProperty', () => {
        run(() => dataSource.hi++);
      });

      assert.step('inspector: updateProperty');
      assert.strictEqual(message.property, 'hello');
      assert.strictEqual(message.mixinIndex, 1);
      assert.strictEqual(message.value.type, 'type-number');
      assert.strictEqual(message.value.inspect, inspect(124));
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
    test('Inspecting GlimmerComponent does not cause errors', async function (assert) {
      let instance;

      class Foo extends GlimmerComponent {
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

      this.owner.register('template:simple', hbs`<Foo />`, {
        moduleName: 'my-app/templates/simple.hbs',
      });

      this.owner.register('component:foo', Foo);
      this.owner.register(
        `template:components/foo`,
        hbs('text only', {
          moduleName: 'my-app/templates/components/foo.hbs',
        }),
      );
      await visit('/simple');

      assert.ok(instance instanceof Foo, 'an instance of Foo has been created');

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

      assert.strictEqual(
        properties.indexOf('bounds'),
        -1,
        'does not contain bounds',
      );
      assert.strictEqual(
        properties.indexOf('element'),
        -1,
        'does not contain element',
      );
      assert.strictEqual(
        properties.indexOf('debugName'),
        -1,
        'does not contain debugName',
      );
    });
  }
});
