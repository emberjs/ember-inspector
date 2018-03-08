import { typeOf } from '@ember/utils';
import config from 'ember-inspector/config/environment';
import Port from "ember-inspector/port";
import PromiseAssembler from "ember-inspector/libs/promise-assembler";

export default {
  name: 'setup',
  initialize(instance) {
    // {{EMBER_DIST}} is replaced by the build process.
    instance.adapter = '{{EMBER_DIST}}';

    // register and inject adapter
    let Adapter;
    if (typeOf(instance.adapter) === 'string') {
      Adapter = instance.resolveRegistration(`adapter:${instance.adapter}`);
    } else {
      Adapter = instance.adapter;
    }
    register(instance, 'adapter:main', Adapter);
    instance.inject('port', 'adapter', 'adapter:main');
    instance.inject('route:application', 'adapter', 'adapter:main');
    instance.inject('route:deprecations', 'adapter', 'adapter:main');
    instance.inject('controller:deprecations', 'adapter', 'adapter:main');

    // register config
    register(instance, 'config:main', config, { instantiate: false });
    instance.inject('route', 'config', 'config:main');

    // inject port
    register(instance, 'port:main', instance.Port || Port);
    instance.inject('controller', 'port', 'port:main');
    instance.inject('route', 'port', 'port:main');
    instance.inject('component', 'port', 'port:main');
    instance.inject('promise-assembler', 'port', 'port:main');

    // register and inject promise assembler
    register(instance, 'promise-assembler:main', PromiseAssembler);
    instance.inject('route:promiseTree', 'assembler', 'promise-assembler:main');
  }
};

function register(instance, name, item, options) {
  if (!instance.resolveRegistration(name)) {
    instance.register(name, item, options);
  }
}
