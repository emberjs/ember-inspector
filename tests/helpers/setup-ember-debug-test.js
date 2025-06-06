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
import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import BasicAdapter from 'ember-inspector/services/adapters/basic';
import config from 'ember-inspector/config/environment';
import EmberDebug from 'ember-debug/main';
import { hbs } from 'ember-cli-htmlbars';
import Port from 'ember-debug/port';

export default function setupEmberDebugTest(hooks, options = {}) {
  let app, originalApp, originalPort, originalIgnoreDeprecations;

  hooks.beforeEach(async function () {
    originalPort = EmberDebug.Port;
    originalApp = getApplication();
    originalIgnoreDeprecations = EmberDebug.IGNORE_DEPRECATIONS;

    app = Application.create({
      ...config.APP,
      modulePrefix: config.modulePrefix,
      Resolver,
    });
    setApplication(app);

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
    this.owner.register('service:adapter', BasicAdapter);
    /**
     * preferably, ember debug tests should use their own test app
     * but currently its mangled with the inspector ui app, which is not compatible with all ember versions being tested.
     * we do filter the tests to only run the ember_debug tests, but that does not prevent the app merging.
     * The application route/controller/template of inspector ui was being indirectly used in ember_debug tests,
     * which is not required and broke older lts tests
     */
    this.owner.register('route:application', class extends Route {});
    this.owner.register('controller:application', class extends Controller {});
    this.owner.register('template:application', hbs('{{outlet}}'));

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
  });
}
