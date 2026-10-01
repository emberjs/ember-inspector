import '@warp-drive/ember/install';
import Application from 'classic-test-app/app';
import config from 'classic-test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';

setApplication(Application.create(config.APP));

QUnit.config.testTimeout = 60000;

setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();
start();
