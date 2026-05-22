import config from 'ember-inspector/config/environment';
import { macroCondition, isTesting, isDevelopingApp } from '@embroider/macros';

// {{EMBER_DIST}} is replaced by the build process (basic, chrome, etc)
const ADAPTER = `{{EMBER_DIST}}`;
let isDev = false;

if (macroCondition(isTesting())) {
  isDev = true;
}

if (macroCondition(isDevelopingApp())) {
  isDev = true;
}

export default {
  name: 'setup',
  initialize(instance) {
    let Adapter = instance.resolveRegistration(
      // `service:adapters/${isDev ? 'debug' : ADAPTER}`,
      `service:adapters/bookmarklet`
    );

    // register the adapter service
    register(instance, 'service:adapter', Adapter);

    // register the config service
    register(instance, 'service:config', config, { instantiate: false });
  },
};

function register(instance, name, item, options) {
  if (!instance.resolveRegistration(name)) {
    instance.register(name, item, options);
  }
}
