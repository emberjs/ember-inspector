import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { get, action } from '@ember/object';
import TabRoute from 'ember-inspector/routes/tab';

export default class ContainerTypeRoute extends TabRoute {
  @service port;
  @service router;

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
  }

  setupController(controller) {
    controller.setProperties({
      search: '',
      searchVal: '',
    });
    super.setupController(...arguments);
  }

  @action
  error(err) {
    if (err && err.status === 404) {
      this.router.transitionTo('container-types.index');
      return false;
    }
  }

  @action
  sendInstanceToConsole(obj) {
    this.port.send('container:sendInstanceToConsole', {
      name: get(obj, 'fullName'),
    });
  }
}
