import { inject } from '@ember/service';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';

// Ember 7 removed `inject`. Ember before 4.1 has no `service`.
export const service = macroCondition(
  dependencySatisfies('ember-source', '>= 4.1.0'),
)
  ? importSync('@ember/service').service
  : inject;
