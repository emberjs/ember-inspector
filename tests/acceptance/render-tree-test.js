import { visit, findAll, click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

let port;

module('Render Tree Tab', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    port = this.owner.lookup('port:main');
    port.reopen({
      send(/*n, m*/) {}
    });
  });

  function generateProfiles() {
    return [
      {
        name: 'First View Rendering',
        duration: 476.87,
        timestamp: (new Date(2014, 5, 1, 13, 16, 22, 715)).getTime(),
        children: [{
          name: 'Child view',
          duration: 0.36,
          timestamp: (new Date(2014, 5, 1, 13, 16, 22, 581)).getTime(),
          children: []
        }]
      },

      {
        name: "Second View Rendering",
        duration: 10,
        timestamp: (new Date(2014, 5, 1, 13, 16, 22, 759)).getTime(),
        children: []
      }
    ];
  }


  test("No profiles collected", async function(assert) {
    port.reopen({
      send(n/*, m*/) {
        if (n === 'render:watchProfiles') {
          this.trigger('render:profilesAdded', {
            profiles: []
          });
        }
      }
    });

    await visit('/render-tree');

    assert.dom('.js-render-tree').doesNotExist("no render tree");
    assert.dom('.js-render-tree-empty').exists("Message about empty render tree shown");
  });

  test("Renders the list correctly", async function(assert) {
    port.reopen({
      send(n/*, m*/) {
        if (n === 'render:watchProfiles') {
          this.trigger('render:profilesAdded', {
            profiles: generateProfiles()
          });
        }
      }
    });

    await visit('/render-tree');

    assert.dom('.js-render-tree').exists();
    let rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "Two rows are rendered initially");

    assert.dom(rows[0].querySelector('.js-render-profile-name')).hasText('First View Rendering');
    assert.dom(rows[0].querySelector('.js-render-profile-duration')).hasText('476.87ms');
    assert.dom(rows[0].querySelector('.js-render-profile-timestamp')).hasText('13:16:22:715');

    assert.dom(rows[1].querySelector('.js-render-profile-name')).hasText('Second View Rendering');
    assert.dom(rows[1].querySelector('.js-render-profile-duration')).hasText('10.00ms');
    assert.dom(rows[1].querySelector('.js-render-profile-timestamp')).hasText('13:16:22:759');

    await click('.js-render-main-cell', rows[0]);

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 3, "Child is shown below the parent");

    assert.dom(rows[1].querySelector('.js-render-profile-name')).hasText('Child view');
    assert.dom(rows[1].querySelector('.js-render-profile-duration')).hasText('0.36ms');
    assert.dom(rows[1].querySelector('.js-render-profile-timestamp')).hasText('13:16:22:581');

    await click('.js-render-main-cell', rows[0]);

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "Child is hidden when parent collapses");
  });

  test("Searching the profiles", async function(assert) {
    port.reopen({
      send(n/*, m*/) {
        if (n === 'render:watchProfiles') {
          this.trigger('render:profilesAdded', {
            profiles: generateProfiles()
          });
        }
      }
    });

    await visit('/render-tree');

    let rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "Two rows are rendered initially");

    assert.dom(rows[0].querySelector('.js-render-profile-name')).hasText('First View Rendering');
    assert.dom(rows[1].querySelector('.js-render-profile-name')).hasText('Second View Rendering');

    await fillIn('.js-render-profiles-search input', 'first');

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "The first parent is rendered with the child");
    assert.dom(rows[0].querySelector('.js-render-profile-name')).hasText('First View Rendering');
    assert.dom(rows[1].querySelector('.js-render-profile-name')).hasText('Child view');

    // Minimize to hide child view
    await click('.js-render-main-cell');

    await fillIn('.js-render-profiles-search input', '');

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "filter is reset");

    assert.dom(rows[0].querySelector('.js-render-profile-name')).hasText('First View Rendering');
    assert.dom(rows[1].querySelector('.js-render-profile-name')).hasText('Second View Rendering');

    await fillIn('.js-render-profiles-search input', 'Second');

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 1, "The second row is the only one showing");
    assert.dom(rows[0].querySelector('.js-render-profile-name')).hasText('Second View Rendering');
  });

  test("It should clear the search filter when the clear button is clicked", async function(assert) {
    port.reopen({
      send(n/*, m*/) {
        if (n === 'render:watchProfiles') {
          this.trigger('render:profilesAdded', {
            profiles: generateProfiles()
          });
        }
      }
    });

    await visit('/render-tree');

    let rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "expected all rows");

    await fillIn('.js-render-profiles-search input', 'xxxxxx');
    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 0, 'expected filtered rows');

    await click('.js-search-field-clear-button');
    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, 'expected all rows');
  });
});
