import BasicAdapter from "adapters/basic";
import Port from "port";
import ObjectInspector from "object_inspector";
import GeneralDebug from "general_debug";
import ViewDebug from "view_debug";
import RouteDebug from "route_debug";
import DataDebug from "data_debug";

console.debug("Ember Debugger Active");

var EmberDebug;

EmberDebug = Ember.Namespace.create({

  application: null,
  started: false,

  Port: Port,
  Adapter: BasicAdapter,

  start: function() {
    if (this.get('started')) {
      this.reset();
      return;
    }
    this.set('started', true);

    this.set('application', getApplication());

    this.reset();

  },

  destroyContainer: function() {
    var self = this;
    ['dataDebug', 'viewDebug', 'routeDebug', 'objectInspector', 'generalDebug'].forEach(function(prop) {
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

  reset: function() {
    this.destroyContainer();
    Ember.run(this, function() {

      this.startModule('adapter', this.Adapter);
      this.startModule('port', this.Port);

      this.startModule('generalDebug', GeneralDebug);
      this.startModule('objectInspector', ObjectInspector);
      this.startModule('routeDebug', RouteDebug);
      this.startModule('viewDebug', ViewDebug);
      this.startModule('dataDebug', DataDebug);

      this.generalDebug.sendBooted();
      this.viewDebug.sendTree();

    });
  }

});

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

Ember.Debug = EmberDebug;

export default EmberDebug;
