import { cacheFor, guidFor as emberGuidFor } from '../../ember.js';

// it can happen that different ember apps/iframes have the same id for different objects
// since the implementation is just a counter, so we add a prefix per iframe & app
let perIframePrefix = Math.random().toString() + '-';
let prefix = '';
let guidFor = (obj, pref) =>
  emberGuidFor(obj, perIframePrefix + (pref || prefix) + '-');

export function setGuidPrefix(pref) {
  prefix = pref;
}

export { cacheFor, guidFor };
