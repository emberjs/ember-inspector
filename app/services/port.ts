import { action, set } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
// @ts-expect-error TODO: maybe move away from this one day, but for now import from secret location
import { hasListeners } from '@ember/-internals/metal';
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
  shouldHighlightRender?: boolean;
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

  on(eventName: string, method: AnyFn): void;
  on(eventName: string, target: unknown, method: AnyFn): void;

  @action
  on(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn): void {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn);
    } else {
      addListener(this, eventName, targetOrMethod, method!);
    }
  }

  one(eventName: string, method: AnyFn): void;
  one(eventName: string, target: unknown, method: AnyFn): void;

  @action
  one(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn, true);
    } else {
      addListener(this, eventName, targetOrMethod, method!, true);
    }
  }

  off(eventName: string, method: AnyFn): void;
  off(eventName: string, target: unknown, method: AnyFn): void;

  @action
  off(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod as AnyFn);
      } else {
        removeListener(this, eventName, targetOrMethod, method!);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName: string, ...args: Array<any>) {
    sendEvent(this, eventName, args);
  }
}
