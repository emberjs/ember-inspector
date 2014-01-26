
var port, name, message;

var guids = 0;
function generatePromise(props) {
  return $.extend({
    guid: ++guids,
    label: 'Generated Promise',
    parent: null,
    children: null,
    state: 'created',
    value: null,
    reason: null,
    createdAt: Date.now()
  }, props);
}


module("Promise", {
  setup: function() {
    EmberExtension.Port = EmberExtension.Port.extend({
      send: function(n, m) {
        name = n;
        message = m;
        if (n === 'promise:supported') {
          this.trigger('promise:supported', {
            supported: true
          });
        }
      }
    });
    EmberExtension.reset();

    port = EmberExtension.__container__.lookup('port:main');
  },
  teardown: function() {
    name = null;
    message = null;
  }
});


test("Backwards compatibility - no promise support", function() {
  port.reopen({
    send: function(n, m) {
      if (n === 'promise:supported') {
        this.trigger('promise:supported', {
          supported: false
        });
      }
    }
  });

  visit('/promises').
  then(function() {
    equal(findByLabel('error-page').length, 1, 'The error page should show up');
    equal(findByLabel('error-page-title').text().trim(), 'Promises not detected!');
  });
});

test("Pending promise", function() {
  visit('/promises');

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 1,
          label: 'Promise 1',
          state: 'created'
        })
      ]
    });
    wait();
  });

  andThen(function() {
    equal(findByLabel('promise-item').length, 1);
    var row = findByLabel('promise-item').first();
    equal(findByLabel('promise-label', row).text().trim(), 'Promise 1');
    equal(findByLabel('promise-state', row).text().trim(), 'Pending');
  });

});


test("Fulfilled promise", function() {
  visit('/promises');

  var now = Date.now();

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 1,
          label: 'Promise 1',
          state: 'fulfilled',
          value: {
            inspect: 'value',
            type: 'type-string'
          },
          createdAt: now,
          settledAt: now + 10
        })
      ]
    });
    wait();
  });

  andThen(function() {
    equal(findByLabel('promise-item').length, 1);
    var row = findByLabel('promise-item').first();
    equal(findByLabel('promise-label', row).text().trim(), 'Promise 1');
    equal(findByLabel('promise-state', row).text().trim(), 'Fulfilled');
    equal(findByLabel('promise-value', row).text().trim(), 'value');
    equal(findByLabel('promise-time', row).text().trim(), '10ms');
  });
});


test("Rejected promise", function() {
  visit('/promises');

  var now = Date.now();

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 1,
          label: 'Promise 1',
          state: 'rejected',
          reason: {
            inspect: 'reason',
            type: 'type-string'
          },
          createdAt: now,
          settledAt: now + 20
        })
      ]
    });
    wait();
  });

  andThen(function() {
    equal(findByLabel('promise-item').length, 1);
    var row = findByLabel('promise-item').first();
    equal(findByLabel('promise-label', row).text().trim(), 'Promise 1');
    equal(findByLabel('promise-state', row).text().trim(), 'Rejected');
    equal(findByLabel('promise-value', row).text().trim(), 'reason');
    equal(findByLabel('promise-time', row).text().trim(), '20ms');
  });

});

test("Chained promises", function() {
  visit('/promises');

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [
        generatePromise({
          guid: 2,
          parent: 1,
          label: 'Child'
        }),
        generatePromise({
          guid: 1,
          children: [2],
          label: 'Parent'
        })
      ]
    });
    wait();
  });

  andThen(function() {
    var rows = findByLabel('promise-item');
    equal(rows.length, 2);
    equal(findByLabel('promise-label', rows.eq(0)).text().trim(), 'Parent');
    equal(findByLabel('promise-label', rows.eq(1)).text().trim(), 'Child');
  });
});

test("Trace", function() {
  visit('/promises');

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [generatePromise({ guid: 1 })]
    });
    wait();
  });

  clickByLabel('trace-promise-btn');

  andThen(function() {
    equal(name, 'promise:tracePromise');
    deepEqual(message, { promiseId: 1 });
  });

});

test("Send fulfillment value to console", function() {
  visit('/promises');

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [generatePromise({
        guid: 1,
        state: 'fulfilled',
        value: {
          inspect: 'some string',
          type: 'type-string'
        }
      })]
    });
    wait();
  });

  andThen(function() {
    var row = findByLabel('promise-item').first();
    clickByLabel('send-to-console-btn', row);
  });

  andThen(function() {
    equal(name, 'promise:sendValueToConsole');
    deepEqual(message, { promiseId: 1 });
  });
});

test("Sending objects to the object inspector", function() {
  visit('/promises');

  andThen(function() {
    port.trigger('promise:promisesUpdated', {
      promises: [generatePromise({
        guid: 1,
        state: 'fulfilled',
        value: {
          inspect: 'Some Object',
          type: 'type-ember-object',
          objectId: 100
        }
      })]
    });
    wait();
  });

  andThen(function() {
    var row = findByLabel('promise-item').first();
    return clickByLabel('promise-object-value', row);
  });

  andThen(function() {
    equal(name, 'objectInspector:inspectById');
    deepEqual(message, { objectId: 100 });
  });
});
