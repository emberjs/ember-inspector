import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

export default Route.extend({
  port: service(),

  model() {
    const port = this.port;
    return new Promise((resolve) => {
      port.one('container:types', function (message) {
        resolve(message.types);
      });
      port.send('container:getTypes');
    });
  },
  actions: {
    reload() {
      this.refresh();
    },
  },
});
