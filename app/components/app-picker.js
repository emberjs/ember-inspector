import Component from '@ember/component';
import { action, observer } from '@ember/object';
import { alias, reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['app-picker'],

  apps: alias('port.detectedApplications.[]'),
  selectedApp: reads('port.applicationId'),

  selectedDidChange: observer('selectedApp', function() {
    this.port.set('applicationId', this.selectedApp);
  }),

  init() {
    this._super(...arguments);
    this.port.send('app-picker-loaded');
  },

  selectApp: action(function(applicationId) {
    this.set('selectedApp', applicationId);
    this.port.send('app-selected', { applicationId });
  })
});
