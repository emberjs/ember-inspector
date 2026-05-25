import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from "./config/environment";

import setupInspector from "@embroider/legacy-inspector-support/ember-source-4.12";
import compatModules from "@embroider/virtual/compat-modules";

const version = '{{EMBER_INSPECTOR_VERSION}}';
// this is a hack to get showdown to be descovered during dependency optimisation
// this could be fixed properly by converting the app to GJS or by fixing it upstream
// by either convering ember-cli-showdown to gjs or making it v2 (or both)
import showdown from 'showdown';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
  inspector = setupInspector(this);
}

config.VERSION = version;

loadInitializers(App, config.modulePrefix, compatModules);
