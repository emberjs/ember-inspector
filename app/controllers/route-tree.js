import { alias } from '@ember/object/computed';
import { action, computed, set } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';
import searchMatch from 'ember-inspector/utils/search-match';
import isRouteSubstate from 'ember-inspector/utils/is-route-substate';

export default Controller.extend({
  application: controller(),
  port: service(),

  queryParams: ['hideRoutes'],

  currentRoute: null,
  hideRoutes: alias('options.hideRoutes'),
  searchValue: '',

  filtered: computed(
    'model.[]',
    'options.{hideRoutes,hideSubstates}',
    'currentRoute.{name,url}',
    'searchValue',
    function () {
      return this.model.filter((routeItem) => {
        let currentRoute = this.currentRoute;
        let hideRoutes = this.get('options.hideRoutes');
        let hideSubstates = this.get('options.hideSubstates');

        if (hideRoutes && currentRoute) {
          return checkCurrentRoute(currentRoute, routeItem.value);
        }

        if (hideSubstates && isRouteSubstate(routeItem.value.name)) {
          return false;
        }

        if (!searchMatch(routeItem.value.name, this.searchValue)) {
          return false;
        }

        return true;
      });
    }
  ),

  rows: computed('filtered.[]', function () {
    return this.filtered.map(function (route) {
      return {
        name: route,
        objects: route,
        url: route,
      };
    });
  }),

  init() {
    this._super(...arguments);

    set(this, 'model', []);
    set(this, 'options', {
      hideRoutes: false,
      hideSubstates: false,
    });
  },

  inspectRoute: action(function (name) {
    this.port.send('objectInspector:inspectRoute', { name });
  }),

  sendRouteHandlerToConsole: action(function (name) {
    this.port.send('objectInspector:sendRouteHandlerToConsole', { name });
  }),

  inspectController: action(function (controller) {
    if (!controller.exists) {
      return;
    }
    this.port.send('objectInspector:inspectController', {
      name: controller.name,
    });
  }),

  sendControllerToConsole: action(function (name) {
    this.port.send('objectInspector:sendControllerToConsole', { name });
  }),
});
