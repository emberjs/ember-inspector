import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';
import { compatBuild } from '@embroider/compat';

export default async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, {
    // Add options here
  });

  return compatBuild(app, buildOnce, {
    /**
     * The inspector must not load a split route,
     * because its CSS would change the page.
     */
    splitAtRoutes: ['lazy'],
  });
}
