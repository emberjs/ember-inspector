import Application from 'ember-inspector/app';
import config from 'ember-inspector/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import TestAdapter from './test-adapter';

// ensure ember-debug is required
import 'ember-debug/main';

Application.initializer({
  name: `00-override-adapter`,
  initialize(app) {
    app.register('adapter:main', TestAdapter);
  },
});

Application.instanceInitializer({
  name: '00-force-memory-storage-backend',
  initialize(instance) {
    let memory = instance.lookup('service:storage/memory');
    let storage = instance.lookup('service:storage');
    storage.backend = memory;
  },
});

setApplication(Application.create(config.APP));
window.NO_EMBER_DEBUG = true;

setup(QUnit.assert);

start();
