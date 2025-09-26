import { guidFor } from '../utils/ember';

export default function setupInstanceInitializer(app, callback) {
  if (!app.__inspector__setup) {
    app.__inspector__setup = true;

    // We include the app's guid in the initializer name because in Ember versions < 3
    // registering an instance initializer with the same name, even if on a different app,
    // triggers an error because instance initializers seem to be global instead of per app.
    app.instanceInitializer({
      name: 'ember-inspector-app-instance-booted-' + guidFor(app),
      initialize: function (instance) {
        callback(instance);
      },
    });
  }
}
