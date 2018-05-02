import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import checkCurrentRoute from "ember-inspector/utils/check-current-route";
import searchMatch from 'ember-inspector/utils/search-match';

export default Controller.extend({
  application: controller(),

  queryParams: ['hideRoutes'],

  currentRoute: null,
  hideRoutes: alias('options.hideRoutes'),
  searchValue: '',

  options: {
    hideRoutes: false
  },

  model: computed(() => []),

  filtered: computed('model.[]', 'options.hideRoutes', 'currentRoute', 'searchValue', function() {
    return this.get('model').filter(routeItem => {
      let currentRoute = this.get('currentRoute');
      let hideRoutes = this.get('options.hideRoutes');

      if (!searchMatch(routeItem.value.name, this.get('searchValue'))) {
        return false;
      }

      if (hideRoutes && currentRoute) {
        return checkCurrentRoute(currentRoute, routeItem.value.name);
      }

      return true;
    });
  }),

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
