import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const version = '{{EMBER_INSPECTOR_VERSION}}';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

config.VERSION = version;

loadInitializers(App, config.modulePrefix);
