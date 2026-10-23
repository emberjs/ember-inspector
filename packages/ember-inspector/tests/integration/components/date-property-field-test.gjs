import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  clearRender,
  fillIn,
  find,
  render,
  triggerKeyEvent,
} from '@ember/test-helpers';
import DatePropertyField from 'ember-inspector/components/date-property-field';

module('Integration | Component | date-property-field', function (hooks) {
  setupRenderingTest(hooks);

  test('it opens a calendar with the date', async function (assert) {
    const date = new Date(2015, 0, 1);
    const noop = () => {};

    await render(
      <template>
        <DatePropertyField
          @date={{date}}
          @dateFormat="Y-m-d"
          @onChange={{noop}}
          @onClose={{noop}}
          data-test-field
        />
      </template>,
    );

    assert.strictEqual(find('[data-test-field]').value, '2015-01-01');
    assert
      .dom('.flatpickr-calendar.open', document.body)
      .exists('the calendar is open');
    assert
      .dom('.flatpickr-day.selected', document.body)
      .hasText('1', 'the date is selected');

    await clearRender();

    assert
      .dom('.flatpickr-calendar', document.body)
      .doesNotExist('the calendar is removed with the field');
  });

  test('it reports a typed date', async function (assert) {
    const date = new Date(2015, 0, 1);
    const onChange = ([selected]) =>
      assert.step(
        `change ${selected.getFullYear()}-${selected.getMonth() + 1}`,
      );
    const onClose = () => assert.step('close');

    await render(
      <template>
        <DatePropertyField
          @allowInput={{true}}
          @date={{date}}
          @dateFormat="Y-m-d"
          @onChange={{onChange}}
          @onClose={{onClose}}
          data-test-field
        />
      </template>,
    );

    await fillIn('[data-test-field]', '2016-02-03');
    await triggerKeyEvent('[data-test-field]', 'keydown', 'Enter');

    assert.verifySteps(['change 2016-2', 'close']);
  });
});
