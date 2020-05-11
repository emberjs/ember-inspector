import Application from '@ember/application';
import EmberRouter from '@ember/routing/router';
import {
  getApplication,
  setApplication,
  setupApplicationContext,
  setupContext,
  teardownContext,
  teardownApplicationContext,
} from '@ember/test-helpers';
import { run } from '@ember/runloop';
import BasicAdapter from '../../adapters/basic';
import config from 'ember-inspector/config/environment';
import EmberDebug from 'ember-debug/main';
import { hbs } from 'ember-cli-htmlbars';
import Port from 'ember-debug/port';

export default function setupEmberDebugTest(hooks, options = {}) {
  let app, originalApp, originalPort;

  hooks.beforeEach(async function() {
    originalPort = EmberDebug.Port;
    originalApp = getApplication();

    app = Application.create(config.APP);
    setApplication(app);

    await setupContext(this);
    await setupApplicationContext(this);

    const Router = EmberRouter.extend({
      location: 'none'
    });

    if (options.routes) {
      Router.map(options.routes);
    } else {
      Router.map(function() {
        this.route('simple');
      });

      this.owner.register('template:simple', hbs`Simple template`);
    }

    this.owner.register('router:main', Router);
    this.owner.register('adapter:main', BasicAdapter);

    run(() => {
      EmberDebug.setProperties({
        isTesting: true,
        owner: this.owner,
      });
    });

    EmberDebug.Port = options.Port || Port.extend({
      init() {},
      send() {},
    });

    run(EmberDebug, 'start');
  });

  hooks.afterEach(async function() {
    await teardownApplicationContext(this);
    await teardownContext(this);

    EmberDebug.destroyContainer();
    EmberDebug.clear();

    run(() => {
      EmberDebug.setProperties({
        isTesting: false
      });
    });

    EmberDebug.Port = originalPort;

    setApplication(originalApp);

    run(app, 'destroy');
  });
}
