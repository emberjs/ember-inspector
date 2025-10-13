import loadEmberDebugInWebpage from '../lib/load-ember-debug-in-webpage';

loadEmberDebugInWebpage(async () => {
  const { onEmberReady, startInspector } = await import(
    '../lib/start-inspector'
  );

  const adapter = (await import('../adapters/basic')).default;
  onEmberReady(startInspector(adapter));
});
