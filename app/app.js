import Resolver from "resolver";
import Port from "port";
import PromiseAssembler from "libs/promise_assembler";
import msToTime from "helpers/ms_to_time";

var version = '1.4.0';

var App = Ember.Application.extend({
  modulePrefix: '',
  Resolver: Resolver,
  adapter: 'basic'
});

var config = {
  VERSION: version
};

// Register Helpers
Ember.Handlebars.helper('ms-to-time', msToTime);

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
    container.injection('route:application', 'adapter', 'adapter:main');

    // register config
    container.register('config:main', config, { instantiate: false });
    container.typeInjection('route', 'config', 'config:main');

    // inject port
    container.register('port:main', app.Port || Port);
    container.typeInjection('controller', 'port', 'port:main');
    container.typeInjection('route', 'port', 'port:main');
    container.typeInjection('promise-assembler', 'port', 'port:main');

    // register and inject promise assembler
    container.register('promise-assembler:main', PromiseAssembler);
    container.injection('route:promiseTree', 'assembler', 'promise-assembler:main');
  }
});

export default App;
