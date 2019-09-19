import { action } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  sendContainerToConsole: action(function() {
    this.port.send('objectInspector:sendContainerToConsole');
  })
});
