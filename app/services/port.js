import { set } from '@ember/object';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default class PortService extends Service.extend(Evented) {
  applicationId = undefined;
  applicationName = undefined;

  init() {
    super.init(...arguments);

    /*
     * A dictionary of the form:
     * { applicationId: applicationName }
     */
    this.detectedApplications = {};
    this.applicationId = undefined;
    this.applicationName = undefined;

    this.adapter.onMessageReceived((message) => {
      if (message.type === 'apps-loaded') {
        message.apps.forEach(({ applicationId, applicationName }) => {
          set(this.detectedApplications, applicationId, applicationName);
        });

        return;
      }

      let { applicationId, applicationName } = message;

      if (!applicationId) {
        return;
      }

      // save the application, in case we haven't seen it yet
      set(this.detectedApplications, applicationId, applicationName);

      if (!this.applicationId) {
        this.selectApplication(applicationId);
      }

      if (this.applicationId === applicationId) {
        this.trigger(message.type, message, applicationId);
      }
    });
  }

  selectApplication(applicationId) {
    if (
      applicationId in this.detectedApplications &&
      applicationId !== this.applicationId
    ) {
      let applicationName = this.detectedApplications[applicationId];
      this.setProperties({ applicationId, applicationName });
      this.send('app-selected', { applicationId, applicationName });
    }
  }

  send(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.applicationId;
    message.applicationName = this.applicationName;
    this.adapter.sendMessage(message);
  }
}
