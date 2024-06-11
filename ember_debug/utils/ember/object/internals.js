import Ember from '../../ember';

let module;

try {
  module = requireModule('@ember/object/internals');
} catch {
  module = Ember.object;
}

let { cacheFor, guidFor: emberGuidFor } = module;

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
