import Application from 'ember-inspector/app';
import config from 'ember-inspector/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import TestAdapter from './test-adapter';
import setupSinon from 'ember-sinon-qunit';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';

registerWaiter();

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

setApplication(Application.create(config.APP));

setupSinon();

window.NO_EMBER_DEBUG = true;
QUnit.config.testTimeout = 60000;

setup(QUnit.assert);

start();
