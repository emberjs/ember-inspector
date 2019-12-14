import Application from 'ember-inspector/app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

Application.instanceInitializer({
  name: '00-force-memory-storage-backend',
  initialize(instance) {
    let memory = instance.lookup('service:storage/memory');
    let storage = instance.lookup('service:storage');
    storage.backend = memory;
  }
});

Application.instanceInitializer({
  name: '01-detect-ember-application',
  initialize(instance) {
    instance.lookup('route:app-detected').reopen({
      model() { }
    });
  }
});

setApplication(Application.create(config.APP));
window.NO_EMBER_DEBUG = true;
start();
