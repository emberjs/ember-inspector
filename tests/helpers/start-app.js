/* eslint no-unused-vars: 0 */

import Ember from 'ember';
import Application from '../../app';
import config from '../../config/environment';
import triggerPort from './trigger-port';
const { generateGuid } = Ember;

export default function startApp(attrs) {
  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Application.instanceInitializer({
    name: `${generateGuid()}-detectEmberApplication`,
    initialize(instance) {
      instance.lookup('route:app-detected').reopen({
        model() {
          return this;
        }
      });
    }
  });

  return Ember.run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}
