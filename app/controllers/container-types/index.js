import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ContainerTypesIndexController extends Controller {
  @service port;

  @action
  sendContainerToConsole() {
    this.port.send('objectInspector:sendContainerToConsole');
  }
}
