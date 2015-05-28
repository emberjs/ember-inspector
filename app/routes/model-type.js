import Ember from "ember";
const { RSVP: { Promise } } = Ember;
/*eslint camelcase: 0 */
export default Ember.Route.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    this.controllerFor('model-types').set('selected', model);
  },

  model: function(params) {
    return new Promise(resolve => {
      const type = this.modelFor('model-types').findBy('name', params.type_id);
      if (type) {
        resolve(type);
      } else {
        this.transitionTo('model-types.index');
      }
    });
  },

  deactivate: function() {
    this.controllerFor('model-types').set('selected', null);
  },

  serialize: function (model) {
    return { type_id: Ember.get(model, 'name') };
  }
});
