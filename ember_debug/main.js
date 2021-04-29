import BasicAdapter from 'ember-debug/adapters/basic';
import Port from 'ember-debug/port';
import ObjectInspector from 'ember-debug/object-inspector';
import GeneralDebug from 'ember-debug/general-debug';
import RenderDebug from 'ember-debug/render-debug';
import ViewDebug from 'ember-debug/view-debug';
import RouteDebug from 'ember-debug/route-debug';
import DataDebug from 'ember-debug/data-debug';
import PromiseDebug from 'ember-debug/promise-debug';
import ContainerDebug from 'ember-debug/container-debug';
import DeprecationDebug from 'ember-debug/deprecation-debug';
import Session from 'ember-debug/services/session';
import Ember from './utils/ember';

const {
  Object: EmberObject,
  run,
  Application,
  Namespace,
  guidFor,
  computed,
} = Ember;

const EmberDebug = EmberObject.extend({
  /**
   * Set to true during testing.
   *
   * @type {Boolean}
   * @default false
   */
  isTesting: false,

  /**
   * @private
   * @property _application
   * @type {Application}
   */
  _application: null,

  owner: null,
  started: false,

  applicationName: computed
    .or('_application.name', '_application.modulePrefix')
    .readOnly(),

  /**
   * We use the application's id instead of the owner's id so that we use the same inspector
   * instance for the same application even if it was reset (owner changes on reset).
   *
   * @property applicationId
   * @type {String}
   */
  applicationId: computed('_application', 'isTesting', 'owner', function () {
    if (!this.isTesting) {
      return guidFor(this._application);
    }
    return guidFor(this.owner);
  }),

  // Using object shorthand syntax here is somehow having strange side effects.
  // eslint-disable-next-line object-shorthand
  Port: Port,
  Adapter: BasicAdapter,

  start($keepAdapter) {
    if (this.started) {
      this.reset($keepAdapter);
      return;
    }
    if (!this._application && !this.isTesting) {
      this.set('_application', getApplication());
    }
    this.set('started', true);

    this.reset();

    this.adapter.debug('Ember Inspector Active');
    this.adapter.sendMessage({
      type: 'inspectorLoaded',
    });
  },

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
      let handler = this.get(prop);
      if (handler) {
        run(handler, 'destroy');
        this.set(prop, null);
      }
    });
  },

  startModule(prop, Module) {
    this.set(prop, Module.create({ namespace: this }));
  },

  willDestroy() {
    this.destroyContainer();
    this._super(...arguments);
  },

  reset($keepAdapter) {
    if (!this.isTesting && !this.owner) {
      this.set('owner', getOwner(this._application));
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
  },

  inspect(obj) {
    this.objectInspector.sendObject(obj);
    this.adapter.log('Sent to the Object Inspector');
    return obj;
  },

  clear() {
    this.setProperties({
      _application: null,
      owner: null,
    });
  },
}).create();

function getApplication() {
  let namespaces = Namespace.NAMESPACES;
  let application;

  namespaces.forEach((namespace) => {
    if (namespace instanceof Application) {
      application = namespace;
      return false;
    }
  });
  return application;
}

function getOwner(application) {
  if (application.autoboot) {
    return application.__deprecatedInstance__;
  } else if (application._applicationInstances /* Ember 3.1+ */) {
    return application._applicationInstances[0];
  }
}

export default EmberDebug;
