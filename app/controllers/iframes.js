import Ember from "ember";
const { ArrayController, computed, run, observer } = Ember;
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

  selectedDidChange: observer('selectedApp', function() {
    // Change iframe being debugged
    const url = '/';
    const applicationId = this.get('selectedApp');
    const list = this.get('port').get('detectedApplications');
    let app = this.container.lookup('application:main');

    run(app, app.reset);
    let router = app.__container__.lookup('router:main');
    let port = app.__container__.lookup('port:main');
    port.set('applicationId', applicationId);
    port.set('detectedApplications', list);

    // start
    router.location.setURL(url);
    run(app, app.handleURL, url);

  })
});
