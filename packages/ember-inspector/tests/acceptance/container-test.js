import TestAdapter from '@ember/test/adapter';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, findAll, click, fillIn, currentURL } from '@ember/test-helpers';
import { setupTestAdapter, respondWith } from '../test-adapter';

function getTypes() {
  return [
    {
      name: 'route',
      count: 5,
    },
    {
      name: 'controller',
      count: 4,
    },
  ];
}

function getControllers() {
  return [
    {
      name: 'first controller',
      fullName: 'controller:first',
      inspectable: false,
    },
    {
      name: 'second controller',
      fullName: 'controller:second',
      inspectable: true,
    },
    {
      name: 'third controller',
      fullName: 'controller:third',
      inspectable: true,
    },
    {
      name: 'fourth controller',
      fullName: 'controller:fourth',
      inspectable: true,
    },
  ];
}

module('Container Tab', function (outer) {
  setupTestAdapter(outer);
  setupApplicationTest(outer);

  module('With default types', function (inner) {
    inner.beforeEach(function () {
      respondWith('container:getTypes', {
        type: 'container:types',
        types: getTypes(),
      });
    });

    test('Container types are successfully listed', async function (assert) {
      await visit('/container-types');
      let rows = findAll('.js-container-type');

      assert.strictEqual(rows.length, 2);
      assert.dom(findAll('.js-container-type-name')[0]).hasText('controller');
      assert.dom(findAll('.js-container-type-count')[0]).hasText('4');
      assert.dom(findAll('.js-container-type-name')[1]).hasText('route');
      assert.dom(findAll('.js-container-type-count')[1]).hasText('5');
    });

    test('Container instances are successfully listed and navigable', async function (assert) {
      respondWith('container:getInstances', ({ containerType }) => {
        if (containerType === 'controller') {
          return {
            type: 'container:instances',
            status: 200,
            instances: getControllers(),
          };
        }
      });

      await visit('/container-types/controller');

      let rows = findAll('[data-test-instance-row]');

      // Sorted alphabetically
      assert.dom(rows[0]).hasText('first controller');
      assert.dom(rows[1]).hasText('fourth controller');
      assert.dom(rows[2]).hasText('second controller');
      assert.dom(rows[3]).hasText('third controller');

      // Uninspectable, no messages
      await click('[data-test-instance="first controller"]');

      // Second controller is inspectable
      respondWith('objectInspector:inspectByContainerLookup', ({ name }) => {
        if (name === 'controller:second') {
          return {
            type: 'objectInspector:updateObject',
            objectId: 'ember123',
            name: 'second controller',
            details: [],
            errors: [],
          };
        }
      });

      await click('[data-test-instance="second controller"]');
    });

    test('Container instances are filterable and sortable', async function (assert) {
      respondWith('container:getInstances', ({ containerType }) => {
        if (containerType === 'controller') {
          return {
            type: 'container:instances',
            status: 200,
            instances: getControllers(),
          };
        }
      });

      await visit('/container-types/controller');

      await fillIn('[data-test-container-instance-search] input', 'first');
      assert
        .dom('[data-test-instance-row]')
        .exists({ count: 1 }, 'expected filtered row');
      assert
        .dom(findAll('[data-test-instance-row]')[0])
        .hasText('first controller');

      await fillIn('[data-test-container-instance-search] input', 'xxxxx');
      assert
        .dom('[data-test-instance-row]')
        .exists({ count: 0 }, 'expected filtered rows');

      await click('[data-test-search-field-clear-button]');
      assert
        .dom('[data-test-instance-row]')
        .exists({ count: 4 }, 'expected all rows');

      let rows = findAll('[data-test-instance-row]');

      // Sorted alphabetically by name ascending
      assert.dom(rows[0]).hasText('first controller');
      assert.dom(rows[1]).hasText('fourth controller');
      assert.dom(rows[2]).hasText('second controller');
      assert.dom(rows[3]).hasText('third controller');
      assert
        .dom('[data-test-sort-indicator].is-ascending')
        .exists({ count: 1 });

      await click('[data-test-sort-toggle]');

      // Sorted alphabetically by name descending
      rows = findAll('[data-test-instance-row]');
      assert.dom(rows[0]).hasText('third controller');
      assert.dom(rows[1]).hasText('second controller');
      assert.dom(rows[2]).hasText('fourth controller');
      assert.dom(rows[3]).hasText('first controller');
      assert
        .dom('[data-test-sort-indicator].is-descending')
        .exists({ count: 1 });
    });

    test('Successfully redirects if the container type is not found', async function (assert) {
      respondWith('container:getInstances', ({ containerType }) => {
        if (containerType === 'random-type') {
          return {
            type: 'container:instances',
            status: 404,
          };
        }
      });

      let adapterException = TestAdapter.exception;

      // Failed route causes a promise unhandled rejection
      // even though there's an `error` action defined :(
      TestAdapter.exception = (err) => {
        if (!err || err.status !== 404) {
          return adapterException.call(TestAdapter, err);
        }
      };

      try {
        await visit('/container-types/random-type');
        assert.strictEqual(currentURL(), '/container-types');
      } finally {
        TestAdapter.exception = adapterException;
      }
    });
  });

  test('Reload', async function (assert) {
    respondWith('container:getTypes', {
      type: 'container:types',
      types: [],
    });

    respondWith('container:getInstances', ({ containerType }) => {
      if (containerType === 'controller') {
        return {
          type: 'container:instances',
          status: 200,
          instances: [],
        };
      }
    });

    await visit('/container-types/controller');

    assert.dom('.js-container-type').doesNotExist();
    assert.dom('[data-test-instance-row]').doesNotExist();

    respondWith('container:getTypes', {
      type: 'container:types',
      types: getTypes(),
    });

    respondWith('container:getInstances', ({ containerType }) => {
      if (containerType === 'controller') {
        return {
          type: 'container:instances',
          status: 200,
          instances: getControllers(),
        };
      }
    });

    await click('[data-test-reload-container-btn]');

    assert.dom('.js-container-type').exists({ count: 2 });
    assert.dom('[data-test-instance-row]').exists({ count: 4 });
  });
});
