import Controller from '@ember/controller';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import type PortService from '../../services/port';

export default class ContainerTypesIndexController extends Controller {
  @service declare port: PortService;
  @service declare router: RouterService;

  @action
  refresh() {
    this.router.refresh('container-types');
  }

  @action
  sendContainerToConsole() {
    this.port.send('objectInspector:sendContainerToConsole');
  }
}
