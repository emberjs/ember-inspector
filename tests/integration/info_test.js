/*globals findByLabel, clickByLabel */
import Ember from "ember";
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
var App;

var port, message, name;

module('Info Tab', {
  setup: function() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
    port.reopen({
      send: function(name) {
        if (name === 'general:getLibraries') {
          this.trigger('general:libraries', {
            libraries: [
              { name: 'Ember', version: '1.0' },
              { name: 'Handlebars', version: '2.1' }
            ]
          });
        }
      }
    });
  },
  teardown: function() {
    name = null;
    message = null;
    Ember.run(App, App.destroy);
  }
});

test("Libraries are displayed correctly", function() {
  var infoRoute = App.__container__.lookup('route:info');
  infoRoute.reopen({
    version: '9.9.9'
  });

  visit('/info');

  andThen(function() {
    var libraries = findByLabel('library-row');
    equal(libraries.length, 3, "The correct number of libraries is displayed");
    equal(findByLabel('lib-name', libraries[0]).text().trim(), 'Ember Inspector', 'Ember Inspector is added automatically');
    equal(findByLabel('lib-version', libraries[0]).text().trim(), '9.9.9');
    equal(findByLabel('lib-name', libraries[1]).text().trim(), 'Ember');
    equal(findByLabel('lib-version', libraries[1]).text().trim(), '1.0');
    equal(findByLabel('lib-name', libraries[2]).text().trim(), 'Handlebars');
    equal(findByLabel('lib-version', libraries[2]).text().trim(), '2.1');
  });
});
