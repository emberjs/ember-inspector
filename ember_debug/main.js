import BasicAdapter from "ember-debug/adapters/basic";
import Port from "ember-debug/port";
import ObjectInspector from "ember-debug/object-inspector";
import GeneralDebug from "ember-debug/general-debug";
import RenderDebug from "ember-debug/render-debug";
import ViewDebug from "ember-debug/view-debug";
import RouteDebug from "ember-debug/route-debug";
import DataDebug from "ember-debug/data-debug";
import PromiseDebug from "ember-debug/promise-debug";
import ContainerDebug from "ember-debug/container-debug";
import DeprecationDebug from "ember-debug/deprecation-debug";

var EmberDebug;
var Ember = window.Ember;
EmberDebug = Ember.Object.extend({

  application: null,
  started: false,

  Port: Port,
  Adapter: BasicAdapter,

  start: function($keepAdapter) {
    if (this.get('started')) {
      this.reset($keepAdapter);
      return;
    }
    this.set('started', true);

    if (!this.get('application')) {
      this.set('application', getApplication());
    }

    this.reset();

    this.get("adapter").debug("Ember Inspector Active");
  },

  destroyContainer: function() {
    if (this.get('generalDebug')) {
      this.get('generalDebug').sendReset();
    }
    var self = this;
    ['dataDebug',
    'viewDebug',
    'routeDebug',
    'objectInspector',
    'generalDebug',
    'renderDebug',
    'promiseDebug',
    'containerDebug',
    'deprecationDebug',
    ].forEach(function(prop) {
      var handler = self.get(prop);
      if (handler) {
        Ember.run(handler, 'destroy');
        self.set(prop, null);
      }
    });
  },

  startModule: function(prop, Module) {
    this.set(prop, Module.create({ namespace: this }));
  },

  willDestroy: function() {
    this.destroyContainer();
    this._super.apply(this, arguments);
  },

  reset: function($keepAdapter) {
    this.destroyContainer();
    Ember.run(this, function() {
      // Adapters don't have state depending on the application itself.
      // They also maintain connections with the inspector which we will
      // lose if we destroy.
      if (!this.get('adapter') || !$keepAdapter) {
        this.startModule('adapter', this.Adapter);
      }
      if (!this.get('port') || !$keepAdapter) {
        this.startModule('port', this.Port);
      }

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
      this.viewDebug.sendTree();
    });
  },

  inspect: function(obj) {
    this.get('objectInspector').sendObject(obj);
    this.get('adapter').log('Sent to the Object Inspector');
    return obj;
  }

}).create();

function getApplication() {
  var namespaces = Ember.Namespace.NAMESPACES,
      application;

  namespaces.forEach(function(namespace) {
    if(namespace instanceof Ember.Application) {
      application = namespace;
      return false;
    }
  });
  return application;
}

export default EmberDebug;
