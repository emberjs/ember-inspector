import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'ember-debug-tests/config/environment';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';

// Ember 7 apps must give ember-debug the Ember modules.
const setupInspector = macroCondition(
  dependencySatisfies('ember-source', '>= 7.0.0'),
)
  ? importSync('@embroider/legacy-inspector-support/ember-source-4.12').default
  : () => {};

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix);
