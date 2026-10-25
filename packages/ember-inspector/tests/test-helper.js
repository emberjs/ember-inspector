import Application from 'ember-inspector/app';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { setTesting } from '@embroider/macros';
import TestAdapter from './test-adapter';

/**
 * we need to override the adapter that is set up in initializers/setup.js
 * for that we suffix the name of setup initializer with `-2` so that
 * this initializer comes right after it
 */
Application.initializer({
  name: `setup-2-override-adapter`,
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
  /**
   * The router reads `isTesting()` when the app creates it.
   */
  setTesting(true);

  setApplication(
    Application.create({ rootElement: '#ember-testing', autoboot: false }),
  );

  window.NO_EMBER_DEBUG = true;
  QUnit.config.testTimeout = 60000;

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  qunitStart();
}
