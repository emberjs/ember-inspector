import once from './once.js';

export function onReady(callback) {
  const completed = () => {
    document.removeEventListener('DOMContentLoaded', completed, false);
    window.removeEventListener('load', completed, false);
    callback();
  };

  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setTimeout(completed, 0);
  } else {
    document.addEventListener('DOMContentLoaded', completed, false);
    // For some reason DOMContentLoaded doesn't always work
    window.addEventListener('load', completed, false);
  }
}

export function onEmberReady(callback) {
  const callbackOnce = once(callback);

  // Newest Ember versions >= 1.10
  window.addEventListener('Ember', () => setTimeout(callbackOnce, 0), {
    once: true,
  });

  // Oldest Ember versions or if this was injected after Ember has loaded.
  onReady(callbackOnce);
}
