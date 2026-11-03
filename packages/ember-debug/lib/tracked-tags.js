/**
 * Collect the tags that a tag depends on, named or not.
 *
 * The result includes the tag itself.
 * A getter that read a single value has that value's tag,
 * not a combinator, so the subtags alone miss it.
 *
 * The walk stops two levels down,
 * so tracked properties of dependencies do not show.
 *
 * @param {Tag} tag The tag to walk.
 * @param {Tag} ownTag A tag to leave out (the tag of the inspected property).
 * @return {Tag[]} The dependency tags.
 */
export function getDependencyTags(tag, ownTag) {
  const tags = [];
  if (tag && tag !== ownTag) {
    tags.push(tag);
  }
  collectSubtags(tags, tag, ownTag, 0);
  return tags;
}

function collectSubtags(tags, tag, ownTag, level) {
  if (!tag || level > 1) {
    return;
  }
  if (tag.subtag && !Array.isArray(tag.subtag)) {
    if (tag.subtag !== ownTag) {
      tags.push(tag.subtag);
    }
    collectSubtags(tags, tag.subtag, ownTag, level + 1);
  }
  const subtags = tag.subtags || (Array.isArray(tag.subtag) ? tag.subtag : []);
  for (let i = 0; i < subtags.length; i++) {
    const t = subtags[i];
    if (t === ownTag) {
      continue;
    }
    tags.push(t);
    collectSubtags(tags, t, ownTag, level + 1);
  }
}
