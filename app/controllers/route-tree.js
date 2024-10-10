import { alias } from '@ember/object/computed';
import { action, computed, set } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';
import searchMatch from 'ember-inspector/utils/search-match';
import isRouteSubstate from 'ember-inspector/utils/is-route-substate';

export default class RouteTreeController extends Controller {
  @controller application;
  @service port;

  queryParams = ['hideRoutes'];

  currentRoute = null;

  searchValue = '';

  @alias('options.hideRoutes') hideRoutes;

  @computed(
    'model.[]',
    'options.{hideRoutes,hideSubstates}',
    'currentRoute.{name,url}',
    'searchValue',
  )
  get filtered() {
    if (!Array.isArray(this.model)) {
      return [];
    }
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

  @computed('filtered.[]')
  get rows() {
    return this.filtered.map(function (route) {
      return {
        name: route,
        objects: route,
        url: route,
      };
    });
  }

  init() {
    super.init(...arguments);

    set(this, 'model', []);
    set(this, 'options', {
      hideRoutes: false,
      hideSubstates: false,
    });
  }

  @action
  inspectRoute(name) {
    this.port.send('objectInspector:inspectRoute', { name });
  }

  @action
  sendRouteHandlerToConsole(name) {
    this.port.send('objectInspector:sendRouteHandlerToConsole', { name });
  }

  @action
  inspectController(controller) {
    if (!controller.exists) {
      return;
    }
    this.port.send('objectInspector:inspectController', {
      name: controller.name,
    });
  }

  @action
  sendControllerToConsole(name) {
    this.port.send('objectInspector:sendControllerToConsole', { name });
  }
}
