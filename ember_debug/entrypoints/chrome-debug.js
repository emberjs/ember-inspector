import loadEmberDebugInWebpage from '../lib/load-ember-debug-in-webpage';

loadEmberDebugInWebpage(async () => {
  const { onEmberReady, startInspector } = await import(
    '../lib/start-inspector'
  );

  const adapter = (await import('../adapters/chrome.js')).default;
  onEmberReady(startInspector(adapter));
});
