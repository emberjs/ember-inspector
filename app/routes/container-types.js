import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default Route.extend({
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
