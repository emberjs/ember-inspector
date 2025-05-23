import Backburner from 'backburner.js';

let currentRunLoop = null;
export function _getCurrentRunLoop() {
  return currentRunLoop;
}
export const _backburner = new Backburner(['actions', 'afterRender'], {
  defaultQueue: 'actions',
});
export function run(...args) {
  return _backburner.run(...args);
}
export function join(methodOrTarget, methodOrArg, ...additionalArgs) {
  return _backburner.join(methodOrTarget, methodOrArg, ...additionalArgs);
}
export function bind(...curried) {
  return (...args) => join(...curried.concat(args));
}

export function begin() {
  _backburner.begin();
}
export function end() {
  _backburner.end();
}
export function schedule(...args) {
  // @ts-expect-error TS doesn't like the rest args here
  return _backburner.schedule(...args);
}
// Used by global test teardown
export function _hasScheduledTimers() {
  return _backburner.hasTimers();
}
// Used by global test teardown
export function _cancelTimers() {
  _backburner.cancelTimers();
}
export function later(...args) {
  return _backburner.later(...args);
}
export function once(...args) {
  // @ts-expect-error TS doesn't like the rest args here
  return _backburner.scheduleOnce('actions', ...args);
}
export function scheduleOnce(...args) {
  // @ts-expect-error TS doesn't like the rest args here
  return _backburner.scheduleOnce(...args);
}
export function next(...args) {
  return _backburner.later(...args, 1);
}
export function cancel(timer) {
  return _backburner.cancel(timer);
}
export function debounce(...args) {
  // @ts-expect-error TS doesn't like the rest args here
  return _backburner.debounce(...args);
}
export function throttle(...args) {
  // @ts-expect-error TS doesn't like the rest args here
  return _backburner.throttle(...args);
}
