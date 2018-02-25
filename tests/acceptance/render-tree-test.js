import { visit, find, findAll, click, fillIn } from '@ember/test-helpers';
import { run } from '@ember/runloop';
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

    assert.notOk(find('.js-render-tree'), "no render tree");
    assert.ok(find('.js-render-tree-empty'), "Message about empty render tree shown");
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

    assert.ok(find('.js-render-tree'));
    let rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "Two rows are rendered initially");

    assert.equal(find('.js-render-profile-name', rows[0]).textContent.trim(), "First View Rendering");
    assert.equal(find('.js-render-profile-duration', rows[0]).textContent.trim(), "476.87ms");
    assert.equal(find('.js-render-profile-timestamp', rows[0]).textContent.trim(), "13:16:22:715");

    assert.equal(find('.js-render-profile-name', rows[1]).textContent.trim(), "Second View Rendering");
    assert.equal(find('.js-render-profile-duration', rows[1]).textContent.trim(), "10.00ms");
    assert.equal(find('.js-render-profile-timestamp', rows[1]).textContent.trim(), "13:16:22:759");

    await click('.js-render-main-cell', rows[0]);

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 3, "Child is shown below the parent");

    assert.equal(find('.js-render-profile-name', rows[1]).textContent.trim(), "Child view");
    assert.equal(find('.js-render-profile-duration', rows[1]).textContent.trim(), "0.36ms");
    assert.equal(find('.js-render-profile-timestamp', rows[1]).textContent.trim(), "13:16:22:581");

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

    assert.equal(find('.js-render-profile-name', rows[0]).textContent.trim(), "First View Rendering");
    assert.equal(find('.js-render-profile-name', rows[1]).textContent.trim(), "Second View Rendering");

    await fillIn('.js-render-profiles-search input', 'first');

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "The first parent is rendered with the child");
    assert.equal(find('.js-render-profile-name', rows[0]).textContent.trim(), "First View Rendering");
    assert.equal(find('.js-render-profile-name', rows[1]).textContent.trim(), "Child view");

    // Minimize to hide child view
    await click('.js-render-main-cell');

    await fillIn('.js-render-profiles-search input', '');

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 2, "filter is reset");

    assert.equal(find('.js-render-profile-name', rows[0]).textContent.trim(), "First View Rendering");
    assert.equal(find('.js-render-profile-name', rows[1]).textContent.trim(), "Second View Rendering");

    await fillIn('.js-render-profiles-search input', 'Second');

    rows = findAll('.js-render-profile-item');
    assert.equal(rows.length, 1, "The second row is the only one showing");
    assert.equal(find('.js-render-profile-name', rows[0]).textContent.trim(), "Second View Rendering");
  });
});
