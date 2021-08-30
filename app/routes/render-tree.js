import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default class RenderTreeRoute extends TabRoute {
  @service port;

  model() {
    const port = this.port;
    return new Promise(function (resolve) {
      port.one('render:profilesAdded', function (message) {
        resolve(message.profiles);
      });
      port.send('render:watchProfiles');
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    if (model.length === 0) {
      controller.set('initialEmpty', true);
    }
    const port = this.port;
    port.on('render:profilesUpdated', this, this.profilesUpdated);
    port.on('render:profilesAdded', this, this.profilesAdded);
  }

  deactivate() {
    super.deactivate(...arguments);

    const port = this.port;
    port.off('render:profilesUpdated', this, this.profilesUpdated);
    port.off('render:profilesAdded', this, this.profilesAdded);
    port.send('render:releaseProfiles');
  }

  profilesUpdated(message) {
    set(this, 'controller.model', message.profiles);
  }

  profilesAdded(message) {
    const model = get(this, 'controller.model');
    const profiles = message.profiles;

    model.pushObjects(profiles);
    if (model.length > 100) {
      set(this, 'controller.model', model.slice(0, 100));
    }
  }

  @action
  clearProfiles() {
    this.port.send('render:clear');
  }
}
