import { inject as service } from '@ember/service';
import TabRoute from 'ember-inspector/routes/tab';

export default class AppConfigRoute extends TabRoute {
  @service port;

  model() {
    const port = this.port;
    return new Promise((resolve) => {
      port.one('general:emberCliConfig', (message) => {
        resolve(message.emberCliConfig);
      });
      port.send('general:getEmberCliConfig');
    });
  }
}
