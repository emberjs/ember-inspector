import Resolver from "resolver";
import Port from "port";
import PromiseAssembler from "libs/promise_assembler";

var App = Ember.Application.extend({
  modulePrefix: '',
  Resolver: Resolver,
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
    container.typeInjection('promise-assembler', 'port', 'port:main');

    // register and inject promise assembler
    container.register('promise-assembler:main', PromiseAssembler);
    container.injection('route:promiseTree', 'assembler', 'promise-assembler:main');
  }
});

export default App;
