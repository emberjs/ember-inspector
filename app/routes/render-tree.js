import EmberObject, { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import TabRoute from 'ember-inspector/routes/tab';

export default class RenderTreeRoute extends TabRoute {
  @service port;

  model() {
    const port = this.port;
    return new Promise(function (resolve) {
      port.one(
        'render:profilesAdded',
        function ({ profiles, isHighlightSupported }) {
          resolve(EmberObject.create({ profiles, isHighlightSupported }));
        },
      );
      port.send('render:watchProfiles');
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    if (get(model, 'profiles.length') === 0) {
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
    set(this, 'controller.model.profiles', message.profiles);
  }

  profilesAdded(message) {
    const currentProfiles = get(this, 'controller.model.profiles');
    const profiles = message.profiles;
    if (
      message.isHighlightSupported !== undefined &&
      message.isHighlightSupported !==
        get(this, 'controller.model.isHighlightSupported')
    ) {
      set(
        this,
        'controller.model.isHighlightSupported',
        message.isHighlightSupported,
      );
    }

    currentProfiles.pushObjects(profiles);
    if (currentProfiles.length > 100) {
      set(this, 'controller.model.profiles', currentProfiles.slice(0, 100));
    }
  }
}
