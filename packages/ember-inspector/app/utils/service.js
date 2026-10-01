import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';

// Ember before 3.27 has no modules at run time, only the `Ember` global.
const serviceModule = macroCondition(
  dependencySatisfies('ember-source', '>= 3.27.0'),
)
  ? importSync('@ember/service')
  : { inject: globalThis.Ember.inject.service };

// Ember 7 removed `inject`. Ember before 4.1 has no `service`.
export const service = serviceModule.service ?? serviceModule.inject;
