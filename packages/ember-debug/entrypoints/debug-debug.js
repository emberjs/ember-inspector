import hasEmber from './utils/has-ember.js';

console.log('debug-debug');

await hasEmber();

console.log('hasEmber resolved');

// These dynamic imports are intentionally after the above await hasEmber() call.
// We cannot move these to a regular import because we want to wait for Ember to
// be available on page before we can initialise the module tree.
const startInspector = await import('../lib/start-inspector.js');
const adapter = await import('../adapters/debug.js');

startInspector.default(adapter.default);
