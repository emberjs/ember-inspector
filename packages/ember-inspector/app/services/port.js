import { action, set, setProperties } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
import { hasListeners } from '@ember/-internals/metal';
import Service, { inject as service } from '@ember/service';

export default class PortService extends Service {
  @service adapter;
  @service router;

  constructor() {
    super(...arguments);

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

      const { applicationId, applicationName } = message;

      if (!applicationId) {
        return;
      }

      // save the application, in case we haven't seen it yet
      set(this.detectedApplications, applicationId, applicationName);

      if (!this.applicationId) {
        this.selectApplication(applicationId);
      }

      if (this.applicationId === applicationId) {
        if (!hasListeners(this, message.type)) {
          throw new Error('unknown message type ' + message.type);
        }
        this.trigger(message.type, message, applicationId);
      }
    });

    addListener(this, 'view:inspectJSValue', this, ({ name }) =>
      this.adapter.inspectJSValue(name),
    );
  }

  selectApplication(applicationId) {
    if (
      applicationId in this.detectedApplications &&
      applicationId !== this.applicationId
    ) {
      const applicationName = this.detectedApplications[applicationId];
      const currentApplication = this.applicationId;
      setProperties(this, { applicationId, applicationName });
      if (currentApplication) {
        // this is only required when switching apps
        this.router.transitionTo('app-detected');
      }
      this.send('app-selected', { applicationId, applicationName });
    }
  }

  @action
  send(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.applicationId;
    message.applicationName = this.applicationName;
    this.adapter.sendMessage(message);
  }

  // Manually implement Evented functionality, so we can move away from the mixin

  @action
  on(eventName, targetOrMethod, method) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod);
    } else {
      addListener(this, eventName, targetOrMethod, method);
    }
  }

  @action
  one(eventName, targetOrMethod, method) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod, true);
    } else {
      addListener(this, eventName, targetOrMethod, method, true);
    }
  }

  @action
  off(eventName, targetOrMethod, method) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod);
      } else {
        removeListener(this, eventName, targetOrMethod, method);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName, ...args) {
    sendEvent(this, eventName, args);
  }
}
