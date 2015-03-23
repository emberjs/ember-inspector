/*globals findByLabel, clickByLabel */
import Ember from "ember";
import { module } from 'qunit';
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
var App;

var port, message, name;

module('Container Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
  },
  afterEach() {
    name = null;
    message = null;
    Ember.run(App, App.destroy);
  }
});


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

test("Container types are successfully listed", function(assert) {
  port.reopen({
    send: function(name, message) {
      if (name === 'container:getTypes') {
        this.trigger('container:types', { types: getTypes() });
      }
    }
  });

  visit('/container-types');

  andThen(function() {
    var rows = findByLabel('container-type');
    assert.equal(rows.length, 2);
    assert.equal(findByLabel('container-type-name', rows[0]).text().trim(), 'controller');
    assert.equal(findByLabel('container-type-count', rows[0]).text().trim(), '2');
    assert.equal(findByLabel('container-type-name', rows[1]).text().trim(), 'route');
    assert.equal(findByLabel('container-type-count', rows[1]).text().trim(), '5');
  });
});


test("Container instances are successfully listed", function(assert) {
  var types = [{name: 'controller', count: 2}];

  var instances = getInstances();

  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
      if (name === 'container:getTypes') {
        this.trigger('container:types', {types: getTypes()});
      }

      if (name === 'container:getInstances' && message.containerType === 'controller') {
        this.trigger('container:instances', { instances: instances });
      }
    }
  });

  visit('/container-types/controller');
  var rows;

  andThen(function() {
    rows = findByLabel('instance-row');
    findByLabel(rows.length, 2);
    assert.equal(rows.eq(0).text().trim(), 'first');
    assert.equal(rows.eq(1).text().trim(), 'second');
    name = null;
    message = null;
    return click(rows[0]);
  });

  andThen(function() {
    assert.equal(name, null);
    return click(rows[1]);
  });

  andThen(function() {
    assert.equal(name, 'objectInspector:inspectByContainerLookup');
  });

  andThen(function() {
    return fillIn(findByLabel('container-instance-search').find('input'), 'first');
  });

  andThen(function() {
    rows = findByLabel('instance-row');
    assert.equal(rows.length, 1);
    assert.equal(rows.eq(0).text().trim(), 'first');
  });

});

test("Reload", function(assert) {
  var types = [], instances = [];

  port.reopen({
    send: function(n, m) {
      if (n === 'container:getTypes') {
        this.trigger('container:types', { types: types});
      }
      if (n === 'container:getInstances' && m.containerType === 'controller') {
        this.trigger('container:instances', { instances: instances});
      }
    }
  });

  visit('/container-types/controller');

  andThen(function() {
    assert.equal(findByLabel('container-type').length, 0);
    assert.equal(findByLabel('instance-row').length, 0);
    types = getTypes();
    instances = getInstances();
  });

  clickByLabel('reload-container-btn');

  andThen(function() {
    assert.equal(findByLabel('container-type').length,2);
    assert.equal(findByLabel('instance-row').length,2);
  });
});
