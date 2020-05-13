import Component from '@ember/component';
import { alias, reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['app-picker'],

  apps: alias('port.detectedApplications'),
  selectedAppId: reads('port.applicationId'),

  init() {
    this._super(...arguments);
    this.port.send('app-picker-loaded');
  },

  actions: {
    selectApp(applicationId) {
      this.port.selectApplication(applicationId);
    },
  },
});
