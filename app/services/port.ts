import { action, set, setProperties } from '@ember/object';
import { addListener, removeListener, sendEvent } from '@ember/object/events';
import { hasListeners } from '@ember/-internals/metal';
import Service, { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type WebExtension from './adapters/web-extension';
import type { AnyFn } from '@ember/-internals/utility-types';

export interface ModelType {
  count: number;
  name: string;
  objectId: string;
}

export interface RecordType {
  color: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnValues: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterValues: any;
  objectId: string;
  searchIndex: number;
}

/**
 * This interface is a catch-all of a bunch of things we
 * pass around via messages.
 */
export interface Message {
  applicationId: string;
  applicationName: string;
  count: number;
  filters: Array<unknown>;
  frameId?: string;
  from: string;
  index: number;
  instrumentWithStack?: boolean;
  modelTypes: Array<ModelType>;
  name?: string;
  objectId?: string;
  promiseId?: string;
  records: Array<RecordType>;
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
    // eslint-disable-next-line prefer-rest-params
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
      },
    );

    addListener(
      this,
      'view:inspectJSValue',
      this,
      ({ name }: { name: string }) => this.adapter.inspectJSValue(name),
    );
  }

  selectApplication(applicationId: string) {
    if (
      applicationId in this.detectedApplications &&
      applicationId !== this.applicationId
    ) {
      const applicationName = this.detectedApplications[
        applicationId
      ] as string;
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
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  on(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn): void {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn);
    } else {
      addListener(this, eventName, targetOrMethod as object, method);
    }
  }

  one(eventName: string, method: AnyFn): void;
  one(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  one(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    if (typeof targetOrMethod === 'function') {
      // If we did not pass a target, default to `this`
      addListener(this, eventName, this, targetOrMethod as AnyFn, true);
    } else {
      addListener(this, eventName, targetOrMethod as object, method, true);
    }
  }

  off(eventName: string, method: AnyFn): void;
  off(eventName: string, target: unknown, method: AnyFn): void;

  @action
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  off(eventName: string, targetOrMethod: unknown | AnyFn, method?: AnyFn) {
    try {
      if (typeof targetOrMethod === 'function') {
        // If we did not pass a target, default to `this`
        removeListener(this, eventName, this, targetOrMethod as AnyFn);
      } else {
        removeListener(this, eventName, targetOrMethod as object, method);
      }
    } catch (e) {
      console.error(e);
    }
  }

  @action
  trigger(eventName: string, ...args: Array<unknown>) {
    sendEvent(this, eventName, args);
  }
}
