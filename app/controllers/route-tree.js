import Ember from "ember";
import checkCurrentRoute from "ember-inspector/utils/check-current-route";

const { Controller, computed, inject } = Ember;
const { filter } = computed;

export default Controller.extend({
  application: inject.controller(),
  currentRoute: null,
  options: {
    hideRoutes: false
  },

  filtered: filter('content', function(routeItem) {
    let currentRoute = this.get('currentRoute');
    let hideRoutes = this.get('options.hideRoutes');

    if (hideRoutes && currentRoute) {
      return checkCurrentRoute( currentRoute, routeItem.value.name );
    } else {
      return true;
    }
  }).property('content', 'options.hideRoutes', 'currentRoute')
});
