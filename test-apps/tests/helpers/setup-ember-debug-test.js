/* eslint-disable ember/no-runloop */
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import EmberRouter from '@ember/routing/router';
import {
  getApplication,
  setApplication,
  setupApplicationContext,
  setupContext,
  teardownContext,
} from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { setupInspectorSupport } from '@ember/inspector-support';
import config from 'test-app/config/environment';
import { hbs } from 'ember-cli-htmlbars';

import EmberDebugImport from 'ember-debug/main';
import PortImport from 'ember-debug/port';

let Port;
let EmberDebug;

export default function setupEmberDebugTest(hooks, options = {}) {
  let app, originalApp, originalPort, originalIgnoreDeprecations;

  hooks.beforeEach(async function () {
    Port = (await PortImport).default;
    EmberDebug = (await EmberDebugImport).default;
    originalPort = EmberDebug.Port;
    originalApp = getApplication();
    originalIgnoreDeprecations = EmberDebug.IGNORE_DEPRECATIONS;

    app = Application.create({
      ...config.APP,
      modulePrefix: config.modulePrefix,
      Resolver,
    });
    setApplication(app);
    setupInspectorSupport();

    await setupContext(this);
    await setupApplicationContext(this);

    // eslint-disable-next-line ember/no-classic-classes
    const Router = EmberRouter.extend({
      location: 'none',
    });

    if (options.routes) {
      Router.map(options.routes);
    } else {
      Router.map(function () {
        this.route('simple');
      });

      this.owner.register('template:simple', hbs`Simple template`);
    }

    this.owner.register('router:main', Router);

    run(() => {
      EmberDebug.isTesting = true;
      EmberDebug.owner = this.owner;
    });

    EmberDebug.Port =
      options.Port ||
      class extends Port {
        init() {}
        send() {}
      };

    run(EmberDebug, 'start');
  });

  hooks.afterEach(async function () {
    EmberDebug.destroyContainer();
    EmberDebug.clear();

    await teardownContext(this);

    EmberDebug.IGNORE_DEPRECATIONS = originalIgnoreDeprecations;

    run(() => {
      EmberDebug.isTesting = false;
    });

    EmberDebug.Port = originalPort;

    setApplication(originalApp);

    run(app, 'destroy');

    globalThis.emberInspectorApps = [];
  });
}
