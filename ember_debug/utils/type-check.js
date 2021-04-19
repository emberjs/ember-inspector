const Ember = requireModule('ember')['default'] || window.Ember;
const { ComputedProperty } = Ember;

/**
 * Check if given key on the passed object is a computed property
 * @param object
 * @param key
 * @return {boolean|*}
 */
export function isComputed(object, key) {
  // Ember > 3.10
  if (Ember.Debug.isComputed && Ember.Debug.isComputed(object, key)) {
    return true;
  }

  if (Ember.meta(object) && Ember.meta(object).peekDescriptors(key)) {
    return !!Ember.meta(object).peekDescriptors(key)._getter;
  }

  if (getDescriptorFor(object, key) instanceof ComputedProperty) {
    return true;
  }

  // Ember < 3.10
  return object[key] instanceof ComputedProperty;
}

export function isDescriptor(value) {
  // Ember >= 1.11
  return value && typeof value === 'object' && value.isDescriptor;
}

/**
 * This allows us to pass in a COMPUTED_DECORATOR function and get the descriptor for it.
 * It should be implemented Ember side eventually.
 * @param {EmberObject} object The object we are inspecting
 * @param {String} key The key for the property on the object
 */
export function getDescriptorFor(object, key) {
  if (isDescriptor(object[key])) {
    return object[key];
  }

  if (Ember.Debug.isComputed) {
    const {
      descriptorForDecorator,
      descriptorForProperty,
    } = Ember.__loader.require('@ember/-internals/metal');
    return (
      descriptorForDecorator(object[key]) || descriptorForProperty(object, key)
    );
  }

  return object[key];
}

export function typeOf(obj) {
  return Object.prototype.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase();
}
