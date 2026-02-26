/**
 * Ember Object Names
 * 
 * This module previously maintained a map of Ember class/mixin references to their names.
 * With the new API, Ember provides name resolution directly via naming.getClassName().
 * 
 * This module now exports a compatibility wrapper that uses the new API.
 */

import { getClassName } from './ember.js';

/**
 * Compatibility wrapper that mimics the old Map interface
 * but delegates to the new naming API.
 */
const emberNames = {
  get(classOrMixin) {
    return getClassName(classOrMixin);
  },
  
  // These methods are no longer needed but kept for compatibility
  set() {
    // No-op: Ember manages its own class names now
  },
  
  has(classOrMixin) {
    return getClassName(classOrMixin) !== null;
  },
};

export default emberNames;