/**
 * The build writes one copy of the app for each dist
 * (basic, chrome, firefox, bookmarklet, websocket).
 *
 * It replaces this placeholder with the dist name in each copy.
 */
const EMBER_DIST = '{{EMBER_DIST}}';

export default {
  name: 'setup',
  initialize(instance) {
    let Adapter = instance.resolveRegistration(
      `service:adapters/${EMBER_DIST}`,
    );

    // register the adapter service
    register(instance, 'service:adapter', Adapter);
  },
};

function register(instance, name, item, options) {
  if (!instance.resolveRegistration(name)) {
    instance.register(name, item, options);
  }
}
