import EmberExtension from "main";

var port, message, name;

function modelTypeFactory(options) {
  return {
    name: options.name,
    count: options.count,
    columns: options.columns,
    objectId: options.name
  };
}

function modelTypes() {
  return [
    modelTypeFactory({
      name: 'App.Post',
      count: 2,
      columns: [ { name: 'id'}, { name: 'title' }, { name: 'body' } ]
    }),
    modelTypeFactory({
      name: 'App.Comment',
      count: 2,
      columns: [ { name: 'id'}, { name: 'title' }, { name: 'body' }]
    })
  ];
}

function recordFactory(attr) {
  var object = Ember.Object.create();
  return {
    columnValues: attr,
    objectId: Ember.guidFor(object)
  };
}

function records(type) {
  if (type === 'App.Post') {
    return [
      recordFactory({ id: 1, title: 'My Post', body: 'This is my first post' }),
      recordFactory({ id: 2, title: 'Hello', body: '' })
    ];
  } else if(type === 'App.Comment') {
    return [
      recordFactory({ id: 1, title: 'My Comment', body: 'This is my comment' }),
      recordFactory({ id: 2, title: 'I am confused', body: 'I have no idea what im doing' })
    ];
  }
}

module("Data", {
  setup: function() {
    EmberExtension.Port = EmberExtension.Port.extend({
      init: function() {},
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
    EmberExtension.reset();

    port = EmberExtension.__container__.lookup('port:main');
  }
});

test("Model types are successfully listed", function() {
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
      if (name === 'data:getModelTypes') {
        this.trigger('data:modelTypesAdded', { modelTypes: modelTypes() });
      }
      if (name === 'data:getRecords') {
        this.trigger('data:recordsAdded', { records: records(message.objectId) });
      }
    }
  });
  visit('model_types.index')
  .then(function() {
    return click(findByLabel('model-type-row').first());
  });

  ok(true);
});
