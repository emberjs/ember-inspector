import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { Promise } from 'rsvp';

import { trackedArray } from '@ember/reactive/collections';

import TabRoute from './tab';

class RenderTreeModel {
  @tracked profiles;
  @tracked isHighlightSupported;

  constructor(profiles, isHighlightSupported) {
    this.profiles = trackedArray(profiles);
    this.isHighlightSupported = isHighlightSupported;
  }
}

export default class RenderTreeRoute extends TabRoute {
  @service port;

  model() {
    return new Promise((resolve) => {
      this.port.one(
        'render:profilesAdded',
        function ({ profiles, isHighlightSupported }) {
          resolve(new RenderTreeModel(profiles, isHighlightSupported));
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
    this.controller.model.profiles = trackedArray(message.profiles);
  };

  profilesAdded = (message) => {
    const currentProfiles = this.controller.model.profiles;
    const profiles = message.profiles;
    if (
      message.isHighlightSupported !== undefined &&
      message.isHighlightSupported !==
        this.controller.model.isHighlightSupported
    ) {
      this.controller.model.isHighlightSupported = message.isHighlightSupported;
    }

    currentProfiles.push(profiles);
    if (currentProfiles.length > 100) {
      this.controller.model.profiles = trackedArray(
        currentProfiles.slice(0, 100),
      );
    }
  };
}
