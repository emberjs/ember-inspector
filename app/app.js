import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';


import Port from "./port";
import PromiseAssembler from "ember-inspector/libs/promise-assembler";
import msToTime from "ember-inspector/helpers/ms-to-time";

Ember.MODEL_FACTORY_INJECTIONS = true;

const version = '{{EMBER_INSPECTOR_VERSION}}';

const App = Ember.Application.extend({
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

  initialize(container, app) {
    // {{EMBER_DIST}} is replaced by the build process.
    app.adapter = '{{EMBER_DIST}}';

    // register and inject adapter
    let Adapter;
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

/**
 * This is here a "temporary" workaround for Container reset that Ember v1.10 provided "out of the box"
 *
 * Problem: Ember v1.11.0 introduced ApplicationInstance concept and with this Application.reset()
 * method changed. In v1.10.0 reset() always created new Container() and thus everything in Container was reset.
 * Since v1.11.0 it no longer does that but Inspector depends on that behavior, because inspector is
 * able to instrument multiple applications, typically embedded Ember apps in iframes.
 *
 * See "controllers/iframes.js" for app.reset() call.
 *
 * Without this here, this is no longer possible and Inspector crashes, because
 * it cannot re-register required injections, like adapter:main when new application is selected for inspection.
 * Also it does not help us to protect initializers in the app with registry.has('my:thing')
 * because we cannot protect against third party initializers.
 *
 * Therefore current solution is to reopen App and call buildRegistry() on reset().
 *
 * // TODO: Improve support for multiple app instrumentation, in a way that app.reset() call is not required
 */

App.reopen({
  reset() {
    this.buildRegistry();
    this._super(...arguments);
  }
});

export default App;
