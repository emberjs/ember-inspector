/*globals findByLabel, clickByLabel */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
var App;
var port, message, name;

module('Object Inspector', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
    port.reopen({
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
  },
  afterEach() {
    name = null;
    message = null;
    Ember.run(App, App.destroy);
  }
});

var objectAttr = {
  name: 'Object Name',
  objectId: 1,
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
  return Ember.$.extend(true, {}, objectAttr, props);
}

function objectToInspect() {
  return objectFactory( {
    name: 'My Object',
    objectId: 'objectId',
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

test("The object displays correctly", function(assert) {
  var obj = objectFactory( { name: 'My Object' });
  visit('/').then(function() {
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-name').text(), 'My Object');
    assert.equal(findByLabel('object-detail-name').filter(':first').text(), 'Own Properties');
    assert.ok(findByLabel('object-detail').hasClass('mixin_state_expanded'), 'The "Own Properties" detail is expanded by default');
  });
});

test("Object details", function(assert) {

  var $firstDetail, $secondDetail;

  visit('/').then(function() {
    port.trigger('objectInspector:updateObject', objectToInspect());
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-name').text(), 'My Object');
    $firstDetail = findByLabel('object-detail').eq(0);
    $secondDetail = findByLabel('object-detail').eq(1);
    assert.equal(findByLabel('object-detail-name', $firstDetail).text(), 'First Detail');
    assert.ok(!$firstDetail.hasClass('mixin_state_expanded'), 'Detail not expanded by default');
    return clickByLabel('object-detail-name', $firstDetail);
  })
  .then(function() {
    assert.ok($firstDetail.hasClass('mixin_state_expanded'), 'Detail expands on click.');
    assert.ok(!$secondDetail.hasClass('mixin_state_expanded'), 'Second detail does not expand.');
    assert.equal(findByLabel('object-property', $firstDetail).length, 1);
    assert.equal(findByLabel('object-property-name', $firstDetail).text(), 'numberProperty');
    assert.equal(findByLabel('object-property-value', $firstDetail).text(), '1');
    return clickByLabel('object-detail-name', $firstDetail);
  })
  .then(function() {
    assert.ok(!$firstDetail.hasClass('mixin_state_expanded'), 'Expanded detail minimizes on click.');
    return clickByLabel('object-detail-name', $secondDetail);
  })
  .then(function() {
    assert.ok($secondDetail.hasClass('mixin_state_expanded'));
    assert.equal(findByLabel('object-property', $secondDetail).length, 2);
    assert.equal(findByLabel('object-property-name', $secondDetail).eq(0).text(), 'objectProperty');
    assert.equal(findByLabel('object-property-value', $secondDetail).eq(0).text(), 'Ember Object Name');
    assert.equal(findByLabel('object-property-name', $secondDetail).eq(1).text(), 'stringProperty');
    assert.equal(findByLabel('object-property-value', $secondDetail).eq(1).text(), 'String Value');
  });
});

test("Digging deeper into objects", function(assert) {
  var $secondDetail;

  visit('/')
  .then(function() {
    port.trigger('objectInspector:updateObject', objectToInspect());
    return wait();
  })
  .then(function() {
    $secondDetail = findByLabel('object-detail').eq(1);
    return clickByLabel('object-detail-name', $secondDetail);
  })
  .then(function() {
    var $objectProperty = findByLabel('object-property').filter(':first');
    $objectProperty = findByLabel('object-property-value', $objectProperty);
    return click($objectProperty);
  })
  .then(function() {
    assert.equal(name, 'objectInspector:digDeeper');
    assert.deepEqual(message, { objectId: 'objectId',  property: 'objectProperty' });
  })
  .then(function() {
    var nestedObject = {
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

    port.trigger('objectInspector:updateObject', nestedObject);
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-name').text(), 'My Object', 'Title stays as the initial object.');
    assert.equal(findByLabel('object-trail').text(), '.objectProperty', 'Nested property shows below title');
    assert.equal(findByLabel('object-detail-name').text(), 'Nested Detail');
    return clickByLabel('object-detail-name');
  })
  .then(function() {
    assert.ok(findByLabel('object-detail').hasClass('mixin_state_expanded'));
    assert.equal(findByLabel('object-property-name').text(), 'nestedProp');
    assert.equal(findByLabel('object-property-value').text(), 'Nested Prop');
    return clickByLabel('object-inspector-back');
  })
  .then(function() {
    assert.equal(findByLabel('object-trail').length, 0);
  });
});

test("Computed properties", function(assert) {
  visit('/')
  .then(function() {
    var obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: [{
          name: 'computedProp',
          value: {
            inspect: '<computed>',
            type: 'type-descriptor',
            computed: true
          }
        }]
      }]
    };

    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .clickByLabel('object-detail-name')
  .clickByLabel('calculate')
  .then(function() {
    assert.equal(name, 'objectInspector:calculate');
    assert.deepEqual(message, { objectId: 'myObject', property: 'computedProp', mixinIndex: 0 });
    port.trigger('objectInspector:updateProperty', {
      objectId: 'myObject',
      property: 'computedProp',
      value: {
        inspect: 'Computed value'
      },
      mixinIndex: 0
    });
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-property-value').text(), 'Computed value');
  });

});

test("Properties are bound to the application properties", function(assert) {
  visit('/')
  .then(function() {
    var obj = {
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
            computed: false
          }
        }]

      }]
    };
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-property-value').first().text(), 'Teddy');
    port.trigger('objectInspector:updateProperty', {
      objectId: 'object-id',
      mixinIndex: 0,
      property: 'boundProp',
      value: {
        inspect: 'Alex',
        type: 'type-string',
        computed: false
      }
    });
    return wait();
  })
  .clickByLabel('object-property-value')
  .then(function() {
    var txtField = findByLabel('object-property-value-txt');
    assert.equal(txtField.val(), '"Alex"');
    return fillIn(txtField, '"Joey"');
  })
  .then(function() {
    var e = Ember.$.Event('keyup', { keyCode: 13 });
    findByLabel('object-property-value-txt').trigger(e);
    assert.equal(name, 'objectInspector:saveProperty');
    assert.equal(message.property, 'boundProp');
    assert.equal(message.value, 'Joey');
    assert.equal(message.mixinIndex, 0);

    port.trigger('objectInspector:updateProperty', {
      objectId: 'object-id',
      mixinIndex: 0,
      property: 'boundProp',
      value: {
        inspect: 'Joey',
        type: 'type-string',
        computed: false
      }
    });
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-property-value').text(), 'Joey');
  });
});

