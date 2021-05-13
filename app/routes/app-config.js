import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  model() {
    const port = this.port;
    return new Promise((resolve) => {
      port.one('general:emberCliConfig', (message) => {
        resolve(message.emberCliConfig);
      });
      port.send('general:getEmberCliConfig');
    });
  },
});
