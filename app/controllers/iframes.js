import Ember from "ember";
var ArrayController = Ember.ArrayController;
var alias = Ember.computed.alias;
var mapComputed = Ember.computed.map;
var run = Ember.run;

export default ArrayController.extend({
  model: mapComputed('port.detectedApplications', function(item) {
    var name = item.split('__');
    return {
      name: name[1],
      val: item
    };
  }),

  selectedApp: alias('port.applicationId'),

  selectedDidChange: function() {
    // Change iframe being debugged
    var url = '/';
    var applicationId = this.get('selectedApp');
    var app = this.container.lookup('application:main');
    var list = this.get('port').get('detectedApplications');

    run(app, app.reset);
    var router = app.__container__.lookup('router:main');
    var port = app.__container__.lookup('port:main');
    port.set('applicationId', applicationId);
    port.set('detectedApplications', list);

    // start
    router.location.setURL(url);
    run(app, app.handleURL, url);

  }.observes('selectedApp')
});
