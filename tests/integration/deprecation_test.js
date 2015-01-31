/*globals findByLabel, clickByLabel */
import Ember from "ember";
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
var App;

var port, message, name;

function deprecationsWithSource() {
  return [{
    count: 2,
    hasSourceMap: true,
    sources: [{
      stackStr: 'stack-trace',
      map: {
        source: 'path-to-file.js',
        line: 1,
        fullSource: 'http://path-to-file.js'
      }
    }, {
      stackStr: 'stack-trace-2',
      map: {
        source: 'path-to-second-file.js',
        line: 2,
        fullSource: 'http://path-to-second-file.js'
      }
    }],
    message: 'Deprecation 1',
    url: 'http://www.emberjs.com'
  }];
}

module('Deprecation Tab', {
  setup: function() {
    App = startApp({ adapter: 'basic' });
    port = App.__container__.lookup('port:main');
    port.reopen({
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
  },
  teardown: function() {
    name = null;
    message = null;
    Ember.run(App, App.destroy);
  }
});

test('No source map', function() {
  port.reopen({
    send: function(name) {
      if (name === 'deprecation:watch') {
        port.trigger('deprecation:deprecationsAdded', {
          deprecations: [{
            count: 2,
            sources: [{
              stackStr: 'stack-trace',
              map: null
            }, {
              stackStr: 'stack-trace-2',
              map: null
            }],
            message: 'Deprecation 1',
            url: 'http://www.emberjs.com'
          }]
        });
      }
      return this._super.apply(this, arguments);
    }
  });

  visit('/deprecations');
  andThen(function() {
    var rows = findByLabel('deprecation-item');
    equal(rows.length, 1);
    var row = rows[0];
    equal(findByLabel('deprecation-source', row).length, 0, 'no sources');
    equal(findByLabel('deprecation-message', row).text().trim(), 'Deprecation 1', 'message shown');
    equal(findByLabel('deprecation-count', row).text().trim(), 2, 'Count correct');
    equal(findByLabel('deprecation-full-trace', row).length, 1, 'Full trace button shown');
    return clickByLabel('full-trace-deprecations-btn', row);
  });

  andThen(function() {
    equal(name, 'deprecation:sendStackTraces');
    equal(message.deprecation.message, 'Deprecation 1');
    equal(message.deprecation.sources.length, 2);
  });
});

test("With source map, source found, can't open resource", function() {
  port.reopen({
    send: function(name) {
      if (name === 'deprecation:watch') {
        port.trigger('deprecation:deprecationsAdded', {
          deprecations: deprecationsWithSource()
        });
      }
      return this._super.apply(this, arguments);
    }
  });

  visit('/deprecations');
  andThen(function() {
    var rows = findByLabel('deprecation-item');
    equal(rows.length, 1);
    var row = rows[0];
    equal(findByLabel('deprecation-message', row).text().trim(), 'Deprecation 1', 'message shown');
    equal(findByLabel('deprecation-count', row).text().trim(), 2, 'Count correct');
    equal(findByLabel('deprecation-full-trace', row).length, 0, 'Full trace button not shown');

    var sources = findByLabel('deprecation-source', row);
    equal(sources.length, 2, 'shows all sources');
    equal(findByLabel('deprecation-source-link', sources[0]).length, 0, 'source not clickable');
    equal(findByLabel('deprecation-source-text', sources[0]).text().trim(), 'path-to-file.js:1');
    equal(findByLabel('deprecation-source-link', sources[1]).length, 0, 'source not clickable');
    equal(findByLabel('deprecation-source-text', sources[1]).text().trim(), 'path-to-second-file.js:2');

    clickByLabel('trace-deprecations-btn', sources[0]);
    andThen(function() {
      equal(name, 'deprecation:sendStackTraces');
      equal(message.deprecation.message, 'Deprecation 1');
      equal(message.deprecation.sources.length, 1);
    });
    clickByLabel('trace-deprecations-btn', sources[1]);
    andThen(function() {
      equal(name, 'deprecation:sendStackTraces');
      equal(message.deprecation.message, 'Deprecation 1');
      equal(message.deprecation.sources.length, 1);
    });
 });

});

test("With source map, source found, can open resource", function() {
  var openResource = false;
  port.get('adapter').reopen({
    canOpenResource: true,
    openResource: function() {
      openResource = arguments;
    }
  });
  port.reopen({
    send: function(name) {
      if (name === 'deprecation:watch') {
        port.trigger('deprecation:deprecationsAdded', {
          deprecations: deprecationsWithSource()
        });
      }
      return this._super.apply(this, arguments);
    }
  });

  visit('/deprecations');
  andThen(function() {
    var rows = findByLabel('deprecation-item');
    equal(rows.length, 1);
    var row = rows[0];
    equal(findByLabel('deprecation-message', row).text().trim(), 'Deprecation 1', 'message shown');
    equal(findByLabel('deprecation-count', row).text().trim(), 2, 'Count correct');
    equal(findByLabel('deprecation-full-trace', row).length, 0, 'Full trace button not shown');

    var sources = findByLabel('deprecation-source', row);
    equal(sources.length, 2, 'shows all sources');
    equal(findByLabel('deprecation-source-text', sources[0]).length, 0, 'source clickable');
    equal(findByLabel('deprecation-source-link', sources[0]).text().trim(), 'path-to-file.js:1');
    equal(findByLabel('deprecation-source-text', sources[1]).length, 0, 'source clickable');
    equal(findByLabel('deprecation-source-link', sources[1]).text().trim(), 'path-to-second-file.js:2');

    openResource = false;
    clickByLabel('deprecation-source-link', sources[0]);
    andThen(function() {
      ok(openResource);
      openResource = false;
    });
    clickByLabel('deprecation-source-link', sources[1]);
    andThen(function() {
      ok(openResource);
      openResource = false;
    });
    clickByLabel('trace-deprecations-btn', sources[0]);
    andThen(function() {
      equal(name, 'deprecation:sendStackTraces');
      equal(message.deprecation.message, 'Deprecation 1');
      equal(message.deprecation.sources.length, 1);
    });
    clickByLabel('trace-deprecations-btn', sources[1]);
    andThen(function() {
      equal(name, 'deprecation:sendStackTraces');
      equal(message.deprecation.message, 'Deprecation 1');
      equal(message.deprecation.sources.length, 1);
    });
  });
});
