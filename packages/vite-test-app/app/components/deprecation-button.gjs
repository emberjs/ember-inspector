import { deprecate } from '@ember/debug';
import { on } from '@ember/modifier';

/**
 * Gives the end-to-end tests a deprecation to find
 * in the Deprecations tab of the inspector.
 */
function logDeprecation() {
  deprecate('The test app logged a deprecation.', false, {
    id: 'test-app.e2e-deprecation',
    for: 'test-app',
    since: { available: '1.0.0', enabled: '1.0.0' },
    until: '99.0.0',
  });
}

<template>
  <button type="button" {{on "click" logDeprecation}}>Log a deprecation</button>
</template>
