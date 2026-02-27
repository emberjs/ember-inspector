import BasicAdapter from './adapters/basic';
import Port from './port';
import ObjectInspector from './object-inspector';
import GeneralDebug from './general-debug';
import RenderDebug from './render-debug';
import ViewDebug from './view-debug';
import RouteDebug from './route-debug';
import DataDebug from './data-debug';
import PromiseDebug from './promise-debug';
import ContainerDebug from './container-debug';
import DeprecationDebug from './deprecation-debug';
import Session from './services/session';

import { Application, Namespace } from './utils/ember';
import { guidFor, setGuidPrefix } from './utils/ember/object/internals';
import { run } from './utils/ember/runloop';
import BaseObject from './utils/base-object';
import { emberInspectorAPI } from './utils/ember-inspector-api.js';

class EmberDebug extends BaseObject {
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
      this._application = emberInspectorAPI.owner.getApplication({
        Application,
        Namespace,
      });
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
      this.owner = emberInspectorAPI.owner.getOwnerFromApplication(
        this._application,
      );
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

export default new EmberDebug();
