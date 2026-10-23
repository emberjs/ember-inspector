import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  blur,
  fillIn,
  find,
  render,
  triggerKeyEvent,
} from '@ember/test-helpers';
import PropertyField from 'ember-inspector/components/object-inspector/property-field';

module(
  'Integration | Component | object-inspector/property-field',
  function (hooks) {
    setupRenderingTest(hooks);

    function noop() {}

    test('it starts with the value selected', async function (assert) {
      await render(
        <template>
          <PropertyField
            @value="Alex"
            @onInput={{noop}}
            @onEnter={{noop}}
            @onEscape={{noop}}
            @onFocusOut={{noop}}
            data-test-field
          />
        </template>,
      );

      let field = find('[data-test-field]');

      assert.strictEqual(field.value, 'Alex');
      assert.strictEqual(field.selectionStart, 0);
      assert.strictEqual(field.selectionEnd, 'Alex'.length);
    });

    test('it reports input, Enter, Escape, and focus out', async function (assert) {
      const onInput = (value) => assert.step(`input ${value}`);
      const onEnter = () => assert.step('enter');
      const onEscape = () => assert.step('escape');
      const onFocusOut = () => assert.step('focus out');

      await render(
        <template>
          <PropertyField
            @value="Alex"
            @onInput={{onInput}}
            @onEnter={{onEnter}}
            @onEscape={{onEscape}}
            @onFocusOut={{onFocusOut}}
            data-test-field
          />
        </template>,
      );

      await fillIn('[data-test-field]', 'Joey');
      await triggerKeyEvent('[data-test-field]', 'keyup', 'Enter');
      await triggerKeyEvent('[data-test-field]', 'keyup', 'Escape');
      await triggerKeyEvent('[data-test-field]', 'keyup', 'A');
      await blur('[data-test-field]');

      assert.verifySteps(['input Joey', 'enter', 'escape', 'focus out']);
    });
  },
);
