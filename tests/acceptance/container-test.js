import Ember from "ember";
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  visit,
  findAll,
  click,
  fillIn,
  currentURL
} from 'ember-test-helpers';
import { respondWith } from '../test-adapter';

function getTypes() {
  return [
    {
      name: 'route',
      count: 5
    },
    {
      name: 'controller',
      count: 2
    }
  ];
}

function getControllers() {
  return [
    {
      name: 'first controller',
      fullName: 'controller:first',
      inspectable: false
    },
    {
      name: 'second controller',
      fullName: 'controller:second',
      inspectable: true
    }
  ];
}

module('Container Tab', function(outer) {
  setupApplicationTest(outer);

  module('With default types', function(inner) {
    inner.beforeEach(function() {
      respondWith('container:getTypes', {
        type: 'container:types',
        types: getTypes()
      });
    });

    test("Container types are successfully listed", async function(assert) {
      await visit('/container-types');

      let rows = findAll('.js-container-type');

      assert.equal(rows.length, 2);
      assert.dom(findAll('.js-container-type-name')[0]).hasText('controller');
      assert.dom(findAll('.js-container-type-count')[0]).hasText('2');
      assert.dom(findAll('.js-container-type-name')[1]).hasText('route');
      assert.dom(findAll('.js-container-type-count')[1]).hasText('5');
    });

    test("Container instances are successfully listed", async function(assert) {
      respondWith('container:getInstances', ({ containerType }) => {
        if (containerType === 'controller') {
          return {
            type: 'container:instances',
            status: 200,
            instances: getControllers()
          };
        }
      });

      await visit('/container-types/controller');

      let rows = findAll('.js-container-instance-list-item');

      assert.dom(rows[0]).hasText('first controller');
      assert.dom(rows[1]).hasText('second controller');

      // Uninspectable, no messages
      await click(rows[0].querySelector('.js-instance-name'));

      // Second object is inspectable
      respondWith('objectInspector:inspectByContainerLookup', ({ name }) => {
        if (name === 'controller:second') {
          return {
            type: 'objectInspector:updateObject',
            objectId: 'ember123',
            name: 'second controller',
            details: [],
            errors: []
          };
        }
      });

      await click(rows[1].querySelector('.js-instance-name'));

      await fillIn('.js-container-instance-search input', 'first');

      rows = findAll('.js-container-instance-list-item');

      assert.equal(rows.length, 1);
      assert.dom(rows[0]).hasText('first controller');
    });

    test("It should clear the search filter when the clear button is clicked", async function(assert) {
      respondWith('container:getInstances', ({ containerType }) => {
        if (containerType === 'controller') {
          return {
            type: 'container:instances',
            status: 200,
            instances: getControllers()
          };
        }
      });

      await visit('/container-types/controller');

      let rows = findAll('.js-container-instance-list-item');
      assert.equal(rows.length, 2, 'expected all rows');

      await fillIn('.js-container-instance-search input', 'xxxxx');
      rows = findAll('.js-container-instance-list-item');
      assert.equal(rows.length, 0, 'expected filtered rows');

      await click('.js-search-field-clear-button');
      rows = findAll('.js-container-instance-list-item');
      assert.equal(rows.length, 2, 'expected all rows');
    });

    test("Successfully redirects if the container type is not found", async function(assert) {
      respondWith('container:getInstances', ({ containerType }) => {
        if (containerType === 'random-type') {
          return {
            type: 'container:instances',
            status: 404
          };
        }
      });

      let adapterException = Ember.Test.adapter.exception;

      // Failed route causes a promise unhandled rejection
      // even though there's an `error` action defined :(
      Ember.Test.adapter.exception = err => {
        if (!err || err.status !== 404) {
          return adapterException.call(Ember.Test.adapter, err);
        }
      };

      try {
        await visit('/container-types/random-type');
        assert.equal(currentURL(), '/container-types');
      } finally {
        Ember.Test.adapter.exception = adapterException;
      }
    });
  });

  test("Reload", async function(assert) {
    respondWith('container:getTypes', {
      type: 'container:types',
      types: []
    });

    respondWith('container:getInstances', ({ containerType }) => {
      if (containerType === 'controller') {
        return {
          type: 'container:instances',
          status: 200,
          instances: []
        };
      }
    });

    await visit('/container-types/controller');

    assert.dom('.js-container-type').doesNotExist();
    assert.dom('.js-container-instance-list-item').doesNotExist();

    respondWith('container:getTypes', {
      type: 'container:types',
      types: getTypes()
    });

    respondWith('container:getInstances', ({ containerType }) => {
      if (containerType === 'controller') {
        return {
          type: 'container:instances',
          status: 200,
          instances: getControllers()
        };
      }
    });

    await click('.js-reload-container-btn');

    assert.dom('.js-container-type').exists({ count: 2 });
    assert.dom('.js-container-instance-list-item').exists({ count: 2 });
  });
});
