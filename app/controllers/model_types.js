var ModelTypesController = Ember.ArrayController.extend({
  needs: ['application'],
  collapsed: Ember.computed.bool('selected'),
  itemController: 'modelTypeItem'
});

export default ModelTypesController;
