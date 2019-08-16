import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';

export default EmberObject.extend(Evented, {
  applicationId: undefined,
  applicationName: undefined,

  init() {
    this._super(...arguments);

    /*
     * An array of objects of the form:
     * { applicationId, applicationName }
     */
    this.detectedApplications = [];

    this.adapter.onMessageReceived(message => {
      if (message.type === 'apps-loaded') {
        message.apps.forEach(app => {
          if (!this.detectedApplications.mapBy('applicationId').includes(app.applicationId)) {
            this.detectedApplications.pushObject(app);
          }
        });
      }
    });

    this.adapter.onMessageReceived(message => {
      const { applicationId, applicationName } = message;

      if (message.type === 'app-list') {
        const apps = JSON.parse(message.appList);
        apps.forEach((app) => {
          if (!this.detectedApplications.mapBy('applicationId').includes(app.applicationId)) {
            this.detectedApplications.push(app);
          }
        });

        return;
      }

      if (!applicationId) {
        return;
      }

      if (!this.applicationId) {
        this.set('applicationId', applicationId);
      }

      // save list of application ids
      if (!this.detectedApplications.mapBy('applicationId').includes(applicationId)) {
        this.detectedApplications.pushObject({ applicationId, applicationName });
      }

      if (this.applicationId === applicationId) {
        this.trigger(message.type, message, applicationId);
      }
    });
  },
  send(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.applicationId;
    message.applicationName = this.applicationName;
    this.adapter.sendMessage(message);
  }
});
