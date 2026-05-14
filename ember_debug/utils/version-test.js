/* eslint-disable ember/no-test-import-export */

/**
 * @method compare
 * @param {Number} val
 * @param {Number} number
 * @return {Number}
 *  0: same
 * -1: <
 *  1: >
 */
function compare(val, number) {
  if (val === number) {
    return 0;
  } else if (val < number) {
    return -1;
  } else if (val > number) {
    return 1;
  }
}

/**
 * Remove -alpha, -beta, etc from versions
 *
 * @param {String} version
 * @return {String} The cleaned up version
 */
function cleanupVersion(version) {
  return version.replace(/-.*/g, '');
}

/**
 * Compares two Ember versions.
 *
 * Returns:
 * `-1` if version1 < version
 * 0 if version1 == version2
 * 1 if version1 > version2
 *
 * @param {String} version1
 * @param {String} version2
 * @return {Boolean} result of the comparison
 */
function compareVersion(version1, version2) {
  let compared, i;
  version1 = cleanupVersion(version1).split('.');
  version2 = cleanupVersion(version2).split('.');
  for (i = 0; i < 3; i++) {
    compared = compare(+version1[i], +version2[i]);
    if (compared !== 0) {
      return compared;
    }
  }
  return 0;
}

/**
 * Checks if a version is between two different versions.
 * version should be >= left side, < right side
 *
 * @param {String} version1
 * @param {String} version2
 * @return {Boolean}
 */
export default function versionTest(version, between) {
  var fromVersion = between[0];
  var toVersion = between[1];

  if (compareVersion(version, fromVersion) === -1) {
    return false;
  }
  return !toVersion || compareVersion(version, toVersion) === -1;
}
