import {
  click,
  fillIn,
  find,
  findAll,
  triggerKeyEvent,
  typeIn,
  visit,
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestAdapter, respondWith, sendMessage } from '../test-adapter';

function objectFactory(props) {
  return {
    name: 'Object Name',
    objectId: 1,
    errors: [],
    details: [
      {
        name: 'Own Properties',
        expand: true,
        properties: [
          {
            name: 'id',
            value: 1,
          },
        ],
      },
    ],
    ...props,
  };
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
        properties: [
          {
            name: 'numberProperty',
            value: {
              inspect: 1,
              value: 'type-number',
            },
          },
        ],
      },
      {
        name: 'Second Detail',
        properties: [
          {
            name: 'objectProperty',
            value: {
              inspect: 'Ember Object Name',
              type: 'type-ember-object',
            },
          },
          {
            name: 'stringProperty',
            value: {
              inspect: 'String Value',
              type: 'type-ember-string',
            },
          },
        ],
      },
      {
        name: 'Third Detail',
        properties: [
          {
            name: 'property.with.dot',
            value: {
              inspect: 'String Value',
              type: 'type-ember-string',
            },
          },
        ],
      },
    ],
  });
}

module('Object Inspector', function (hooks) {
  setupTestAdapter(hooks);
  setupApplicationTest(hooks);

  test('The object displays correctly', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      ...objectFactory({ name: 'My Object' }),
    });

    assert.dom('[data-test-object-name]').hasText('My Object');
    assert.dom('[data-test-object-detail-name]').hasText('Own Properties');
    assert
      .dom('[data-test-object-detail]')
      .hasClass(
        'mixin_state_expanded',
        'The "Own Properties" detail is expanded by default',
      );
  });

  test('Object details', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      ...objectToInspect(),
    });

    assert.dom('[data-test-object-name]').hasText('My Object');
    let [firstDetail, secondDetail, thirdDetail] = findAll(
      '[data-test-object-detail]',
    );
    assert
      .dom(firstDetail.querySelector('[data-test-object-detail-name]'))
      .hasText('First Detail');
    assert
      .dom(firstDetail)
      .hasNoClass('mixin_state_expanded', 'Detail not expanded by default');

    await click('[data-test-object-detail-name]', firstDetail);

    assert
      .dom(firstDetail)
      .hasClass('mixin_state_expanded', 'Detail expands on click.');
    assert
      .dom(secondDetail)
      .hasNoClass('mixin_state_expanded', 'Second detail does not expand.');
    assert
      .dom(thirdDetail)
      .hasNoClass('mixin_state_expanded', 'Third detail does not expand.');
    assert.strictEqual(
      firstDetail.querySelectorAll('[data-test-object-property]').length,
      1,
    );
    assert
      .dom(firstDetail.querySelector('[data-test-object-property-name]'))
      .hasText('numberProperty');
    assert
      .dom(firstDetail.querySelector('[data-test-object-property-value]'))
      .hasText('1');
    await click(firstDetail.querySelector('[data-test-object-detail-name]'));

    assert
      .dom(firstDetail)
      .hasNoClass(
        'mixin_state_expanded',
        'Expanded detail minimizes on click.',
      );
    await click(secondDetail.querySelector('[data-test-object-detail-name]'));

    assert.dom(secondDetail).hasClass('mixin_state_expanded');
    assert.strictEqual(
      secondDetail.querySelectorAll('[data-test-object-property]').length,
      2,
    );
    assert
      .dom(secondDetail.querySelectorAll('[data-test-object-property-name]')[0])
      .hasText('objectProperty');
    assert
      .dom(
        secondDetail.querySelectorAll('[data-test-object-property-value]')[0],
      )
      .hasText('Ember Object Name');
    assert
      .dom(secondDetail.querySelectorAll('[data-test-object-property-name]')[1])
      .hasText('stringProperty');
    assert
      .dom(
        secondDetail.querySelectorAll('[data-test-object-property-value]')[1],
      )
      .hasText('String Value');
    await click(thirdDetail.querySelector('[data-test-object-detail-name]'));

    assert.dom(thirdDetail).hasClass('mixin_state_expanded');
    assert.strictEqual(
      thirdDetail.querySelectorAll('[data-test-object-property]').length,
      1,
    );
    assert
      .dom(thirdDetail.querySelectorAll('[data-test-object-property-name]')[0])
      .hasText('property.with.dot');
    assert
      .dom(thirdDetail.querySelectorAll('[data-test-object-property-value]')[0])
      .hasText('String Value');
  });

  test('Digging deeper into objects', async function (assert) {
    assert.expect(8);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      ...objectToInspect(),
    });

    respondWith('objectInspector:digDeeper', {
      type: 'objectInspector:updateObject',
      parentObject: 'objectId',
      name: 'Nested Object',
      objectId: 'nestedObject',
      property: 'objectProperty',
      details: [
        {
          name: 'Nested Detail',
          properties: [
            {
              name: 'nestedProp',
              value: {
                inspect: 'Nested Prop',
                type: 'type-string',
              },
            },
          ],
        },
      ],
    });

    let secondDetail = findAll('[data-test-object-detail]')[1];

    await click(secondDetail.querySelector('[data-test-object-detail-name]'));
    await click(
      '[data-test-object-property] [data-test-object-property-value]',
    );

    assert
      .dom('[data-test-object-name]')
      .hasText('My Object', 'Title stays as the initial object.');
    assert
      .dom('[data-test-object-trail]')
      .hasText('.objectProperty', 'Nested property shows below title');
    assert.dom('[data-test-object-detail-name]').hasText('Nested Detail');

    await click('[data-test-object-detail-name]');

    assert.dom('[data-test-object-detail]').hasClass('mixin_state_expanded');
    assert.dom('[data-test-object-property-name]').hasText('nestedProp');
    assert.dom('[data-test-object-property-value]').hasText('Nested Prop');

    respondWith('objectInspector:releaseObject', ({ objectId }) => {
      assert.strictEqual(objectId, 'nestedObject');
      return false;
    });

    await click('[data-test-object-inspector-back]');

    assert.dom('[data-test-object-trail]').doesNotExist(0);
  });

  test('Digging deeper into objects works when digging into nested object with periods in name', async function (assert) {
    assert.expect(8);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      ...objectToInspect(),
    });

    respondWith('objectInspector:digDeeper', {
      type: 'objectInspector:updateObject',
      parentObject: 'objectId',
      name: 'Nested Object',
      objectId: 'nestedObject',
      property: 'object.Property',
      details: [
        {
          name: 'Nested Detail',
          properties: [
            {
              name: 'nestedProp',
              value: {
                inspect: 'Nested Prop',
                type: 'type-string',
              },
            },
          ],
        },
      ],
    });

    let secondDetail = findAll('[data-test-object-detail]')[1];

    await click(secondDetail.querySelector('[data-test-object-detail-name]'));
    await click(
      '[data-test-object-property] [data-test-object-property-value]',
    );

    assert
      .dom('[data-test-object-name]')
      .hasText('My Object', 'Title stays as the initial object.');
    assert
      .dom('[data-test-object-trail]')
      .hasText('.object.Property', 'Nested property shows below title');
    assert.dom('[data-test-object-detail-name]').hasText('Nested Detail');

    await click('[data-test-object-detail-name]');

    assert.dom('[data-test-object-detail]').hasClass('mixin_state_expanded');
    assert.dom('[data-test-object-property-name]').hasText('nestedProp');
    assert.dom('[data-test-object-property-value]').hasText('Nested Prop');

    respondWith('objectInspector:releaseObject', ({ objectId }) => {
      assert.strictEqual(objectId, 'nestedObject');
      return false;
    });

    await click('[data-test-object-inspector-back]');

    assert.dom('[data-test-object-trail]').doesNotExist(0);
  });

  test('Digging deeper into objects works with nested objects containing properties with periods in name', async function (assert) {
    assert.expect(8);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      ...objectToInspect(),
    });

    respondWith('objectInspector:digDeeper', {
      type: 'objectInspector:updateObject',
      parentObject: 'objectId',
      name: 'Nested Object',
      objectId: 'nestedObject',
      property: 'objectProperty',
      details: [
        {
          name: 'Nested Detail',
          properties: [
            {
              name: 'nested.Prop',
              value: {
                inspect: 'Nested Prop',
                type: 'type-string',
              },
            },
          ],
        },
      ],
    });

    let secondDetail = findAll('[data-test-object-detail]')[1];

    await click(secondDetail.querySelector('[data-test-object-detail-name]'));
    await click(
      '[data-test-object-property] [data-test-object-property-value]',
    );

    assert
      .dom('[data-test-object-name]')
      .hasText('My Object', 'Title stays as the initial object.');
    assert
      .dom('[data-test-object-trail]')
      .hasText('.objectProperty', 'Nested property shows below title');
    assert.dom('[data-test-object-detail-name]').hasText('Nested Detail');

    await click('[data-test-object-detail-name]');

    assert.dom('[data-test-object-detail]').hasClass('mixin_state_expanded');
    assert.dom('[data-test-object-property-name]').hasText('nested.Prop');
    assert.dom('[data-test-object-property-value]').hasText('Nested Prop');

    respondWith('objectInspector:releaseObject', ({ objectId }) => {
      assert.strictEqual(objectId, 'nestedObject');
      return false;
    });

    await click('[data-test-object-inspector-back]');

    assert.dom('[data-test-object-trail]').doesNotExist(0);
  });

  test('Computed properties', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'computedProp',
              isComputed: true,
              value: {
                inspect: '<computed>',
                type: 'type-descriptor',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    respondWith(
      'objectInspector:calculate',
      ({ objectId, property, mixinIndex }) => ({
        type: 'objectInspector:updateProperty',
        objectId,
        property,
        mixinIndex,
        value: {
          inspect: 'Computed value',
          isCalculated: true,
        },
      }),
    );

    await click('[data-test-calculate]');

    assert.dom('[data-test-object-property-value]').hasText('Computed value');
  });

  test('Service highlight', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'serviceProp',
              isService: true,
              value: {
                inspect: '<service>',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    assert.dom('.mixin__property--group').exists({ count: 1 });
    assert.dom('.mixin__property-icon--service').exists({ count: 1 });
    assert.dom('[data-test-property-name-service]').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert
      .dom(
        '.mixin__property-dependency-item > .mixin__property-dependency-name',
      )
      .doesNotExist();
  });

  test('Computed properties no dependency', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'computedProp',
              dependentKeys: [],
              isComputed: true,
              value: {
                inspect: '<computed>',
                type: 'type-descriptor',
                isCalculated: false,
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    respondWith(
      'objectInspector:calculate',
      ({ objectId, property, mixinIndex }) => ({
        type: 'objectInspector:updateProperty',
        objectId,
        property,
        mixinIndex,
        value: {
          inspect: 'Computed value',
          computed: 'foo-bar',
        },
      }),
    );

    await click('[data-test-calculate]');

    assert.dom('.mixin__property--group').doesNotExist();

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert
      .dom(
        '.mixin__property-dependency-item > .mixin__property-dependency-name',
      )
      .doesNotExist();

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert
      .dom(
        '.mixin__property-dependency-item > .mixin__property-dependency-name',
      )
      .doesNotExist();
  });

  test('Computed properties dependency expand', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'computedProp',
              dependentKeys: ['foo.@each.bar'],
              isComputed: true,
              value: {
                inspect: '<computed>',
                type: 'type-descriptor',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    respondWith(
      'objectInspector:calculate',
      ({ objectId, property, mixinIndex }) => ({
        type: 'objectInspector:updateProperty',
        objectId,
        property,
        mixinIndex,
        value: {
          inspect: 'Computed value',
          isCalculated: true,
        },
      }),
    );

    await click('[data-test-calculate]');

    assert.dom('.mixin__property--group').exists({ count: 1 });

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-item').exists({ count: 1 });
    assert
      .dom(
        '.mixin__property-dependency-item > .mixin__property-dependency-name',
      )
      .exists({ count: 1 });

    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').doesNotExist();
    assert.dom('.mixin__property-dependency-item').doesNotExist();
    assert
      .dom(
        '.mixin__property-dependency-item > .mixin__property-dependency-name',
      )
      .doesNotExist();

    // All View

    await click('[data-test-object-display-type-all]');
    await click('.mixin__property-icon--computed');

    assert.dom('.mixin__property-dependency-list').exists({ count: 1 });
    assert.dom('.mixin__property-dependency-item').exists({ count: 1 });
    assert
      .dom(
        '.mixin__property-dependency-item > .mixin__property-dependency-name',
      )
      .exists({ count: 1 });
  });

  test('Properties are bound to the application properties', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'object-id',
      details: [
        {
          name: 'Own Properties',
          expand: true,
          properties: [
            {
              name: 'boundProp',
              value: {
                inspect: 'Teddy',
                type: 'type-string',
                isCalculated: false,
              },
            },
          ],
        },
      ],
    });

    assert.dom('[data-test-object-property-value]').hasText('Teddy');

    await sendMessage({
      type: 'objectInspector:updateProperty',
      objectId: 'object-id',
      mixinIndex: 0,
      property: 'boundProp',
      value: {
        inspect: 'Alex',
        type: 'type-string',
        isCalculated: true,
      },
    });

    await click('[data-test-object-property-value]');

    let txtField = find('[data-test-object-property-value-txt]');
    assert.strictEqual(txtField.value, '"Alex"');

    respondWith(
      'objectInspector:saveProperty',
      ({ objectId, property, value }) => ({
        type: 'objectInspector:updateProperty',
        objectId,
        property,
        mixinIndex: 0,
        value: {
          inspect: value,
          type: 'type-string',
          isCalculated: false,
        },
      }),
    );

    await fillIn(txtField, '"Joey"');
    await triggerKeyEvent('[data-test-object-property-value-txt]', 'keyup', 13);

    assert.dom('[data-test-object-property-value]').hasText('Joey');
  });

  test('Stringified json should not get double parsed', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'object-id',
      details: [
        {
          name: 'Own Properties',
          expand: true,
          properties: [
            {
              name: 'boundProp',
              value: {
                inspect: '{"name":"teddy"}',
                type: 'type-string',
                isCalculated: true,
              },
            },
          ],
        },
      ],
    });

    assert.dom('[data-test-object-property-value]').hasText('{"name":"teddy"}');

    await click('[data-test-object-property-value]');

    let txtField = find('[data-test-object-property-value-txt]');
    assert.strictEqual(txtField.value, '"{"name":"teddy"}"');

    respondWith(
      'objectInspector:saveProperty',
      ({ objectId, property, value }) => ({
        type: 'objectInspector:updateProperty',
        objectId,
        property,
        mixinIndex: 0,
        value: {
          inspect: value,
          type: 'type-string',
          isCalculated: false,
        },
      }),
    );

    await fillIn(txtField, '"{"name":"joey"}"');
    await triggerKeyEvent('[data-test-object-property-value-txt]', 'keyup', 13);

    assert.dom('[data-test-object-property-value]').hasText('{"name":"joey"}');
  });

  test('Send to console', async function (assert) {
    assert.expect(6);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'object-id',
      details: [
        {
          name: 'Own Properties',
          expand: true,
          properties: [
            {
              name: 'myProp',
              value: {
                inspect: 'Teddy',
                type: 'type-string',
                isCalculated: true,
              },
            },
          ],
        },
      ],
    });

    respondWith('objectInspector:sendToConsole', ({ objectId, property }) => {
      assert.strictEqual(objectId, 'object-id');
      assert.strictEqual(property, 'myProp');
      return false;
    });

    // Grouped View
    await click('[data-test-send-to-console-btn]');

    respondWith('objectInspector:sendToConsole', ({ objectId, property }) => {
      assert.strictEqual(objectId, 'object-id');
      assert.strictEqual(property, undefined);
      return false;
    });

    await click('[data-test-send-object-to-console-btn]');

    // All View
    await click('[data-test-object-display-type-all]');

    respondWith('objectInspector:sendToConsole', ({ objectId, property }) => {
      assert.strictEqual(objectId, 'object-id');
      assert.strictEqual(property, undefined);
      return false;
    });

    await click('[data-test-send-object-to-console-btn]');
  });

  test('Goto Source', async function (assert) {
    assert.expect(6);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'object-id',
      details: [
        {
          name: 'Own Properties',
          expand: true,
          properties: [
            {
              name: 'myProp',
              value: {
                inspect: 'func',
                type: 'type-function',
              },
            },
          ],
        },
        {
          name: 'prototype',
          expand: true,
          properties: [
            {
              name: 'abc',
              value: {
                inspect: 'Teddy',
                type: 'type-string',
              },
            },
          ],
        },
      ],
    });

    respondWith('objectInspector:gotoSource', ({ objectId, property }) => {
      assert.strictEqual(objectId, 'object-id');
      assert.strictEqual(property, undefined);
      return false;
    });

    // Grouped View
    await click('[data-test-goto-class-source-btn]');

    respondWith('objectInspector:gotoSource', ({ objectId, property }) => {
      assert.strictEqual(objectId, 'object-id');
      assert.strictEqual(property, 'myProp');
      return false;
    });

    await click('[data-test-goto-source-btn]');

    // All View
    await click('[data-test-object-display-type-all]');

    respondWith('objectInspector:gotoSource', ({ objectId, property }) => {
      assert.strictEqual(objectId, 'object-id');
      assert.strictEqual(property, 'myProp');
      return false;
    });

    await click('[data-test-goto-source-btn]');
  });

  test('Read only CPs cannot be edited', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'object-id',
      details: [
        {
          name: 'Own Properties',
          expand: true,
          properties: [
            {
              name: 'readCP',
              readOnly: true,
              value: {
                isCalculated: true,
                inspect: 'Read',
                type: 'type-string',
              },
            },
            {
              name: 'readCP',
              readOnly: false,
              value: {
                isCalculated: true,
                inspect: 'Write',
                type: 'type-string',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-property-value]');

    assert.dom('[data-test-object-property-value-txt]').doesNotExist();

    let valueElements = findAll('[data-test-object-property-value]');
    await click(valueElements[valueElements.length - 1]);

    assert.dom('[data-test-object-property-value-txt]').exists();
  });

  test('Dropping an object due to destruction', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [],
        },
      ],
    });

    assert.dom('[data-test-object-name]').hasText('My Object');

    await sendMessage({
      type: 'objectInspector:droppedObject',
      objectId: 'myObject',
    });

    assert.dom('[data-test-object-name]').doesNotExist();
  });

  test('Date fields are editable', async function (assert) {
    assert.expect(5);

    await visit('/');

    let date = new Date(2019, 7, 13); // 2019-08-13

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'First Detail',
          expand: false,
          properties: [
            {
              name: 'dateProperty',
              value: {
                inspect: date.toString(),
                type: 'type-date',
              },
            },
          ],
        },
      ],
    });

    respondWith(
      'objectInspector:saveProperty',
      ({ objectId, property, value }) => {
        assert.strictEqual(typeof value, 'number', 'sent as timestamp');
        date = new Date(value);

        return {
          type: 'objectInspector:updateProperty',
          objectId,
          property,
          mixinIndex: 0,
          value: {
            inspect: date.toString(),
            type: 'type-date',
            isCalculated: false,
          },
        };
      },
    );

    await click('[data-test-object-detail-name]');

    assert.dom('[data-test-object-property-value]').hasText(date.toString());

    await click('[data-test-object-property-value]');

    let field = find('.js-object-property-value-date');
    assert.ok(field);

    respondWith(
      'objectInspector:saveProperty',
      ({ objectId, property, value }) => {
        assert.strictEqual(typeof value, 'number', 'sent as timestamp');
        date = new Date(value);

        return {
          type: 'objectInspector:updateProperty',
          objectId,
          property,
          mixinIndex: 0,
          value: {
            inspect: date.toString(),
            type: 'type-date',
            isCalculated: false,
          },
        };
      },
    );

    await fillIn(field, '2015-01-01');
    await triggerKeyEvent(field, 'keydown', 13);

    assert.dom('[data-test-object-property-value]').hasText(date.toString());
  });

  test('Boolean fields are editable', async function (assert) {
    assert.expect(4);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'First Detail',
          expand: false,
          properties: [
            {
              name: 'booleanProperty',
              value: {
                inspect: true.toString(),
                type: 'type-boolean',
                isCalculated: true,
              },
            },
          ],
        },
      ],
    });

    respondWith(
      'objectInspector:saveProperty',
      ({ objectId, property, value }) => {
        assert.strictEqual(typeof value, 'boolean', 'sent as boolean');

        return {
          type: 'objectInspector:updateProperty',
          objectId,
          property,
          mixinIndex: 0,
          value: {
            inspect: false.toString(),
            type: 'type-boolean',
            isCalculated: false,
          },
        };
      },
    );

    await click('[data-test-object-detail-name]');

    assert.dom('[data-test-object-property-value]').hasText(true.toString());

    await click('[data-test-object-property-value]');

    let field = find('[data-test-object-property-value-txt]');
    assert.ok(field);

    await fillIn(field, 'false');
    await triggerKeyEvent(field, 'keyup', 13);

    assert.dom('[data-test-object-property-value]').hasText(false.toString());
  });

  test('Errors are correctly displayed', async function (assert) {
    assert.expect(8);

    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: '1',
      details: [],
      errors: [{ property: 'foo' }, { property: 'bar' }],
    });

    assert.dom('[data-test-object-name]').hasText('My Object');
    assert.dom('[data-test-object-inspector-errors]').exists({ count: 1 });
    assert.dom('[data-test-object-inspector-error]').exists({ count: 2 });

    respondWith('objectInspector:traceErrors', ({ objectId }) => {
      assert.strictEqual(objectId, '1');
      return false;
    });

    await click('[data-test-send-errors-to-console]');

    await sendMessage({
      type: 'objectInspector:updateErrors',
      objectId: '1',
      errors: [{ property: 'foo' }],
    });

    assert.dom('[data-test-object-inspector-errors]').exists({ count: 1 });
    assert.dom('[data-test-object-inspector-error]').exists({ count: 1 });

    await sendMessage({
      type: 'objectInspector:updateErrors',
      objectId: '1',
      errors: [],
    });

    assert.dom('[data-test-object-inspector-errors]').doesNotExist();
    assert.dom('[data-test-object-inspector-error]').doesNotExist();
  });

  test('Tracked properties', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'trackedProp',
              isTracked: true,
              value: {
                inspect: 123,
                type: 'type-number',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    assert.dom('.mixin__property-icon--tracked').exists();
    assert.dom('[data-test-object-property-value]').hasText('123');

    await sendMessage({
      type: 'objectInspector:updateProperty',
      objectId: 'myObject',
      property: 'trackedProp',
      value: {
        inspect: 456,
      },
      mixinIndex: 0,
    });

    assert.dom('.mixin__property-icon--tracked').exists();
    assert.dom('[data-test-object-property-value]').hasText('456');
  });

  test('Plain properties', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'plainProp',
              isProperty: true,
              value: {
                inspect: 123,
                type: 'type-number',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    assert.dom('.mixin__property-icon--property').exists();
    assert.dom('[data-test-object-property-value]').hasText('123');

    await sendMessage({
      type: 'objectInspector:updateProperty',
      objectId: 'myObject',
      property: 'plainProp',
      value: {
        inspect: 456,
      },
      mixinIndex: 0,
    });

    assert.dom('.mixin__property-icon--property').exists();
    assert.dom('[data-test-object-property-value]').hasText('456');
  });

  test('Getters', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'getter',
              isGetter: true,
              value: {
                inspect: 123,
                type: 'type-number',
              },
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    assert.dom('.mixin__property-icon--getter').exists();
    assert.dom('[data-test-object-property-value]').hasText('123');

    await sendMessage({
      type: 'objectInspector:updateProperty',
      objectId: 'myObject',
      property: 'getter',
      value: {
        inspect: 456,
      },
      mixinIndex: 0,
    });

    assert.dom('.mixin__property-icon--getter').exists();
    assert.dom('[data-test-object-property-value]').hasText('456');
  });

  test('Custom filter', async function (assert) {
    await visit('/');

    await sendMessage({
      type: 'objectInspector:updateObject',
      name: 'My Object',
      objectId: 'myObject',
      details: [
        {
          name: 'Detail',
          properties: [
            {
              name: 'er',
              value: 1,
            },
            {
              name: 'el',
              value: 1,
            },
          ],
        },
      ],
    });

    await click('[data-test-object-detail-name]');

    assert.dom('[data-test-object-property]').exists({ count: 2 });
    assert.dom('[data-test-object-display-type-grouped].active').exists();
    assert
      .dom('[data-test-object-inspector-custom-search-clear]')
      .doesNotExist();

    await typeIn('#custom-filter-input', 'e');
    assert.dom('[data-test-object-property]').exists({ count: 2 });
    assert.dom('[data-test-object-display-type-all].active').exists();
    assert.dom('[data-test-object-display-type-grouped].active').doesNotExist();
    assert.dom('[data-test-object-inspector-custom-search-clear]').exists();

    await typeIn('#custom-filter-input', 'r');
    assert.dom('[data-test-object-property]').exists({ count: 1 });
    assert.dom('[data-test-object-display-type-all]').exists();

    await click('[data-test-object-inspector-custom-search-clear]');
    assert.dom('[data-test-object-property]').exists({ count: 2 });
    assert.dom('[data-test-object-display-type-all]').exists();

    await typeIn('#custom-filter-input', 'z');
    assert.dom('[data-test-object-property]').exists({ count: 0 });

    await click('[data-test-object-display-type-grouped]');
    assert.dom('[data-test-object-display-type-grouped].active').exists();
    assert.dom('#custom-filter-input').hasNoText();
    assert
      .dom('[data-test-object-inspector-custom-search-clear]')
      .doesNotExist();
  });
});
