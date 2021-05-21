import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default class ContainerTypesRoute extends Route {
  @service port;

  model() {
    const port = this.port;
    return new Promise((resolve) => {
      port.one('container:types', function (message) {
        resolve(message.types);
      });
      port.send('container:getTypes');
    });
  }

  @action
  reload() {
    this.refresh();
  }
}