test("Stringified json should not get double parsed", function(assert) {
  visit('/');

  andThen(function() {
    var obj = {
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
            computed: false
          }
        }]

      }]
    };
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  });

  clickByLabel('object-property-value');

  andThen(function() {
    var txtField = findByLabel('object-property-value-txt');
    assert.equal(txtField.val(), '"{"name":"teddy"}"');
    return fillIn(txtField, '"{"name":"joey"}"');
  });

  andThen(function() {
    var e = Ember.$.Event('keyup', { keyCode: 13 });
    findByLabel('object-property-value-txt').trigger(e);
    assert.equal(name, 'objectInspector:saveProperty');
    assert.equal(message.property, 'boundProp');
    assert.equal(message.value, '{"name":"joey"}');
    assert.equal(message.mixinIndex, 0);
  });
});

test("Send to console", function(assert) {
  visit('/')
  .then(function() {
    var obj = {
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
            computed: false
          }
        }]

      }]
    };
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .clickByLabel('send-to-console-btn')
  .then(function() {
    assert.equal(name, 'objectInspector:sendToConsole');
    assert.equal(message.objectId, 'object-id');
    assert.equal(message.property, 'myProp');
  })
  .clickByLabel('send-object-to-console-btn')
  .then(function() {
    assert.equal(name, 'objectInspector:sendToConsole');
    assert.equal(message.objectId, 'object-id');
    assert.equal(message.property, undefined);
  });

});

test("Read only CPs cannot be edited", function(assert) {
  visit('/')
  .then(function() {
    var obj = {
      name: 'My Object',
      objectId: 'object-id',
      details: [{
        name: 'Own Properties',
        expand: true,
        properties: [{
          name: 'readCP',
          readOnly: true,
          value: {
            computed: true,
            inspect: 'Read',
            type: 'type-string'
          }
        }, {
          name: 'readCP',
          readOnly: false,
          value: {
            computed: true,
            inspect: 'Write',
            type: 'type-string'
          }
        }]
      }]
    };
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .then(function() {
    return click(findByLabel('object-property-value').first());
  })
  .then(function() {
    assert.equal(findByLabel('object-property-value-txt').length, 0);
    return click(findByLabel('object-property-value').last());
  })
  .then(function() {
    assert.equal(findByLabel('object-property-value-txt').length, 1);
  });
});

test("Dropping an object due to destruction", function(assert) {
  visit('/')
  .then(function() {
    var obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [{
        name: 'Detail',
        properties: []
      }]
    };

    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-name').text().trim(), 'My Object');
    port.trigger('objectInspector:droppedObject', { objectId: 'myObject'} );
    return wait();
  })
  .then(function() {
    assert.equal(findByLabel('object-name').text().trim(), '');
  });
});

test("Date fields are editable", function(assert) {
  visit('/');

  var date = new Date();

  andThen(function() {
    var obj = {
      name: 'My Object',
      objectId: 'myObject',
      details: [
      {
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
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  });

  andThen(function() {
    return clickByLabel('object-detail-name');
  });

  andThen(function() {
    return click(findByLabel('object-property-value').first());
  });

  andThen(function() {
    var field = findByLabel('object-property-value-date');
    assert.equal(field.length, 1);
    return fillIn(field, '2015-01-01');
  });

  andThen(function() {
    var field = findByLabel('object-property-value-date');
    // pickaday.js needs this
    triggerEvent(field, 'change');
    return wait();
  });

  andThen(function() {
    var e = Ember.$.Event('keyup', { keyCode: 13 });
    findByLabel('object-property-value-date').trigger(e);
    return wait();
  });

  andThen(function() {
    assert.equal(name, 'objectInspector:saveProperty');
    assert.equal(message.property, 'dateProperty');
    assert.equal(message.dataType, 'date');

    var newDate = new Date(message.value);
    assert.equal(newDate.getMonth(), 0);
    assert.equal(newDate.getDate(), 1);
    assert.equal(newDate.getFullYear(), 2015);
  });
});


function triggerEvent(elem, name) {
  /*global Event */
  var event;
  try {
    event = new Event(name);
  } catch (e) {
    //phatomjs < 2.0
    event = document.createEvent('Event');
    event.initEvent('change');
  }

  $(elem)[0].dispatchEvent(event);
}
