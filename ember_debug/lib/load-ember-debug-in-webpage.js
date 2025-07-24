export default function loadEmberDebugInWebpage(callback) {
  const waitForEmberLoad = new Promise((resolve) => {
    if (window.requireModule) {
      const has =
        window.requireModule.has ||
        function has(id) {
          return !!(
            window.requireModule.entries[id] ||
            window.requireModule.entries[id + '/index']
          );
        };
      if (has('ember')) {
        return resolve();
      }
    }

    /**
     * NOTE: if the above (for some reason) fails and the consuming app has
     *       deprecation-workflow's throwOnUnhandled: true
     *         or set \`ember-global\`'s handler to 'throw'
     *       and is using at least \`ember-source@3.27\`
     *
     *       this will throw an exception in the consuming project
     */
    if (window.Ember) return resolve();

    window.addEventListener('Ember', resolve, { once: true });
  });
  waitForEmberLoad.then(callback);
}
