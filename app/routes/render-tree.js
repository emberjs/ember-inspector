import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  model() {
    const port = this.port;
    return new Promise(function (resolve) {
      port.one('render:profilesAdded', function (message) {
        resolve(message.profiles);
      });
      port.send('render:watchProfiles');
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (model.length === 0) {
      controller.set('initialEmpty', true);
    }
    const port = this.port;
    port.on('render:profilesUpdated', this, this.profilesUpdated);
    port.on('render:profilesAdded', this, this.profilesAdded);
  },

  deactivate() {
    const port = this.port;
    port.off('render:profilesUpdated', this, this.profilesUpdated);
    port.off('render:profilesAdded', this, this.profilesAdded);
    port.send('render:releaseProfiles');
  },

  profilesUpdated(message) {
    this.set('controller.model', message.profiles);
  },

  profilesAdded(message) {
    const model = this.get('controller.model');
    const profiles = message.profiles;

    model.pushObjects(profiles);
    if (model.length > 100) {
      this.set('controller.model', model.slice(0, 100));
    }
  },

  actions: {
    clearProfiles() {
      this.port.send('render:clear');
    },
  },
});
