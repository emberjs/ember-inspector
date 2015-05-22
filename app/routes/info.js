import Ember from "ember";
import TabRoute from "ember-inspector/routes/tab";

const { RSVP: { Promise }, computed } = Ember;
const { oneWay } = computed;

export default TabRoute.extend({
  version: oneWay('config.VERSION').readOnly(),

  model: function() {
    const version = this.get('version');
    const port = this.get('port');
    return new Promise(function(resolve) {
      port.one('general:libraries', function(message) {
        message.libraries.insertAt(0, {
          name: 'Ember Inspector',
          version: version
        });
        resolve(message.libraries);
      });
      port.send('general:getLibraries');
    });
  }
});
