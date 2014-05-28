var port, message, name;

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

module("Render Tree", {
  setup: function() {
    EmberExtension.reset();
    port = EmberExtension.__container__.lookup('port:main');
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
  }
});


test("No profiles collected", function() {
  port.reopen({
    send: function(n, m) {
      if (n === 'render:watchProfiles') {
        this.trigger('render:profilesAdded', {
          profiles: []
        });
      }
    }
  });

  visit('/render-tree');

  andThen(function() {
    equal(findByLabel('render-tree').length, 0, "no render tree");
    equal(findByLabel('render-tree-empty').length, 1, "Message about empty render tree shown");
  });
});

test("Renders the list correctly", function() {
  port.reopen({
    send: function(n, m) {
      if (n === 'render:watchProfiles') {
        this.trigger('render:profilesAdded', {
          profiles: generateProfiles()
        });
      }
    }
  });

  visit('/render-tree');

  andThen(function() {
    equal(findByLabel('render-tree').length, 1);

    var rows = findByLabel('render-profile-row');
    equal(rows.length, 2, "Two rows are rendered initially");

    equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
    equal(findByLabel('render-profile-duration', rows[0]).text().trim(), "476.87ms");
    equal(findByLabel('render-profile-timestamp', rows[0]).text().trim(), "13:16:22:715");

    equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Second View Rendering");
    equal(findByLabel('render-profile-duration', rows[1]).text().trim(), "10.00ms");
    equal(findByLabel('render-profile-timestamp', rows[1]).text().trim(), "13:16:22:759");

    return clickByLabel('render-main-cell', rows[0]);
  });

  andThen(function() {
    var rows = findByLabel('render-profile-row');
    equal(rows.length, 3, "Child is shown below the parent");

    equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Child view");
    equal(findByLabel('render-profile-duration', rows[1]).text().trim(), "0.36ms");
    equal(findByLabel('render-profile-timestamp', rows[1]).text().trim(), "13:16:22:581");

    return clickByLabel('render-main-cell', rows[0]);
  });

  andThen(function() {
    var rows = findByLabel('render-profile-row');
    equal(rows.length, 2, "Child is hidden when parent collapses");
  });

});

test("Searching the profiles", function() {
  port.reopen({
    send: function(n, m) {
      if (n === 'render:watchProfiles') {
        this.trigger('render:profilesAdded', {
          profiles: generateProfiles()
        });
      }
    }
  });

  visit('/render-tree');

  andThen(function() {
    var rows = findByLabel('render-profile-row');
    equal(rows.length, 2, "Two rows are rendered initially");

    equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
    equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Second View Rendering");
  });

  andThen(function() {
    return fillIn('input', findByLabel('render-profiles-search'), 'first');
  });

  andThen(function() {
    var rows = findByLabel('render-profile-row');
    equal(rows.length, 2, "The first parent is rendered with the child");
    equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
    equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Child view");
  });

  andThen(function() {
    return fillIn('input', findByLabel('render-profiles-search'), '');
  });

  andThen(function() {
    var rows = findByLabel('render-profile-row');
    equal(rows.length, 2, "filter is reset");

    equal(findByLabel('render-profile-name', rows[0]).text().trim(), "First View Rendering");
    equal(findByLabel('render-profile-name', rows[1]).text().trim(), "Second View Rendering");
  });

  andThen(function() {
    return fillIn('input', findByLabel('render-profiles-search'), 'Second');
  });

  andThen(function() {
    var rows = findByLabel('render-profile-row');
    equal(rows.length, 1, "The second row is the only one showing");
    equal(findByLabel('render-profile-name', rows[0]).text().trim(), "Second View Rendering");
  });

});
