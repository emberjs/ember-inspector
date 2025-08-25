import { Application, Namespace, guidFor } from '../utils/ember';

/**
 * Get all the Ember.Application instances from Ember.Namespace.NAMESPACES
 * and add our own applicationId and applicationName to them
 * @return {*}
 */
export default function getApplications() {
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
