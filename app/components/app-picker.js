import Component from '@ember/component';
import { observer } from '@ember/object';
import { readOnly, reads } from '@ember/object/computed';
import { getOwner } from '@ember/application';

export default Component.extend({
  init(...args) {
    this._super(...args);
    this.port.send('app-picker-loaded');
  },

  classNames: ['app-picker'],

  apps: readOnly('port.detectedApplications'),

  selectedApp: reads('port.applicationId'),

  selectedDidChange: observer('selectedApp', function() {
    // Change app being debugged
    const applicationId = this.get('selectedApp');
    const port = getOwner(this).lookup('port:main');
    port.set('applicationId', applicationId);
  }),

  actions: {
    selectApp(appName) {
      this.set('selectedApp', appName);
      this.port.send('app-selected', { appName });
    }
  }
});
