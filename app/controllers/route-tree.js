import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';
import searchMatch from 'ember-inspector/utils/search-match';
import isRouteSubstate from 'ember-inspector/utils/is-route-substate';

export default Controller.extend({
  application: controller(),

  queryParams: ['hideRoutes'],

  currentRoute: null,
  hideRoutes: alias('options.hideRoutes'),
  searchValue: '',

  options: {
    hideRoutes: false,
    hideSubstates: false
  },

  filtered: computed('model.[]', 'options.hideRoutes', 'options.hideSubstates', 'currentRoute.{name,url}', 'searchValue', function() {
    return this.get('model').filter(routeItem => {
      let currentRoute = this.get('currentRoute');
      let hideRoutes = this.get('options.hideRoutes');
      let hideSubstates = this.get('options.hideSubstates');

      if (hideRoutes && currentRoute) {
        return checkCurrentRoute(currentRoute, routeItem.value);
      }

      if (hideSubstates && isRouteSubstate(routeItem.value.name)) {
        return false;
      }

      if (!searchMatch(routeItem.value.name, this.get('searchValue'))) {
        return false;
      }

      return true;
    });
  }),

  rows: computed('filtered.[]', function() {
    return this.get('filtered').map(function(route) {
      return {
        name: route,
        objects: route,
        url: route
      };
    });
  }),

  init() {
    this._super(...arguments);

    this.model = [];
  },

  actions: {
    inspectRoute(name) {
      this.get('port').send('objectInspector:inspectRoute', { name });
    },
    sendRouteHandlerToConsole(name) {
      this.get('port').send('objectInspector:sendRouteHandlerToConsole', { name });
    },
    inspectController(controller) {
      if (!controller.exists) {
        return;
      }
      this.get('port').send('objectInspector:inspectController', { name: controller.name });
    },
    sendControllerToConsole(name) {
      this.get('port').send('objectInspector:sendControllerToConsole', { name });
    }
  }
});
