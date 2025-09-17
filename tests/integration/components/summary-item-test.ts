import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-inspector/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | summary-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<SummaryItem />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <SummaryItem>
        template block text
      </SummaryItem>
    `);

    assert.dom().hasText('template block text');
  });
});
