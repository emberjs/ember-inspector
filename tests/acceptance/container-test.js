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

let port, message, name;

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

function getInstances() {
  return [
    {
      name: 'first',
      inspectable: false
    },
    {
      name: 'second',
      inspectable: true
    }
  ];
}

module('Container Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
  });

  hooks.afterEach(function() {
    name = null;
    message = null;
  });

  test("Container types are successfully listed", async function(assert) {
    port.reopen({
      send(name) {
        if (name === 'container:getTypes') {
          this.trigger('container:types', { types: getTypes() });
        }
      }
    });

    await visit('/container-types');
    let rows = findAll('.js-container-type');
    assert.equal(rows.length, 2);
    assert.dom(findAll('.js-container-type-name')[0]).hasText('controller');
    assert.dom(findAll('.js-container-type-count')[0]).hasText('2');
    assert.dom(findAll('.js-container-type-name')[1]).hasText('route');
    assert.dom(findAll('.js-container-type-count')[1]).hasText('5');
  });

  test("Container instances are successfully listed", async function(assert) {
    let instances = getInstances();

    port.reopen({
      send(n, m) {
        name = n;
        message = m;
        if (name === 'container:getTypes') {
          this.trigger('container:types', { types: getTypes() });
        }

        if (name === 'container:getInstances' && message.containerType === 'controller') {
          this.trigger('container:instances', { instances, status: 200 });
        }
      }
    });

    await visit('/container-types/controller');
    let rows;

    rows = findAll('.js-container-instance-list-item');

    assert.dom(rows[0]).hasText('first');
    assert.dom(rows[1]).hasText('second');
    name = null;
    message = null;

    await click(rows[0].querySelector('.js-instance-name'));

    assert.equal(name, null);
    await click(rows[1].querySelector('.js-instance-name'));

    assert.equal(name, 'objectInspector:inspectByContainerLookup');

    await fillIn('.js-container-instance-search input', 'first');

    rows = findAll('.js-container-instance-list-item');
    assert.equal(rows.length, 1);
    assert.dom(rows[0]).hasText('first');
  });

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    let instances = getInstances();

    port.reopen({
      send(n, m) {
        name = n;
        message = m;
        if (name === 'container:getTypes') {
          this.trigger('container:types', { types: getTypes() });
        }

        if (name === 'container:getInstances' && message.containerType === 'controller') {
          this.trigger('container:instances', { instances, status: 200 });
        }
      }
    });

    await visit('/container-types/controller');
    let rows;

    rows = findAll('.js-container-instance-list-item');
    assert.equal(rows.length, 2, 'expected all rows');

    await fillIn('.js-container-instance-search input', 'xxxxx');
    rows = findAll('.js-container-instance-list-item');
    assert.equal(rows.length, 0, 'expected filtered rows');

    await click('.js-search-field-clear-button');
    rows = findAll('.js-container-instance-list-item');
    assert.equal(rows.length, 2, 'expected all rows');
  });

  test("Successfully redirects if the container type is not found", async function(assert) {

    port.reopen({
      send(n, m) {
        name = n;
        message = m;
        if (name === 'container:getTypes') {
          this.trigger('container:types', { types: getTypes() });
        }

        if (name === 'container:getInstances' && message.containerType === 'random-type') {
          this.trigger('container:instances', { status: 404 });
        }
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
    await visit('/container-types/random-type');
    assert.equal(currentURL(), '/container-types');
    Ember.Test.adapter.exception = adapterException;
  });

  test("Reload", async function(assert) {
    let types = [], instances = [];

    port.reopen({
      send(n, m) {
        if (n === 'container:getTypes') {
          this.trigger('container:types', { types });
        }
        if (n === 'container:getInstances' && m.containerType === 'controller') {
          this.trigger('container:instances', { instances, status: 200 });
        }
      }
    });

    await visit('/container-types/controller');

    assert.dom('.js-container-type').doesNotExist();
    assert.dom('.js-container-instance-list-item').doesNotExist();
    types = getTypes();
    instances = getInstances();

    await click('.js-reload-container-btn');

    assert.dom('.js-container-type').exists({ count: 2 });
    assert.dom('.js-container-instance-list-item').exists({ count: 2 });
  });
});
