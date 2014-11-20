/*globals findByLabel, clickByLabel */
import Ember from "ember";
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
var App;

var port, message, name;

module('Container Tab', {
  setup: function() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
  },
  teardown: function() {
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

test("Container types are successfully listed", function() {
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
    equal(rows.length, 2);
    equal(findByLabel('container-type-name', rows[0]).text().trim(), 'controller');
    equal(findByLabel('container-type-count', rows[0]).text().trim(), '2');
    equal(findByLabel('container-type-name', rows[1]).text().trim(), 'route');
    equal(findByLabel('container-type-count', rows[1]).text().trim(), '5');
  });
});


test("Container instances are successfully listed", function() {
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
    equal(rows.eq(0).text().trim(), 'first');
    equal(rows.eq(1).text().trim(), 'second');
    name = null;
    message = null;
    return click(rows[0]);
  });

  andThen(function() {
    equal(name, null);
    return click(rows[1]);
  });

  andThen(function() {
    equal(name, 'objectInspector:inspectByContainerLookup');
  });

  andThen(function() {
    return fillIn(findByLabel('container-instance-search').find('input'), 'first');
  });

  andThen(function() {
    rows = findByLabel('instance-row');
    equal(rows.length, 1);
    equal(rows.eq(0).text().trim(), 'first');
  });

});

test("Reload", function() {
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
    equal(findByLabel('container-type').length, 0);
    equal(findByLabel('instance-row').length, 0);
    types = getTypes();
    instances = getInstances();
  });

  clickByLabel('reload-container-btn');

  andThen(function() {
    equal(findByLabel('container-type').length,2);
    equal(findByLabel('instance-row').length,2);
  });
});
