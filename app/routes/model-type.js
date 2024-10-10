import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';

export default class ModelTypeRoute extends Route {
  @service router;

  model(params) {
    return new Promise((resolve) => {
      const type = this.modelFor('model-types').findBy(
        'name',
        decodeURIComponent(params.type_id),
      );
      if (type) {
        resolve(type);
      } else {
        this.router.transitionTo('model-types.index');
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
    return { type_id: model.name };
  }
}
