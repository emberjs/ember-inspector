import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | basic', function(hooks) {
  setupRenderingTest(hooks);

  test('generally works', async function(assert) {
    await render(hbs`Hello world!`);

    assert.equal(this.element.textContent.trim(), 'Hello world!');
  });
});
