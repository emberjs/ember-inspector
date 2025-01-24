import { inject as service } from '@ember/service';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { readOnly } from '@ember/object/computed';
import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default class LibrariesRoute extends TabRoute {
  @service config;
  @service port;

  @readOnly('config.VERSION') version;

  model() {
    const version = this.version;
    const port = this.port;
    return new Promise((resolve) => {
      port.one('general:libraries', (message) => {
        message.libraries.insertAt(0, {
          name: 'Ember Inspector',
          version,
        });
        resolve(message.libraries);
      });
      port.send('general:getLibraries');
    });
  }
}
