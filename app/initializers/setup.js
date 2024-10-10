import config from 'ember-inspector/config/environment';

export default {
  name: 'setup',
  initialize(instance) {
    // {{EMBER_DIST}} is replaced by the build process (basic, chrome, etc)
    let Adapter = instance.resolveRegistration(
      `service:adapters/{{EMBER_DIST}}`,
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
