import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default Route.extend({
  model() {
    let route = this;
    return new Promise(function(resolve) {
      route.port.one('data:hasAdapter', function(message) {
        resolve(message.hasAdapter);
      });
      route.port.send('data:checkAdapter');
    });
  },
  afterModel(model) {
    if (model) {
      this.transitionTo('model-types');
    }
  }
});
