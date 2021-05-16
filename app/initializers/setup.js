import config from 'ember-inspector/config/environment';
import PromiseAssembler from 'ember-inspector/libs/promise-assembler';

export default {
  name: 'setup',
  initialize(instance) {
    // {{EMBER_DIST}} is replaced by the build process (basic, chrome, etc)
    let Adapter = instance.resolveRegistration(`adapter:{{EMBER_DIST}}`);

    // register and inject adapter
    register(instance, 'adapter:main', Adapter);
    instance.inject('controller:deprecations', 'adapter', 'adapter:main');
    instance.inject('route:application', 'adapter', 'adapter:main');
    instance.inject('route:deprecations', 'adapter', 'adapter:main');
    instance.inject('service:port', 'adapter', 'adapter:main');

    // register config
    register(instance, 'config:main', config, { instantiate: false });
    instance.inject('route', 'config', 'config:main');

    // inject port
    instance.inject('promise-assembler', 'port', 'service:port');

    // register and inject promise assembler
    register(instance, 'promise-assembler:main', PromiseAssembler);
    instance.inject('route:promiseTree', 'assembler', 'promise-assembler:main');
  },
};

function register(instance, name, item, options) {
  if (!instance.resolveRegistration(name)) {
    instance.register(name, item, options);
  }
}
