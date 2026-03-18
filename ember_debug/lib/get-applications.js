import { emberInspectorAPI } from '../utils/ember-inspector-api';

/**
 * Get all the Ember.Application instances via the inspector API
 * and add our own applicationId and applicationName to them
 * @return {*}
 */
export default function getApplications() {
  var apps = emberInspectorAPI.owner.getApplications();

  return apps.map(function (app) {
    // Add applicationId and applicationName to the app
    var applicationId = emberInspectorAPI.objectInternals.guidFor(app);
    var applicationName =
      app.name || app.modulePrefix || `(unknown app - ${applicationId})`;

    Object.assign(app, {
      applicationId,
      applicationName,
    });

    return app;
  });
}
