export default Ember.ArrayController.extend({
  needs: ['application'],
  collapsed: Ember.computed.bool('selected'),
  itemController: 'modelTypeItem'
});
