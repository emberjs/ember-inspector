export default Ember.ArrayController.extend({
  needs: ['application'],
  itemController: 'routeItem',
  currentRoute: null
});
