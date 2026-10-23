import { module, test } from 'qunit';
import setupEmberDebugTest from '../helpers/setup-ember-debug-test';

import EmberDebugImport from 'ember-debug/main';
let EmberDebug;

module('Ember Debug - General', function (hooks) {
  hooks.before(async function () {
    EmberDebug = (await EmberDebugImport).default();
  });

  setupEmberDebugTest(hooks);

  test('App config comes from the config meta tag', function (assert) {
    let config = EmberDebug.generalDebug.getAppConfig();

    assert.strictEqual(config.modulePrefix, 'ember-debug-tests');
  });

  test('Without a config meta tag, app config comes from the resolver', function (assert) {
    let meta = document.querySelector('meta[name$="/config/environment"]');
    let name = meta.getAttribute('name');
    meta.setAttribute('name', 'hidden-by-test');

    this.owner.unregister('config:environment');
    this.owner.register(
      'config:environment',
      { modulePrefix: 'vite-app', onBoot() {} },
      { instantiate: false },
    );

    try {
      let config = EmberDebug.generalDebug.getAppConfig();

      assert.deepEqual(
        config,
        { modulePrefix: 'vite-app' },
        'functions are dropped, so the port can send the config',
      );
    } finally {
      meta.setAttribute('name', name);
    }
  });
});
