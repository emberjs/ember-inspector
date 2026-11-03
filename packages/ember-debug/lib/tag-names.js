import { GlimmerValidator, InternalsMetal } from './ember.js';
import getObjectName from './get-object-name.js';

const tagMetaFor = GlimmerValidator?.tagMetaFor;
const tagForProperty = InternalsMetal?.tagForProperty;

/**
 * Give dependency tags the same names in every list of the inspector.
 *
 *   own property of the inspected object  → this.count
 *   named arg of the inspected object     → @title
 *   property of another object            → ParentName.title
 *
 * The tag meta and the args proxy name tags in every build type.
 * The `_propertyKey` annotations of the patched `tagFor` are the fallback,
 * because recent ember-source builds never call the patched export.
 *
 * @param {Object} self The inspected object.
 * @param {Object} [other] Another object whose properties can be dependencies,
 *   for example the instance that passes the args of a render node.
 * @return {Function} Takes a tag, returns `{ group, key }` or null.
 */
export function createTagNamer(self, other) {
  const names = new Map();

  addTagMeta(names, self, 'this');
  if (other && other !== self) {
    addTagMeta(names, other, getObjectName(other));
  }
  addArgs(names, self?.args);

  return function nameForTag(tag) {
    const name = names.get(tag);
    if (name) {
      return name;
    }
    if (!tag._propertyKey) {
      return null;
    }
    let group = '';
    if (tag._object === self) {
      group = 'this';
    } else if (tag._object) {
      group = getObjectName(tag._object);
    }
    return { group, key: tag._propertyKey };
  };
}

/**
 * @param {{ group: string, key: string }} name
 * @return {string} The name as the inspector shows it.
 */
export function labelForTagName({ group, key }) {
  if (group === '@') {
    return `@${key}`;
  }
  return group ? `${group}.${key}` : key;
}

function addTagMeta(names, object, group) {
  if (!tagMetaFor || !object || typeof object !== 'object') {
    return;
  }
  try {
    tagMetaFor(object).forEach((tag, key) => {
      if (typeof key === 'string') {
        names.set(tag, { group, key });
      }
    });
  } catch {
    /** The object has no tag meta. */
  }
}

function addArgs(names, args) {
  if (!tagForProperty || !args || typeof args !== 'object') {
    return;
  }
  try {
    Object.keys(args).forEach((key) => {
      names.set(tagForProperty(args, key), { group: '@', key });
    });
  } catch {
    /** The args proxy does not give tags for its keys. */
  }
}
