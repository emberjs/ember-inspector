export let Ember;

try {
  Ember = requireModule('ember/barrel').default;
} catch {
  // pass through
}

try {
  Ember ??= requireModule('ember').default;
} catch {
  Ember = globalThis.Ember;
}

const wrappedRequire = function (id) {
  try {
    return Ember.__loader.require(id);
  } catch {
    return requireModule(id);
  }
};

export function emberSafeRequire(id) {
  try {
    return wrappedRequire(id);
  } catch {
    return undefined;
  }
}
