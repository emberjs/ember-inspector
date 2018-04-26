import { visit, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let port;

module('Info Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('config:main').VERSION = '9.9.9';
    port = this.owner.lookup('port:main');
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

  test("Libraries are displayed correctly", async function t(assert) {
    await visit('/info');

    let libraries = findAll('.js-library-row');
    assert.equal(libraries.length, 3, "The correct number of libraries is displayed");
    assert.dom(libraries[0].querySelector('.js-lib-name')).hasText('Ember Inspector', 'Ember Inspector is added automatically');
    assert.dom(libraries[0].querySelector('.js-lib-version')).hasText('9.9.9');
    assert.dom(libraries[1].querySelector('.js-lib-name')).hasText('Ember');
    assert.dom(libraries[1].querySelector('.js-lib-version')).hasText('1.0');
    assert.dom(libraries[2].querySelector('.js-lib-name')).hasText('Handlebars');
    assert.dom(libraries[2].querySelector('.js-lib-version')).hasText('2.1');
  });
});
