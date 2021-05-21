import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default class IndexRoute extends Route {
  @service port;

  model() {
    return new Promise((resolve) => {
      this.port.one('data:hasAdapter', function (message) {
        resolve(message.hasAdapter);
      });
      this.port.send('data:checkAdapter');
    });
  }

  afterModel(model) {
    if (model) {
      this.transitionTo('model-types');
    }
  }
}
