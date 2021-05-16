import TabRoute from 'ember-inspector/routes/tab';
import { inject as service } from '@ember/service';

export default TabRoute.extend({
  port: service(),

  model() {
    const port = this.port;
    return new Promise((resolve) => {
      port.one('general:emberCliConfig', (message) => {
        resolve(message.emberCliConfig);
      });
      port.send('general:getEmberCliConfig');
    });
  },
});
