import Ember from "ember";
const { ArrayController, computed, run } = Ember;
const { alias, map } = computed;

export default ArrayController.extend({
  model: map('port.detectedApplications', function(item) {
    let name = item.split('__');
    return {
      name: name[1],
      val: item
    };
  }),

  selectedApp: alias('port.applicationId'),

  selectedDidChange: function() {
    // Change iframe being debugged
    let url = '/';
    let applicationId = this.get('selectedApp');
    let app = this.container.lookup('application:main');
    let list = this.get('port').get('detectedApplications');

    run(app, app.reset);
    let router = app.__container__.lookup('router:main');
    let port = app.__container__.lookup('port:main');
    port.set('applicationId', applicationId);
    port.set('detectedApplications', list);

    // start
    router.location.setURL(url);
    run(app, app.handleURL, url);

  }.observes('selectedApp')
});
