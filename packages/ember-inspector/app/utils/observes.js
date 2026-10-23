import { addObserver } from '@ember/object/observers';

/**
 * Decorates a method of an EmberObject class to run when one of `keys` changes.
 *
 *   @observes('label', 'parent')
 *   updateParentLabel() {}
 */
export function observes(...keys) {
  return function (target, name, descriptor) {
    for (let key of keys) {
      // eslint-disable-next-line ember/no-observers
      addObserver(target, key, null, name);
    }

    return descriptor;
  };
}
