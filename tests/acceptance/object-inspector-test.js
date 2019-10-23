import {
  visit,
  find,
  findAll,
  click,
  fillIn,
  triggerKeyEvent
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { triggerPort } from '../helpers/trigger-port';

let port, message, name;


module('Object Inspector', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
    port.reopen({
      send(n, m) {
        name = n;
        message = m;
      }
    });
  });

  hooks.afterEach(function() {
    name = null;
    message = null;
  });

  const objectAttr = {
    name: 'Object Name',
    objectId: 1,
    errors: [],
    details: [
      {
        name: 'Own Properties',
        expand: true,
        properties: [{
          name: 'id',
          value: 1
        }]
      }
    ]
  };

  function objectFactory(props) {
    return Object.assign({}, objectAttr, props);
  }

  function objectToInspect() {
    return objectFactory({
      name: 'My Object',
      objectId: 'objectId',
      errors: [],
      details: [
        {
          name: 'First Detail',
          expand: false,
          properties: [{
            name: 'numberProperty',
            value: {
              inspect: 1,
              value: 'type-number'
            }
          }]
        },
        {
          name: 'Second Detail',
          properties: [
            {
              name: 'objectProperty',
              value: {
                inspect: 'Ember Object Name',
                type: 'type-ember-object'
              }
            }, {
              name: 'stringProperty',
              value: {
                inspect: 'String Value',
                type: 'type-ember-string'
              }
            }
          ]
        }
      ]
    });
  }

  test("The object displays correctly", async function (assert) {
    let obj = objectFactory({ name: 'My Object' });
    await visit('/');

    await triggerPort(this, 'objectInspector:updateObject', obj);

    assert.dom('.js-object-name').hasText('My Object');
    assert.dom('.js-object-detail-name').hasText('Own Properties');
    assert.dom('.js-object-detail').hasClass(
      'mixin_state_expanded',
      'The "Own Properties" detail is expanded by default'
    );
  });

  test("Object details", async function (assert) {
    await visit('/');

    await triggerPort(this, 'objectInspector:updateObject', objectToInspect());

    assert.dom('.js-object-name').hasText('My Object');
    let [firstDetail, secondDetail] = findAll('.js-object-detail');
    assert.dom(firstDetail.querySelector('.js-object-detail-name')).hasText('First Detail');
    assert.dom(firstDetail).hasNoClass('mixin_state_expanded', 'Detail not expanded by default');

    await click('.js-object-detail-name', firstDetail);

    assert.dom(firstDetail).hasClass('mixin_state_expanded', 'Detail expands on click.');
    assert.dom(secondDetail).hasNoClass('mixin_state_expanded', 'Second detail does not expand.');
    assert.equal(firstDetail.querySelectorAll('.js-object-property').length, 1);
    assert.dom(firstDetail.querySelector('.js-object-property-name')).hasText('numberProperty');
    assert.dom(firstDetail.querySelector('.js-object-property-value')).hasText('1');
    await click(firstDetail.querySelector('.js-object-detail-name'));

    assert.dom(firstDetail).hasNoClass('mixin_state_expanded', 'Expanded detail minimizes on click.');
    await click(secondDetail.querySelector('.js-object-detail-name'));

    assert.dom(secondDetail).hasClass('mixin_state_expanded');
    assert.equal(secondDetail.querySelectorAll('.js-object-property').length, 2);
    assert.dom(secondDetail.querySelectorAll('.js-object-property-name')[0]).hasText('objectProperty');
    assert.dom(secondDetail.querySelectorAll('.js-object-property-value')[0]).hasText('Ember Object Name');
    assert.dom(secondDetail.querySelectorAll('.js-object-property-name')[1]).hasText('stringProperty');
    assert.dom(secondDetail.querySelectorAll('.js-object-property-value')[1]).hasText('String Value');
  });

  test("Digging deeper into objects", async function (assert) {
    let secondDetail;

    await visit('/');

    triggerPort(this, 'objectInspector:updateObject', objectToInspect());

    secondDetail = findAll('.js-object-detail')[1];
    await click(secondDetail.querySelector('.js-object-detail-name'));

    await click('.js-object-property .js-object-property-value');

    assert.equal(name, 'objectInspector:digDeeper');
    assert.deepEqual(message, { objectId: 'objectId', property: 'objectProperty' });

    let nestedObject = {
      parentObject: 'objectId',
      name: 'Nested Object',
      objectId: 'nestedObject',
      property: 'objectProperty',
      details: [{
        name: 'Nested Detail',
        properties: [{
          name: 'nestedProp',
          value: {
            inspect: 'Nested Prop',
            type: 'type-string'
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', nestedObject);

    assert.dom('.js-object-name').hasText('My Object', 'Title stays as the initial object.');
    assert.dom('.js-object-trail').hasText('.objectProperty', 'Nested property shows below title');
    assert.dom('.js-object-detail-name').hasText('Nested Detail');
    await click('.js-object-detail-name');

    assert.dom('.js-object-detail').hasClass('mixin_state_expanded');
    assert.dom('.js-object-property-name').hasText('nestedProp');
    assert.dom('.js-object-property-value').hasText('Nested Prop');
    await click('.js-object-inspector-back');

    assert.dom('.js-object-trail').doesNotExist(0);
  });

  test("Computed properties", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'computedProp',
          isComputed: true,
          value: {
            inspect: '<computed>',
            type: 'type-descriptor',
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);

    await click('.js-object-detail-name');
    await click('.js-calculate');

    assert.equal(name, 'objectInspector:calculate');
    assert.deepEqual(message, { objectId: 'myObject', property: 'computedProp', mixinIndex: 0 });
    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'computedProp',
      value: {
        inspect: 'Computed value',
        isCalculated: true
      },
      mixinIndex: 0
    });
    assert.dom('.js-object-property-value').hasText('Computed value');
  });

  test("Service highlight", async function(assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'serviceProp',
          isService: true,
          value: {
            inspect: '<service>'
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);
    await click('.js-object-detail-name');

    assert.dom('.mixin__property--group').exists({ count: 1 });
    assert.dom('.mixin__property-icon--service').exists({ count: 1 });
    assert.dom('.js-property-name-service').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert.dom('.mixin__property-dependency-item > .mixin__property-dependency-name').doesNotExist();
  });

  test("Computed properties no dependency", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'computedProp',
          dependentKeys: [],
          isComputed: true,
          value: {
            inspect: '<computed>',
            type: 'type-descriptor',
            isCalculated: false
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);

    await click('.js-object-detail-name');
    await click('.js-calculate');

    assert.equal(name, 'objectInspector:calculate');
    assert.deepEqual(message, { objectId: 'myObject', property: 'computedProp', mixinIndex: 0 });
    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'computedProp',
      value: {
        inspect: 'Computed value',
        computed: 'foo-bar'
      },
      mixinIndex: 0
    });

    assert.dom('.mixin__property--group').doesNotExist();

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert.dom('.mixin__property-dependency-item > .mixin__property-dependency-name').doesNotExist();

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert.dom('.mixin__property-dependency-item > .mixin__property-dependency-name').doesNotExist();
  });

  test("Computed properties dependency expand", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'computedProp',
          dependentKeys: ['foo.@each.bar'],
          isComputed: true,
          value: {
            inspect: '<computed>',
            type: 'type-descriptor',
          }
        }]
      }]
    };
    await triggerPort(this, 'objectInspector:updateObject', obj);
    await click('.js-object-detail-name');
    await click('.js-calculate');

    assert.equal(name, 'objectInspector:calculate');
    assert.deepEqual(message, { objectId: 'myObject', property: 'computedProp', mixinIndex: 0 });
    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'computedProp',
      value: {
        inspect: 'Computed value',
        isCalculated: true
      },
      mixinIndex: 0
    });

    assert.dom('.mixin__property--group').exists({ count: 1 });

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-item').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-item > .mixin__property-dependency-name').exists({ count: 1 });

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert.dom('.mixin__property-dependency-item > .mixin__property-dependency-name').doesNotExist();

    // All View

    await click('.js-object-display-type-all');
    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-item').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-item > .mixin__property-dependency-name').exists({ count: 1 });
  });

  test("Properties are bound to the application properties", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'object-id',
      details: [{
        name: 'Own Properties',
        expand: true,
        properties: [{
          name: 'boundProp',
          value: {
            inspect: 'Teddy',
            type: 'type-string',
            isCalculated: false
          }
        }]

      }]
    };
    await triggerPort(this, 'objectInspector:updateObject', obj);

    assert.dom('.js-object-property-value').hasText('Teddy');
    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'object-id',
      mixinIndex: 0,
      property: 'boundProp',
      value: {
        inspect: 'Alex',
        type: 'type-string',
        isCalculated: true
      }
    });

    await click('.js-object-property-value');

    let txtField = find('.js-object-property-value-txt');
    assert.equal(txtField.value, '"Alex"');
    await fillIn(txtField, '"Joey"');

    await triggerKeyEvent('.js-object-property-value-txt', 'keyup', 13);
    assert.equal(name, 'objectInspector:saveProperty');
    assert.equal(message.property, 'boundProp');
    assert.equal(message.value, 'Joey');

    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'object-id',
      mixinIndex: 0,
      property: 'boundProp',
      value: {
        inspect: 'Joey',
        type: 'type-string',
        isCalculated: false
      }
    });

    assert.dom('.js-object-property-value').hasText('Joey');
  });

  test("Stringified json should not get double parsed", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'object-id',
      details: [{
        name: 'Own Properties',
        expand: true,
        properties: [{
          name: 'boundProp',
          value: {
            inspect: '{"name":"teddy"}',
            type: 'type-string',
            isCalculated: true
          }
        }]

      }]
    };
    await triggerPort(this, 'objectInspector:updateObject', obj);

    await click('.js-object-property-value');

    let txtField = find('.js-object-property-value-txt');
    assert.equal(txtField.value, '"{"name":"teddy"}"');
    await fillIn(txtField, '"{"name":"joey"}"');

    await triggerKeyEvent('.js-object-property-value-txt', 'keyup', 13);
    assert.equal(name, 'objectInspector:saveProperty');
    assert.equal(message.property, 'boundProp');
    assert.equal(message.value, '{"name":"joey"}');
  });

  test("Send to console", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'object-id',
      details: [{
        name: 'Own Properties',
        expand: true,
        properties: [{
          name: 'myProp',
          value: {
            inspect: 'Teddy',
            type: 'type-string',
            isCalculated: true
          }
        }]

      }]
    };
    await triggerPort(this, 'objectInspector:updateObject', obj);

    // Grouped View
    await click('.js-send-to-console-btn');

    assert.equal(name, 'objectInspector:sendToConsole');
    assert.equal(message.objectId, 'object-id');
    assert.equal(message.property, 'myProp');

    await click('.js-send-object-to-console-btn');

    assert.equal(name, 'objectInspector:sendToConsole');
    assert.equal(message.objectId, 'object-id');
    assert.equal(message.property, undefined);

    // All View

    await click('.js-object-display-type-all');
    await click('.js-send-object-to-console-btn');
    assert.equal(name, 'objectInspector:sendToConsole');
    assert.equal(message.objectId, 'object-id');
    assert.equal(message.property, undefined);
  });

  test("Read only CPs cannot be edited", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'object-id',
      details: [{
        name: 'Own Properties',
        expand: true,
        properties: [{
          name: 'readCP',
          readOnly: true,
          value: {
            isCalculated: true,
            inspect: 'Read',
            type: 'type-string'
          }
        }, {
          name: 'readCP',
          readOnly: false,
          value: {
            isCalculated: true,
            inspect: 'Write',
            type: 'type-string'
          }
        }]
      }]
    };
    await triggerPort(this, 'objectInspector:updateObject', obj);
    await click('.js-object-property-value');
    assert.dom('.js-object-property-value-txt').doesNotExist();

    let valueElements = findAll('.js-object-property-value');
    await click(valueElements[valueElements.length - 1]);

    assert.dom('.js-object-property-value-txt').exists();
  });

  test("Dropping an object due to destruction", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: []
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);

    assert.dom('.js-object-name').hasText('My Object');
    await triggerPort(this, 'objectInspector:droppedObject', { objectId: 'myObject' });

    assert.dom('.js-object-name').doesNotExist();
  });

  test("Date fields are editable", async function (assert) {
    await visit('/');

    let date = new Date();

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'First Detail',
        expand: false,
        properties: [{
          name: 'dateProperty',
          value: {
            inspect: date.toString(),
            type: 'type-date'
          }
        }]
      }]
    };
    await triggerPort(this, 'objectInspector:updateObject', obj);
    assert.ok(true);

    await click('.js-object-detail-name');
    await click('.js-object-property-value');

    let field = find('.js-object-property-value-date');
    assert.ok(field);
    await click(field);
    await fillIn(field, '2015-01-01');
    await triggerKeyEvent(field, 'keydown', 13);

    assert.equal(name, 'objectInspector:saveProperty');
    assert.equal(message.property, 'dateProperty');
    assert.equal(message.dataType, 'date');

    let newDate = new Date(message.value);
    assert.equal(newDate.getMonth(), 0);
    assert.equal(newDate.getDate(), 1);
    assert.equal(newDate.getFullYear(), 2015);
  });

  test("Errors are correctly displayed", async function (assert) {
    let obj = objectFactory({
      name: 'My Object',
      objectId: '1',
      errors: [
        { property: 'foo' },
        { property: 'bar' }
      ]
    });
    await visit('/');
    await triggerPort(this, 'objectInspector:updateObject', obj);

    assert.dom('.js-object-name').hasText('My Object');
    assert.dom('.js-object-inspector-errors').exists({ count: 1 });
    assert.dom('.js-object-inspector-error').exists({ count: 2 });

    await click('.js-send-errors-to-console');

    assert.equal(name, 'objectInspector:traceErrors');
    assert.equal(message.objectId, '1');

    await triggerPort(this, 'objectInspector:updateErrors', {
      objectId: '1',
      errors: [
        { property: 'foo' }
      ]
    });

    assert.dom('.js-object-inspector-error').exists();

    await triggerPort(this, 'objectInspector:updateErrors', {
      objectId: '1',
      errors: []
    });

    assert.dom('.js-object-inspector-errors').doesNotExist();
  });

  test("Tracked properties", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'trackedProp',
          isTracked: true,
          value: {
            inspect: 123,
            type: 'type-number',
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);

    await click('.js-object-detail-name');

    assert.dom('.mixin__property-icon--tracked').exists();
    assert.dom('.js-object-property-value').hasText('123');

    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'trackedProp',
      value: {
        inspect: 456
      },
      mixinIndex: 0
    });

    assert.dom('.js-object-property-value').hasText('456');
  });

  test("Plain properties", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'plainProp',
          isProperty: true,
          value: {
            inspect: 123,
            type: 'type-number',
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);

    await click('.js-object-detail-name');

    assert.dom('.mixin__property-icon--property').exists();
    assert.dom('.js-object-property-value').hasText('123');

    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'plainProp',
      value: {
        inspect: 456
      },
      mixinIndex: 0
    });

    assert.dom('.js-object-property-value').hasText('456');
  });

  test("Getters", async function (assert) {
    await visit('/');

    let obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'getter',
          isGetter: true,
          value: {
            inspect: 123,
            type: 'type-number',
          }
        }]
      }]
    };

    await triggerPort(this, 'objectInspector:updateObject', obj);

    await click('.js-object-detail-name');

    assert.dom('.mixin__property-icon--getter').exists();
    assert.dom('.js-object-property-value').hasText('123');

    await triggerPort(this, 'objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'getter',
      value: {
        inspect: 456
      },
      mixinIndex: 0
    });

    assert.dom('.js-object-property-value').hasText('456');
  });
});
