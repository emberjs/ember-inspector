/**
 * Recursively flatten all profiles and their children
 * @param {Profile[]} profiles An array of profiles
 * @param {Array} array The array to hold the flattened profiles
 * @return {*|Array}
 */
export function flatten(profiles, array = []) {
  profiles.forEach(profile => {
    array.push(profile);
    flatten(profile.children, array);
  });
  return array;
}

