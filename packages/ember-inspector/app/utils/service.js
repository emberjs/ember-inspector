import { inject } from '@ember/service';
import require from 'require';

// Ember 7 removed `inject`. Ember before 4.1 has no `service`.
// A namespace import of `@ember/service` does not build before Ember 3.27.
const serviceModule = require.has('@ember/service')
  ? require('@ember/service')
  : {};

export const service = serviceModule.service ?? inject;
