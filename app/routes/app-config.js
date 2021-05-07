import Route from '@ember/routing/route';
import TabRoute from 'ember-inspector/routes/tab';
import { readOnly } from '@ember/object/computed';

export default TabRoute.extend({
  version: readOnly('config.VERSION'),

  model() {
    const version = this.version;
    const port = this.port;
    console.log('port', port);
    return new Promise((resolve) => {
      port.one('general:emberCliConfig', (message) => {
        console.log('message', message);
        resolve(message);
      });
      port.send('general:getEmberCliConfig');
    });
  },
});