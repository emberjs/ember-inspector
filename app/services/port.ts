import { action, set } from '@ember/object';
import {
  addListener,
  // @ts-expect-error TODO: figure out why this is not typed
  hasListeners,
  removeListener,
  sendEvent,
} from '@ember/object/events';
import Service, { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type WebExtension from './adapters/web-extension';
import type { AnyFn } from 'ember/-private/type-utils';

export interface Message {
  applicationId: string;
  applicationName: string;
  frameId?: any;
  from: string;
  name?: string;
  tabId?: number;
  type: string;
  unloading?: boolean;
  value: string;
  version?: string;
}

export default class PortService extends Service {
  @service declare adapter: WebExtension;
  @service declare router: RouterService;

  applicationId?: string;
  applicationName?: string;
  detectedApplications: { [key: string]: string };

  constructor() {
    super(...arguments);

    /*
     * A dictionary of the form:
     * { applicationId: applicationName }
     */
    this.detectedApplications = {};
    this.applicationId = undefined;
    this.applicationName = undefined;

    this.adapter.onMessageReceived(
      (message: Message & { apps: Array<Message> }) => {
        if (message.type === 'apps-loaded') {
          message.apps.forEach(
            ({ applicationId, applicationName }: Message) => {
              set(this.detectedApplications, applicationId, applicationName);
            },
          );

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
          if (!hasListeners(this, message.type)) {
            throw new Error('unknown message type ' + message.type);
          }
          this.trigger(message.type, message, applicationId);
        }
      },
    );

    addListener(this, 'view:inspectJSValue', this, ({ name }) =>
      this.adapter.inspectJSValue(name),
    );
  }

  selectApplication(applicationId: string) {
    if (
      applicationId in this.detectedApplications &&
      applicationId !== this.applicationId
    ) {
      let applicationName = this.detectedApplications[applicationId] as string;
      const currentApplication = this.applicationId;
      this.setProperties({ applicationId, applicationName });
      if (currentApplication) {
        // this is only required when switching apps
        this.router.transitionTo('app-detected');
      }
      this.send('app-selected', { applicationId, applicationName });
    }
  }

  @action
  send(type: string, message?: Partial<Message>) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.applicationId as string;
    message.applicationName = this.applicationName as string;
    this.adapter.sendMessage(message);
  }

  // Manually implement Evented functionality, so we can move away from the mixin

  @action
  on(eventName: string, target: unknown, method: AnyFn) {
    addListener(this, eventName, target, method);
  }

  @action
  one(eventName: string, target: unknown, method: AnyFn) {
    addListener(this, eventName, target, method, true);
  }

  @action
  off(eventName: string, target: unknown, method: AnyFn) {
    try {
      removeListener(this, eventName, target, method);
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName: string, ...args: Array<any>) {
    sendEvent(this, eventName, ...args);
  }
}
