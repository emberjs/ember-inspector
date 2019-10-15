import Component from '@ember/component';
import { action, observer } from '@ember/object';
import { alias, reads } from '@ember/object/computed';
import { getOwner } from '@ember/application';

export default Component.extend({
  classNames: ['app-picker'],

  apps: alias('port.detectedApplications.[]'),
  selectedApp: reads('port.applicationId'),

  selectedDidChange: observer('selectedApp', function() {
    // Change app being debugged
    const applicationId = this.selectedApp;
    const port = getOwner(this).lookup('port:main');
    port.set('applicationId', applicationId);
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
