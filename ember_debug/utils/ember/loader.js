import Ember from '../ember';

let module;

try {
  module = Ember.__loader;
} catch {
  module = requireModule;
}

export function emberSafeRequire(id) {
  try {
    return module.require(id);
  } catch (e) {
    return undefined;
  }
}

export let EmberLoader = module;
