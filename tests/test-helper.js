import Application from 'ember-inspector/app';
import config from 'ember-inspector/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import TestAdapter from './test-adapter';

Application.initializer({
  name: `00-override-adapter`,
  initialize(app) {
    app.register('adapter:main', TestAdapter);
  }
});

Application.instanceInitializer({
  name: '00-force-memory-storage-backend',
  initialize(instance) {
    let memory = instance.lookup('service:storage/memory');
    let storage = instance.lookup('service:storage');
    storage.backend = memory;
  }
});

setApplication(Application.create(config.APP));
window.NO_EMBER_DEBUG = true;
start();
