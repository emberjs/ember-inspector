/*globals findByLabel, clickByLabel */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
var App;

var port, message, name;

module('Info Tab', {
  beforeEach() {
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
  afterEach() {
    name = null;
    message = null;
    Ember.run(App, App.destroy);
  }
});

test("Libraries are displayed correctly", function(assert) {
  var infoRoute = App.__container__.lookup('route:info');
  infoRoute.reopen({
    version: '9.9.9'
  });

  visit('/info');

  andThen(function() {
    var libraries = findByLabel('library-row');
    assert.equal(libraries.length, 3, "The correct number of libraries is displayed");
    assert.equal(findByLabel('lib-name', libraries[0]).text().trim(), 'Ember Inspector', 'Ember Inspector is added automatically');
    assert.equal(findByLabel('lib-version', libraries[0]).text().trim(), '9.9.9');
    assert.equal(findByLabel('lib-name', libraries[1]).text().trim(), 'Ember');
    assert.equal(findByLabel('lib-version', libraries[1]).text().trim(), '1.0');
    assert.equal(findByLabel('lib-name', libraries[2]).text().trim(), 'Handlebars');
    assert.equal(findByLabel('lib-version', libraries[2]).text().trim(), '2.1');
  });
});
