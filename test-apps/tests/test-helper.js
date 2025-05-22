import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import TestAdapter from './test-adapter';
import setupSinon from 'ember-sinon-qunit';

// ensure ember-debug is required
import 'ember-debug/main';

Application.initializer({
  name: `00-override-adapter`,
  initialize(app) {
    app.register('service:adapter', TestAdapter);
  },
});

setApplication(Application.create(config.APP));

setupSinon();

window.NO_EMBER_DEBUG = true;
QUnit.config.testTimeout = 60000;

setup(QUnit.assert);

start();
