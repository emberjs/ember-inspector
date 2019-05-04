const Ember = window.Ember;
const { ComputedProperty, get } = Ember;

/**
 * Check if given key on the passed object is a computed property
 * @param object
 * @param key
 * @return {boolean|*}
 */
export function isComputed(object, key) {
  // Ember > 3.10
  if (Ember.Debug.isComputed) {
    // TODO: This is a hack, we should not need to check the function name, this should be flagged as computed by `isComputed`.
    return Ember.Debug.isComputed(object, key) || (object[key] && get(object[key], 'name') === 'COMPUTED_DECORATOR');
  }

  // Ember < 3.10
  return object[key] instanceof ComputedProperty;
}

export function isDescriptor(value) {
  // Ember >= 1.11
  return value && typeof value === 'object' && value.isDescriptor;
}
