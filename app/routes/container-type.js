import { Promise } from 'rsvp';
import { get } from '@ember/object';
import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  setupController(controller) {
    controller.setProperties({
      search: '',
      searchVal: '',
    });
    this._super(...arguments);
  },
  model(params) {
    const type = params.type_id;
    const port = this.port;
    return new Promise((resolve, reject) => {
      port.one('container:instances', (message) => {
        if (message.status === 200) {
          resolve(message.instances);
        } else {
          reject(message);
        }
      });
      port.send('container:getInstances', { containerType: type });
    });
  },

  actions: {
    error(err) {
      if (err && err.status === 404) {
        this.transitionTo('container-types.index');
        return false;
      }
    },
    sendInstanceToConsole(obj) {
      this.port.send('container:sendInstanceToConsole', {
        name: get(obj, 'fullName'),
      });
    },
  },
});
