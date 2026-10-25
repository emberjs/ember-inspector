import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

/**
 * A deprecation throws in development and test builds,
 * so the tests catch it before it ships.
 */
setupDeprecationWorkflow({
  throwOnUnhandled: true,
  workflow: [],
});
