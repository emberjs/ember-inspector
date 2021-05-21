import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default class ModelTypeRoute extends Route {
  model(params) {
    return new Promise((resolve) => {
      const type = this.modelFor('model-types').findBy(
        'name',
        decodeURIComponent(params.type_id)
      );
      if (type) {
        resolve(type);
      } else {
        this.transitionTo('model-types.index');
      }
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controllerFor('model-types').set('selected', model);
  }

  deactivate() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controllerFor('model-types').set('selected', null);
  }

  serialize(model) {
    return { type_id: get(model, 'name') };
  }
}
