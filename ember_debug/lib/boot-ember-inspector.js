export default function bootEmberInspector(appInstance) {
  appInstance.application.__inspector__booted = true;
  appInstance.__inspector__booted = true;

  // Boot the inspector (or re-boot if already booted, for example in tests)
  window.EmberInspector._application = appInstance.application;
  window.EmberInspector.owner = appInstance;
  window.EmberInspector.start(true);
}
