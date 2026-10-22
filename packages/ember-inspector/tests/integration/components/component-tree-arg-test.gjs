import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupTestAdapter } from '../../test-adapter';
import { render } from '@ember/test-helpers';
import ComponentTreeArg from 'ember-inspector/components/component-tree-arg';

module('Integration | Component | component-tree-arg', function (hooks) {
  setupTestAdapter(hooks);
  setupRenderingTest(hooks);

  test('it should correctly render a string argument', async function (assert) {
    await render(<template><ComponentTreeArg @value="test" /></template>);
    assert.dom('[data-test-arg-string]').hasText('test');
  });

  test('it should correctly render an object argument', async function (assert) {
    const self = this;

    this.objectArgs = { testKey: 'test' };
    await render(
      <template><ComponentTreeArg @value={{self.objectArgs}} /></template>,
    );
    assert.dom('[data-test-arg-object]').hasText('...');
  });

  test('it should correctly if the argument is not a string or an object', async function (assert) {
    const self = this;

    this.falseArgs = false;

    await render(
      <template><ComponentTreeArg @value={{self.falseArgs}} /></template>,
    );
    assert.dom('[data-test-arg-string]').hasText('false');
  });
});
