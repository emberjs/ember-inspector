import { set } from '@ember/object';
import Evented from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';

export default class PortService extends Service.extend(Evented) {
  @service adapter;
  @service router;

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
        if (!this.has(message.type)) {
          throw new Error('unknown message type ' + message.type);
        }
        this.trigger(message.type, message, applicationId);
      }
    });

    this.on('view:inspectJSValue', this, ({ name }) =>
      this.adapter.inspectJSValue(name)
    );
  }

  selectApplication(applicationId) {
    if (
      applicationId in this.detectedApplications &&
      applicationId !== this.applicationId
    ) {
      let applicationName = this.detectedApplications[applicationId];
      const currentApplication = this.applicationId;
      this.setProperties({ applicationId, applicationName });
      if (currentApplication) {
        // this is only required when switching apps
        this.router.transitionTo('app-detected');
      }
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

  off(...args) {
    try {
      super.off(...args);
    } catch (e) {
      console.error(e);
    }
  }
}
