import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    sendContainerToConsole() {
      this.get('port').send('objectInspector:sendContainerToConsole');
    }
  }
});
