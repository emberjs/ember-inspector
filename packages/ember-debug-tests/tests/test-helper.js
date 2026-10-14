import Application from 'ember-debug-tests/app';
import config from 'ember-debug-tests/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));

QUnit.config.testTimeout = 60000;

setup(QUnit.assert);

// ember-qunit 9 does not load the tests in `start`.
loadTests();
start({ loadTests: false });
