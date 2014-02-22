
module("Info", {
  setup: function() {
    EmberExtension.reset();
    var port = EmberExtension.__container__.lookup('port:main');
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
  }
});

test("Libraries are displayed correctly", function() {

  visit('/info');

  andThen(function() {
    var libraries = findByLabel('library-row');
    equal(libraries.length, 2, "The correct number of libraries is displayed");
    equal(findByLabel('lib-name', libraries[0]).text().trim(), 'Ember');
    equal(findByLabel('lib-version', libraries[0]).text().trim(), '1.0');
    equal(findByLabel('lib-name', libraries[1]).text().trim(), 'Handlebars');
    equal(findByLabel('lib-version', libraries[1]).text().trim(), '2.1');
  });
});
