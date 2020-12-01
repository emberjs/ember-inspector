import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { Promise } from 'rsvp';
/*eslint camelcase: 0 */
export default Route.extend({
  setupController(controller, model) {
    this._super(controller, model);
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controllerFor('model-types').set('selected', model);
  },

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
  },

  deactivate() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controllerFor('model-types').set('selected', null);
  },

  serialize(model) {
    return { type_id: get(model, 'name') };
  },
});
