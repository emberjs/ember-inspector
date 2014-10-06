import BasicAdapter from "adapters/basic";
import Port from "port";
import ObjectInspector from "object_inspector";
import GeneralDebug from "general_debug";
import RenderDebug from "render_debug";
import ViewDebug from "view_debug";
import RouteDebug from "route_debug";
import DataDebug from "data_debug";
import PromiseDebug from "promise_debug";

var EmberDebug;

EmberDebug = Ember.Namespace.extend({

  application: null,
  started: false,

  Port: Port,
  Adapter: BasicAdapter,


  // These two are used to make RSVP start instrumentation
  // even before this object is created
  // all events triggered before creation are injected
  // to this object as `existingEvents`
  existingEvents: Ember.computed(function() { return []; }).property(),
  existingCallbacks: Ember.computed(function() { return {}; }).property(),

  start: function() {
    if (this.get('started')) {
      this.reset();
      return;
    }
    this.set('started', true);

    this.set('application', getApplication());

    this.reset();

    this.get("adapter").debug("Ember Inspector Active");
  },

  destroyContainer: function() {
    var self = this;
    ['dataDebug',
    'viewDebug',
    'routeDebug',
    'objectInspector',
    'generalDebug',
    'renderDebug',
    'promiseDebug'
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

  reset: function() {
    this.destroyContainer();
    Ember.run(this, function() {

      this.startModule('adapter', this.Adapter);
      this.startModule('port', this.Port);

      this.startModule('generalDebug', GeneralDebug);
      this.startModule('renderDebug', RenderDebug);
      this.startModule('objectInspector', ObjectInspector);
      this.startModule('routeDebug', RouteDebug);
      this.startModule('viewDebug', ViewDebug);
      this.startModule('dataDebug', DataDebug);
      this.startModule('promiseDebug', PromiseDebug);

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
