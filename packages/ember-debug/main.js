import BasicAdapter from './adapters/basic.js';
import Port from './port.js';
import ObjectInspector from './object-inspector.js';
import GeneralDebug from './general-debug.js';
import RenderDebug from './render-debug.js';
import ViewDebug from './view-debug.js';
import RouteDebug from './route-debug.js';
import DataDebug from './data-debug.js';
import PromiseDebug from './promise-debug.js';
import ContainerDebug from './container-debug.js';
import DeprecationDebug from './deprecation-debug.js';
import TimeTravelDebug from './time-travel-debug.js';
import Session from './services/session.js';

import { getApplications, getApplicationInstance } from './lib/applications.js';
import { guidFor, setGuidPrefix } from './lib/ember/object/internals.js';
import { run } from './lib/ember/runloop.js';
import BaseObject from './utils/base-object.js';

export class EmberDebug extends BaseObject {
  /**
   * Set to true during testing.
   *
   * @type {Boolean}
   * @default false
   */
  isTesting = false;

  get applicationName() {
    return this._application.name || this._application.modulePrefix;
  }

  /**
   * We use the application's id instead of the owner's id so that we use the same inspector
   * instance for the same application even if it was reset (owner changes on reset).
   *
   * @property applicationId
   * @type {String}
   */
  get applicationId() {
    if (!this.isTesting) {
      return guidFor(this._application, 'ember');
    }
    return guidFor(this.owner, 'ember');
  }

  // Using object shorthand syntax here is somehow having strange side effects.

  Port = Port;
  Adapter = BasicAdapter;

  start($keepAdapter) {
    if (this.started) {
      this.reset($keepAdapter);
      return;
    }
    if (!this._application && !this.isTesting) {
      this._application = getApplications()[0];
    }
    this.started = true;

    this.reset();

    this.adapter.debug('Ember Inspector Active');
    this.adapter.sendMessage({
      type: 'inspectorLoaded',
    });
  }

  destroyContainer() {
    if (this.generalDebug) {
      this.generalDebug.sendReset();
    }
    [
      'dataDebug',
      'viewDebug',
      'routeDebug',
      'generalDebug',
      'renderDebug',
      'promiseDebug',
      'containerDebug',
      'deprecationDebug',
      'timeTravelDebug',
      'objectInspector',
      'session',
    ].forEach((prop) => {
      let handler = this[prop];
      if (handler) {
        run(handler, 'destroy');
        this[prop] = null;
      }
    });
  }

  startModule(prop, Module) {
    this[prop] = new Module({ namespace: this });
  }

  willDestroy() {
    this.destroyContainer();
    super.willDestroy();
  }

  reset($keepAdapter) {
    setGuidPrefix(Math.random().toString());

    if (!this.isTesting && !this.owner) {
      this.owner = getApplicationInstance(this._application);
    }

    this.destroyContainer();

    run(() => {
      // Adapters don't have state depending on the application itself.
      // They also maintain connections with the inspector which we will
      // lose if we destroy.
      if (!this.adapter || !$keepAdapter) {
        this.startModule('adapter', this.Adapter);
      }

      if (!this.port || !$keepAdapter) {
        this.startModule('port', this.Port);
      }

      this.startModule('session', Session);
      this.startModule('generalDebug', GeneralDebug);
      this.startModule('renderDebug', RenderDebug);
      this.startModule('objectInspector', ObjectInspector);
      this.startModule('routeDebug', RouteDebug);
      this.startModule('viewDebug', ViewDebug);
      this.startModule('dataDebug', DataDebug);
      this.startModule('promiseDebug', PromiseDebug);
      this.startModule('containerDebug', ContainerDebug);
      this.startModule('deprecationDebug', DeprecationDebug);
      this.startModule('timeTravelDebug', TimeTravelDebug);

      this.generalDebug.sendBooted();
    });
  }

  inspect(obj) {
    this.objectInspector.sendObject(obj);
    this.adapter.log('Sent to the Object Inspector');
    return obj;
  }

  clear() {
    Object.assign(this, {
      _application: null,
      owner: null,
    });
  }
}

let emberDebug;

export default () => {
  emberDebug ??= new EmberDebug();

  return emberDebug;
};
