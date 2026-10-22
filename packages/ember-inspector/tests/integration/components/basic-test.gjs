import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | basic', function (hooks) {
  setupRenderingTest(hooks);

  test('generally works', async function (assert) {
    await render(<template>Hello world!</template>);

    assert.strictEqual(this.element.textContent.trim(), 'Hello world!');
  });
});
