/* eslint-disable ember/new-module-imports */
/**
 * Get all the Ember.Application instances from Ember.Namespace.NAMESPACES
 * and add our own applicationId and applicationName to them
 * @return {*}
 */
export default function getApplications(Ember) {
  var namespaces = Ember.A(Ember.Namespace.NAMESPACES);

  var apps = namespaces.filter(function (namespace) {
    return namespace instanceof Ember.Application;
  });

  return apps.map(function (app) {
    // Add applicationId and applicationName to the app
    var applicationId = Ember.guidFor(app);
    var applicationName =
      app.name || app.modulePrefix || `(unknown app - ${applicationId})`;

    Object.assign(app, {
      applicationId,
      applicationName,
    });

    return app;
  });
}
