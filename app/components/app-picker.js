import Component from '@ember/component';
import { observer } from '@ember/object';
import { map, reads } from '@ember/object/computed';
import { getOwner } from '@ember/application';

export default Component.extend({
  classNames: ['app-picker'],

  selectedApp: reads('port.applicationId'),

  apps: map('port.detectedApplications.[]', function({ applicationName, applicationId }) {
    // If we already have both a name and an id, use them as is
    if (applicationId && applicationName) {
      return { applicationId, applicationName };
    } else {
      // Otherwise, default to old behavior of splitting uniqueId to get the url from the middle
      if (applicationId) {
        const applicationName = applicationId.split('__')[1];
        return { applicationId, applicationName };
      }
    }
  }),

  selectedDidChange: observer('selectedApp', function() {
    // Change app being debugged
    const applicationId = this.get('selectedApp');
    const port = getOwner(this).lookup('port:main');
    port.set('applicationId', applicationId);
  }),

  init() {
    this._super(...arguments);
    this.port.send('app-picker-loaded');
  },

  actions: {
    selectApp(applicationId) {
      this.set('selectedApp', applicationId);
      this.port.send('app-selected', { applicationId });
    }
  }
});
