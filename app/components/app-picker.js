import Component from '@ember/component';
import { alias, reads } from '@ember/object/computed';
import { action } from '@ember/object';

export default Component.extend({
  classNames: ['app-picker'],

  apps: alias('port.detectedApplications'),
  selectedAppId: reads('port.applicationId'),

  init() {
    this._super(...arguments);
    this.port.send('app-picker-loaded');
  },

  selectApp: action(function (event) {
    let applicationId = event.target.value;
    this.port.selectApplication(applicationId);
  }),
});
