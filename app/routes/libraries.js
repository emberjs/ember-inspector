import { Promise } from 'rsvp';
import TabRoute from "ember-inspector/routes/tab";
import { readOnly } from '@ember/object/computed';

export default TabRoute.extend({
  version: readOnly('config.VERSION'),

  model() {
    const version = this.version;
    const port = this.port;
    return new Promise(resolve => {
      port.one('general:libraries', message => {
        message.libraries.insertAt(0, {
          name: 'Ember Inspector',
          version
        });
        resolve(message.libraries);
      });
      port.send('general:getLibraries');
    });
  }
});
