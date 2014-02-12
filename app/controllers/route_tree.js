var RouteTreeController = Ember.ArrayController.extend({
  needs: ['application'],
  itemController: 'routeItem',
  currentRoute: null
});

export default RouteTreeController;
