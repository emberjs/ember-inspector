import Application from 'ember-inspector/app';
import config from 'ember-inspector/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation, start as qunitStart } from 'ember-qunit';
import { setTesting } from '@embroider/macros';
import TestAdapter from './test-adapter';

/**
 * Replaces the adapter that `initializers/setup.js` registers.
 */
Application.initializer({
  name: 'setup-override-adapter',
  after: 'setup',
  initialize(app) {
    app.register('service:adapter', TestAdapter);
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

export function start() {
  config.locationType = 'none';
  config.APP.rootElement = '#ember-testing';
  config.APP.autoboot = false;

  setTesting(true);
  setApplication(Application.create(config.APP));

  window.NO_EMBER_DEBUG = true;
  QUnit.config.testTimeout = 60000;

  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  qunitStart();
}
