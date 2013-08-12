import Port from "port";
import ObjectInspector from "object_inspector";
import ViewDebug from "view_debug";
import RouteDebug from "route_debug";
import DataDebug from "data_debug";

console.debug("Ember Debugger Active");

var EmberDebug;

EmberDebug = Ember.Namespace.create({

  application: null,
  started: false,

  Port: Port,

  start: function() {
    if (this.get('started')) {
      this.reset();
      return;
    }
    this.set('started', true);

    this.set('application', getApplication());

    this.reset();

  },

  setDebugHandler: function(prop, Handler) {
    var handler = this.get(prop);
    if (handler) {
      Ember.run(handler, 'destroy');
    }
    this.set(prop, Handler.create({ namespace: this }));
  },

  reset: function() {
    this.set('port', this.Port.create());

    this.setDebugHandler('objectInspector', ObjectInspector);
    this.setDebugHandler('routeDebug', RouteDebug);
    this.setDebugHandler('viewDebug', ViewDebug);
    this.setDebugHandler('dataDebug', DataDebug);

    this.viewDebug.sendTree();
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
