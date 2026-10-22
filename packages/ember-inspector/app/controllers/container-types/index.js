import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ContainerTypesIndexController extends Controller {
  @service port;
  @service router;

  @action
  refresh() {
    this.router.refresh('container-types');
  }

  @action
  sendContainerToConsole() {
    this.port.send('objectInspector:sendContainerToConsole');
  }
}
