import Ember from "ember";
import checkCurrentRoute from "ember-inspector/utils/check-current-route";

var filter = Ember.computed.filter;

export default Ember.ArrayController.extend({
  needs: ['application'],
  itemController: 'routeItem',
  currentRoute: null,
  options: {
    hideRoutes: false
  },

  arrangedContent: filter('content', function(routeItem) {
    var currentRoute = this.get('currentRoute'),
        hideRoutes = this.get('options.hideRoutes');

    if( hideRoutes && currentRoute ) {
      return checkCurrentRoute( currentRoute, routeItem.value.name );
    } else {
      return true;
    }
  }).property('content', 'options.hideRoutes'),

  currentRouteChanged: function() {
    if (this.get('options.hideRoutes')) {
      this.propertyDidChange('content');
    }
  }.observes('currentRoute')
});
