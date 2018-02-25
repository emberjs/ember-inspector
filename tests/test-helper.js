import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
const { generateGuid } = Ember;

setApplication(Application.create(config.APP));
window.NO_EMBER_DEBUG = true;
start();

Application.instanceInitializer({
  name: `${generateGuid()}-detectEmberApplication`,
  initialize(instance) {
    instance.lookup('route:app-detected').reopen({
      model() { }
    });
  }
});
