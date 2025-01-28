import EmberObject, { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import type Transition from '@ember/routing/transition';

import { TrackedArray } from 'tracked-built-ins';

import type PortService from '../services/port';
import type RenderTreeController from '../controllers/render-tree';
import TabRoute from './tab';

export interface Profile {
  children: Array<Profile>;
  name: string;
}

export interface RenderTreeModel {
  isHighlightSupported: boolean;
  profiles: Array<Profile>;
}

export default class RenderTreeRoute extends TabRoute {
  @service declare port: PortService;

  declare controller: RenderTreeController;

  model() {
    return new Promise((resolve) => {
      this.port.one(
        'render:profilesAdded',
        function ({ profiles, isHighlightSupported }: RenderTreeModel) {
          resolve(
            EmberObject.create({
              // @ts-expect-error TODO: fix this
              profiles: new TrackedArray(profiles),
              isHighlightSupported,
            }),
          );
        },
      );
      this.port.send('render:watchProfiles');
    });
  }

  setupController(
    controller: RenderTreeController,
    model: RenderTreeModel,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);

    if (model.profiles.length === 0) {
      controller.initialEmpty = true;
    }

    this.port.on('render:profilesUpdated', this, this.profilesUpdated);
    this.port.on('render:profilesAdded', this, this.profilesAdded);
  }

  deactivate(transition: Transition) {
    super.deactivate(transition);

    this.port.off('render:profilesUpdated', this, this.profilesUpdated);
    this.port.off('render:profilesAdded', this, this.profilesAdded);
    this.port.send('render:releaseProfiles');
  }

  profilesUpdated = (message: RenderTreeModel) => {
    set(this.controller.model, 'profiles', message.profiles);
  };

  profilesAdded = (message: RenderTreeModel) => {
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

    // @ts-expect-error TODO: fix this type error
    currentProfiles.push(profiles);
    if (currentProfiles.length > 100) {
      set(this.controller.model, 'profiles', currentProfiles.slice(0, 100));
    }
  };
}
