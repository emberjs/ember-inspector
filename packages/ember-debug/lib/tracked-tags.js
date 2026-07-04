/**
 * Recursively collect the tags a (combined) tag depends on, keeping only
 * the ones that carry debug info (`_propertyKey`/`_object`, added by the
 * `tagFor` patch in object-inspector.js) so they can be given a
 * human-readable name.
 *
 * @param {Tag} tag The tag to walk.
 * @param {Tag} ownTag A tag to exclude from the result (usually the tag of
 *   the property being inspected itself).
 * @param {number} level Current recursion depth.
 * @return {Tag[]} The dependency tags.
 */
/**
 * Recursively collect all the tags a (combined) tag depends on, named or
 * not. Callers can resolve names for the anonymous ones through other
 * sources (e.g. the validator's tag meta).
 *
 * @param {Tag} tag The tag to walk.
 * @param {Tag} ownTag A tag to exclude from the result.
 * @param {number} level Current recursion depth.
 * @return {Tag[]} The dependency tags.
 */
export function getTagSubtags(tag, ownTag, level = 0) {
  const tags = [];
  if (!tag || level > 1) {
    return tags;
  }
  const subtags = tag.subtags || (Array.isArray(tag.subtag) ? tag.subtag : []);
  if (tag.subtag && !Array.isArray(tag.subtag)) {
    if (tag.subtag !== ownTag) tags.push(tag.subtag);

    tags.push(...getTagSubtags(tag.subtag, ownTag, level + 1));
  }
  if (subtags) {
    subtags.forEach((t) => {
      if (t === ownTag) return;
      tags.push(t);
      tags.push(...getTagSubtags(t, ownTag, level + 1));
    });
  }
  return tags;
}

export function getTagTrackedTags(tag, ownTag, level = 0) {
  const props = [];
  // do not include tracked properties from dependencies
  if (!tag || level > 1) {
    return props;
  }
  const subtags = tag.subtags || (Array.isArray(tag.subtag) ? tag.subtag : []);
  if (tag.subtag && !Array.isArray(tag.subtag)) {
    if (tag.subtag._propertyKey) props.push(tag.subtag);

    props.push(...getTagTrackedTags(tag.subtag, ownTag, level + 1));
  }
  if (subtags) {
    subtags.forEach((t) => {
      if (t === ownTag) return;
      if (t._propertyKey) props.push(t);
      props.push(...getTagTrackedTags(t, ownTag, level + 1));
    });
  }
  return props;
}
