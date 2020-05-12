import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupTestAdapter } from '../../test-adapter';
import hbs from 'htmlbars-inline-precompile';
import { render } from 'ember-test-helpers';

module('Integration | Component | component-tree-arg', function(hooks) {
  setupTestAdapter(hooks);
  setupRenderingTest(hooks);

  test('it should correctly render a string argument', async function(assert) {
    await render(hbs`<ComponentTreeArg @value="test" />`);
    assert.dom('[data-test-arg-string]').hasText('test');
  });

  test('it should correctly render an object argument', async function(assert) {
    this.objectArgs = { testKey: 'test' };
    await render(hbs`<ComponentTreeArg @value={{objectArgs}} />`);
    assert.dom('[data-test-arg-object]').hasText('...');
  });

  test('it should correctly if the argument is not a string or an object', async function(assert) {
    this.falseArgs = false;

    await render(hbs`<ComponentTreeArg @value={{falseArgs}} />`);
    assert.dom('[data-test-arg-string]').hasText('false');
  });
});
