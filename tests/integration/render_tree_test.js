/* jshint ignore:start */
import Ember from "ember";
import { test } from 'ember-qunit';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
let App;

let port, message, name;

module('Render Tree Tab', {
  beforeEach() {
    App = startApp({
      adapter: 'basic'
    });
    port = App.__container__.lookup('port:main');
    port.reopen({
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
  },
  afterEach() {
    Ember.run(App, App.destroy);
    name = null;
    message = null;
  }
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


test("No profiles collected", async function t(assert) {
  port.reopen({
    send(n, m) {
      if (n === 'render:watchProfiles') {
        this.trigger('render:profilesAdded', {
          profiles: []
        });
      }
    }
  });

  await visit('/render-tree');

  assert.equal(findByLabel('render-tree').length, 0, "no render tree");
  assert.equal(findByLabel('render-tree-empty').length, 1, "Message about empty render tree shown");
});

test("Renders the list correctly", async function t(assert) {
  port.reopen({
    send(n, m) {
      if (n === 'render:watchProfiles') {
        this.trigger('render:profilesAdded', {
          profiles: generateProfiles()
        });
      }
    }
  });

  await visit('/render-tree');

  assert.equal(findByLabel('render-tree').length, 1);

  let rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 2, "Two rows are rendered initially");

  assert.equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
  assert.equal(findByLabel('render-profile-duration', rows[0]).text().trim(), "476.87ms");
  assert.equal(findByLabel('render-profile-timestamp', rows[0]).text().trim(), "13:16:22:715");

  assert.equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Second View Rendering");
  assert.equal(findByLabel('render-profile-duration', rows[1]).text().trim(), "10.00ms");
  assert.equal(findByLabel('render-profile-timestamp', rows[1]).text().trim(), "13:16:22:759");

  await clickByLabel('render-main-cell', rows[0]);

  rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 3, "Child is shown below the parent");

  assert.equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Child view");
  assert.equal(findByLabel('render-profile-duration', rows[1]).text().trim(), "0.36ms");
  assert.equal(findByLabel('render-profile-timestamp', rows[1]).text().trim(), "13:16:22:581");

  await clickByLabel('render-main-cell', rows[0]);

  rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 2, "Child is hidden when parent collapses");
});

test("Searching the profiles", async function t(assert) {
  port.reopen({
    send(n, m) {
      if (n === 'render:watchProfiles') {
        this.trigger('render:profilesAdded', {
          profiles: generateProfiles()
        });
      }
    }
  });

  await visit('/render-tree');

  let rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 2, "Two rows are rendered initially");

  assert.equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
  assert.equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Second View Rendering");

  await fillIn('input', findByLabel('render-profiles-search'), 'first');

  rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 2, "The first parent is rendered with the child");
  assert.equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
  assert.equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Child view");

  await fillIn('input', findByLabel('render-profiles-search'), '');

  rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 2, "filter is reset");

  assert.equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
  assert.equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Second View Rendering");

  await fillIn('input', findByLabel('render-profiles-search'), 'Second');

  rows = findByLabel('render-profile-row');
  assert.equal(rows.length, 1, "The second row is the only one showing");
  assert.equal(findByLabel('render-profile-name', rows[0]).text().trim(), "Second View Rendering");
});
