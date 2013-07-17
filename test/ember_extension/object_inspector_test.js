import "main" as EmberExtension;

var port;

var objectAttr = {
  name: 'Object Name',
  objectId: 1,
  details: [
    {
      name: 'Own Properties',
      properties: [{
        name: 'id',
        value: 1
      }]
    }
  ]
};

function objectFactory(props) {
  return Em.$.extend(true, {}, objectAttr, props);
}

function objectToInspect() {
  return objectFactory( {
    name: 'My Object',
    objectId: 'objectId',
    details: [
      {
        name: 'First Detail',
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


module("Object Inspector", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');


  }
});

test("The object displays correctly", function() {
  var obj = objectFactory( { name: 'My Object' });
  visit('/').then(function() {
    port.trigger('objectInspector:updateObject', obj);
    return wait();
  })
  .then(function() {
    equal(findByLabel('object-name').text(), 'My Object');
    equal(findByLabel('object-detail-name').filter(':first').text(), 'Own Properties');
    ok(findByLabel('object-detail').hasClass('mixin_state_expanded'), 'The "Own Properties" detail is expanded by default');
  });
});

test("Object details", function() {


  var $firstDetail, $secondDetail;

  visit('/').then(function() {
    port.trigger('objectInspector:updateObject', objectToInspect());
    return wait();
  })
  .then(function() {
    equal(findByLabel('object-name').text(), 'My Object');
    $firstDetail = findByLabel('object-detail').eq(0);
    $secondDetail = findByLabel('object-detail').eq(1);
    equal(findByLabel('object-detail-name', $firstDetail).text(), 'First Detail');
    ok(!$firstDetail.hasClass('mixin_state_expanded'), 'Detail not expanded by default');
    return clickByLabel('object-detail-name', $firstDetail);
  })
  .then(function() {
    ok($firstDetail.hasClass('mixin_state_expanded'), 'Detail expands on click.');
    ok(!$secondDetail.hasClass('mixin_state_expanded'), 'Second detail does not expand.');
    equal(findByLabel('object-property', $firstDetail).length, 1);
    equal(findByLabel('object-property-name', $firstDetail).text(), 'numberProperty');
    equal(findByLabel('object-property-value', $firstDetail).text(), '1');
    return clickByLabel('object-detail-name', $firstDetail);
  })
  .then(function() {
    ok(!$firstDetail.hasClass('mixin_state_expanded'), 'Expanded detail minimizes on click.');
    return clickByLabel('object-detail-name', $secondDetail);
  })
  .then(function() {
    ok($secondDetail.hasClass('mixin_state_expanded'));
    equal(findByLabel('object-property', $secondDetail).length, 2);
    equal(findByLabel('object-property-name', $secondDetail).eq(0).text(), 'objectProperty');
    equal(findByLabel('object-property-value', $secondDetail).eq(0).text(), 'Ember Object Name');
    equal(findByLabel('object-property-name', $secondDetail).eq(1).text(), 'stringProperty');
    equal(findByLabel('object-property-value', $secondDetail).eq(1).text(), 'String Value');
  });
});

test("Digging deeper into objects", function() {
  var name = null, message = null, $secondDetail;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

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
    return click($objectProperty);
  })
  .then(function() {
    equal(name, 'objectInspector:digDeeper');
    deepEqual(message, { objectId: 'objectId',  property: 'objectProperty' });
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
    equal(findByLabel('object-name').text(), 'My Object', 'Title stays as the initial object.');
    equal(findByLabel('object-trail').text(), '.objectProperty', 'Nested property shows below title');
    equal(findByLabel('object-detail-name').text(), 'Nested Detail');
    return clickByLabel('object-detail-name');
  })
  .then(function() {
    ok(findByLabel('object-detail').hasClass('mixin_state_expanded'));
    equal(findByLabel('object-property-name').text(), 'nestedProp');
    equal(findByLabel('object-property-value').text(), 'Nested Prop');
    return clickByLabel('object-inspector-back');
  })
  .then(function() {
    equal(findByLabel('object-trail').text(), '');
  });
});

test("Computed properties", function() {
  var name = null, message = null;
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
    }
  });

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
    equal(name, 'objectInspector:calculate');
    deepEqual(message, { objectId: 'myObject', property: 'computedProp', mixinIndex: 0 });
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
    equal(findByLabel('object-property-value').text(), 'Computed value');
  });

});
