var ModelTypesController = Ember.ArrayController.extend({
  collapsed: Ember.computed.bool('selected')
});

export default ModelTypesController;
