import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';


import Port from "./port";
import PromiseAssembler from "ember-inspector/libs/promise-assembler";
import msToTime from "ember-inspector/helpers/ms-to-time";

Ember.MODEL_FACTORY_INJECTIONS = true;

var version = '1.6.2';

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});


config.VERSION = version;

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
    container.injection('route:deprecations', 'adapter', 'adapter:main');
    container.injection('controller:deprecations', 'adapter', 'adapter:main');

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


loadInitializers(App, config.modulePrefix);


export default App;
