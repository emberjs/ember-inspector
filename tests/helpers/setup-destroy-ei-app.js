import Application from '@ember/application';
import EmberRouter from '@ember/routing/router';
import {
  setApplication,
  setupApplicationContext,
  setupContext,
  teardownContext,
  teardownApplicationContext
} from '@ember/test-helpers';
import { assert } from '@ember/debug';
import { run } from '@ember/runloop';


export async function setupEIApp(EmberDebug, routes) {
  assert('setupEIApp requires `EmberDebug` to be passed.', EmberDebug !== undefined);

  const Router = EmberRouter.extend({
    location: 'none'
  });

  if (routes) {
    Router.map(routes);
  }

  let App = Application.create({ autoboot: false });
  App.register('router:main', Router);

  await setApplication(App);
  await setupContext(this);
  await setupApplicationContext(this);

  run(() => {
    EmberDebug.set('isTesting', true);
    EmberDebug.set('owner', this.owner);
  });

  run(EmberDebug, 'start');

  return App;
}

export async function destroyEIApp(EmberDebug, App) {
  assert('destroyEIApp requires `EmberDebug` and `App` to be passed.',
    EmberDebug !== undefined && App !== undefined);
  EmberDebug.destroyContainer();
  await teardownApplicationContext(this);
  await teardownContext(this);
  return run(App, 'destroy');
}
