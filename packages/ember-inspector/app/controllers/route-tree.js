import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';
import searchMatch from 'ember-inspector/utils/search-match';
import isRouteSubstate from 'ember-inspector/utils/is-route-substate';
import RouteCellName from 'ember-inspector/components/route-cell-name';
import RouteCellObjects from 'ember-inspector/components/route-cell-objects';
import RouteCellUrl from 'ember-inspector/components/route-cell-url';

class RouteTreeOptions {
  @tracked hideRoutes = false;
  @tracked hideSubstates = false;
}

export default class RouteTreeController extends Controller {
  @controller application;
  @service port;

  queryParams = ['hideRoutes'];

  options = new RouteTreeOptions();

  @tracked currentRoute = null;
  @tracked searchValue = '';

  routeCells = {
    name: RouteCellName,
    objects: RouteCellObjects,
    url: RouteCellUrl,
  };

  get hideRoutes() {
    return this.options.hideRoutes;
  }

  set hideRoutes(value) {
    this.options.hideRoutes = value;
  }

  get filtered() {
    if (!Array.isArray(this.model)) {
      return [];
    }
    return this.model.filter((routeItem) => {
      let currentRoute = this.currentRoute;
      let hideRoutes = this.options.hideRoutes;
      let hideSubstates = this.options.hideSubstates;

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

  get rows() {
    return this.filtered.map(function (route) {
      return {
        name: route,
        objects: route,
        url: route,
      };
    });
  }

  constructor() {
    super(...arguments);
    this.model = [];
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
