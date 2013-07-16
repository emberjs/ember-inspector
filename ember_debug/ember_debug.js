import "port" as Port;
import "view_debug" as ViewDebug;
import "object_inspector" as ObjectInspector;
import "route_debug" as RouteDebug;

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

  reset: function() {
    this.set('port', this.Port.create());

    var objectInspector = this.get('objectInspector');
    if (objectInspector) {
      Ember.run(objectInspector, 'destroy');
    }
    this.set('objectInspector', ObjectInspector.create({ namespace: this }));

    var routeDebug = this.get('routeDebug');
    if (routeDebug) {
      Ember.run(routeDebug, 'destroy');
    }
    this.set('routeDebug', RouteDebug.create({ namespace: this }));

    var viewDebug = this.get('viewDebug');
    if (viewDebug) {
      Ember.run(viewDebug, 'destroy');
    }
    this.set('viewDebug', ViewDebug.create({ namespace: this }));

    this.viewDebug.sendTree();
  }

});

function getApplication() {
  var views = Ember.View.views;

  for (var i in views) {
    if (views.hasOwnProperty(i)) {
      return views[i].get('controller.namespace');
    }
  }
}

Ember.Debug = EmberDebug;

export = EmberDebug;
