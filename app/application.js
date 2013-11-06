import Router from "router";
import Resolver from "resolver";
import Port from "port";
import PromiseModel from "models/promise";

var App = Ember.Application.extend({
  modulePrefix: '',
  Resolver: Resolver,
  Router: Router,
  adapter: 'basic'
});

// Inject adapter
App.initializer({
  name: "extension-init",

  initialize: function(container, app) {
    // register and inject adapter
    var Adapter;
    if (Ember.typeOf(app.adapter) === 'string') {
      Adapter = container.resolve('adapter:' + app.adapter);
    } else {
      Adapter = app.adapter;
    }
    container.register('adapter:main', Adapter);
    container.typeInjection('port', 'adapter', 'adapter:main');

    // inject port
    container.register('port:main', app.Port || Port);
    container.typeInjection('controller', 'port', 'port:main');
    container.typeInjection('route', 'port', 'port:main');
  }
});

export default App;
