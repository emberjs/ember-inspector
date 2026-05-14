import loadEmberDebugInWebpage from '../lib/load-ember-debug-in-webpage.js';

loadEmberDebugInWebpage(async () => {
  const { onEmberReady, startInspector } = await import(
    '../lib/start-inspector.js'
  );

  const adapter = (await import('../adapters/websocket.js')).default;
  onEmberReady(startInspector(adapter));
});
