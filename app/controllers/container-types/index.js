import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    sendContainerToConsole() {
      this.port.send('objectInspector:sendContainerToConsole');
    }
  }
});
