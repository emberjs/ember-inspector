import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import { visit, find, findAll } from 'ember-native-dom-helpers';
let App;

let port;

module('Info Tab', function(hooks) {
  hooks.beforeEach(function() {
    App = startApp({
      adapter: 'basic'
    });
    App.__container__.lookup('config:main').VERSION = '9.9.9';
    port = App.__container__.lookup('port:main');
    port.reopen({
      send(name) {
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
  });

  hooks.afterEach(function() {
    run(App, App.destroy);
  });

  test("Libraries are displayed correctly", async function t(assert) {
    await visit('/info');

    let libraries = findAll('.js-library-row');
    assert.equal(libraries.length, 3, "The correct number of libraries is displayed");
    assert.equal(find('.js-lib-name', libraries[0]).textContent.trim(), 'Ember Inspector', 'Ember Inspector is added automatically');
    assert.equal(find('.js-lib-version', libraries[0]).textContent.trim(), '9.9.9');
    assert.equal(find('.js-lib-name', libraries[1]).textContent.trim(), 'Ember');
    assert.equal(find('.js-lib-version', libraries[1]).textContent.trim(), '1.0');
    assert.equal(find('.js-lib-name', libraries[2]).textContent.trim(), 'Handlebars');
    assert.equal(find('.js-lib-version', libraries[2]).textContent.trim(), '2.1');
  });
});
