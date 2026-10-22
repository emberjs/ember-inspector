import { service } from '@ember/service';
import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default class LibrariesRoute extends TabRoute {
  @service config;
  @service port;

  get version() {
    return this.config.VERSION;
  }

  model() {
    const version = this.version;
    const port = this.port;
    return new Promise((resolve) => {
      port.one('general:libraries', (message) => {
        message.libraries.splice(0, 0, {
          name: 'Ember Inspector',
          version,
        });
        resolve(message.libraries);
      });
      port.send('general:getLibraries');
    });
  }
}
