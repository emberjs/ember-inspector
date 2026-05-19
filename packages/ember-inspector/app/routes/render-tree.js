import EmberObject, { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

import { TrackedArray } from 'tracked-built-ins';

import TabRoute from './tab';

export default class RenderTreeRoute extends TabRoute {
  @service port;

  model() {
    return new Promise((resolve) => {
      this.port.one(
        'render:profilesAdded',
        function ({ profiles, isHighlightSupported }) {
          resolve(
            EmberObject.create({
              profiles: new TrackedArray(profiles),
              isHighlightSupported,
            }),
          );
        },
      );
      this.port.send('render:watchProfiles');
    });
  }

  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

    if (model.profiles.length === 0) {
      controller.initialEmpty = true;
    }

    this.port.on('render:profilesUpdated', this, this.profilesUpdated);
    this.port.on('render:profilesAdded', this, this.profilesAdded);
  }

  deactivate(transition) {
    super.deactivate(transition);

    this.port.off('render:profilesUpdated', this, this.profilesUpdated);
    this.port.off('render:profilesAdded', this, this.profilesAdded);
    this.port.send('render:releaseProfiles');
  }

  profilesUpdated = (message) => {
    set(this.controller.model, 'profiles', message.profiles);
  };

  profilesAdded = (message) => {
    const currentProfiles = this.controller.model.profiles;
    const profiles = message.profiles;
    if (
      message.isHighlightSupported !== undefined &&
      message.isHighlightSupported !==
        this.controller.model.isHighlightSupported
    ) {
      set(
        this.controller.model,
        'isHighlightSupported',
        message.isHighlightSupported,
      );
    }

    currentProfiles.push(profiles);
    if (currentProfiles.length > 100) {
      set(this.controller.model, 'profiles', currentProfiles.slice(0, 100));
    }
  };
}
