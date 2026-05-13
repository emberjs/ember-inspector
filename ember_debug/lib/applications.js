import { Application, Namespace, guidFor } from './ember.js';

/**
 * Get all the Ember.Application instances from Ember.Namespace.NAMESPACES
 * and add our own applicationId and applicationName to them
 * @return {*}
 */
export function getApplications() {
  var namespaces = Namespace.NAMESPACES;

  var apps = namespaces.filter(function (namespace) {
    return namespace instanceof Application;
  });

  return apps.map(function (app) {
    // Add applicationId and applicationName to the app
    var applicationId = guidFor(app);
    var applicationName =
      app.name || app.modulePrefix || `(unknown app - ${applicationId})`;

    Object.assign(app, {
      applicationId,
      applicationName,
    });

    return app;
  });
}

export function sendApplications(adapter, apps) {
  const serializedApps = apps.map((app) => {
    return {
      applicationName: app.applicationName,
      applicationId: app.applicationId,
    };
  });

  adapter.sendMessage({
    type: 'apps-loaded',
    apps: serializedApps,
    from: 'inspectedWindow',
  });
}

export function getApplicationInstance(app) {
  if (app._applicationInstances) {
    return [...app._applicationInstances][0];
  } else if (app.__deprecatedInstance__) {
    return app.__deprecatedInstance__;
  }

  return undefined;
}
