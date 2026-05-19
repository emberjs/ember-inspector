import { Application, Namespace, guidFor } from './ember.js';

export function getApplications() {
  return Namespace.NAMESPACES.filter(function (namespace) {
    return namespace instanceof Application;
  });
}

// FIXME: This shouldn't mutate the applications
/**
 * Get all the Ember.Application instances from Ember.Namespace.NAMESPACES
 * and add our own applicationId and applicationName to them
 * @return {*}
 */
export function getApplicationWithDescriptors() {
  return getApplications().map(function (app) {
    // Add applicationId and applicationName to the app
    const id = guidFor(app);
    const name = app.name || app.modulePrefix || `(unknown app - ${id})`;

    Object.assign(app, {
      applicationId: id,
      applicationName: name,
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
