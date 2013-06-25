import "main" as EmberExtension;

var port;

var counter = 0;

var objectAttr = {
  name: '<Object>',
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

module("Object Inspector", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');
  }
});

test("The object displays correctly", function() {
  var obj = objectFactory( { name: 'My Object' });
  visit('/').then(function() {
    port.trigger('updateObject', obj);
    return wait();
  })
  .then(function() {
    equal(findByLabel('object-name').text(), 'My Object');
    equal(findByLabel('object-detail-name').filter(':first').text(), 'Own Properties');
    ok(findByLabel('object-detail').hasClass('expanded'), 'The first detail is expanded by default');
  });
});



