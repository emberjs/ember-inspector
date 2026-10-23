import Component from '@glimmer/component';
import flatpickr from 'flatpickr';
import { modifier } from 'ember-modifier';

/**
 * A date field that opens a flatpickr calendar when it renders.
 *
 * - `@date`, `@dateFormat`, `@allowInput`: read once, on render
 * - `@onChange`: called with the selected dates
 * - `@onClose`
 */
export default class DatePropertyField extends Component {
  <template>
    <input
      type="text"
      class="ember-flatpickr-input"
      {{this.datePicker}}
      ...attributes
    />
  </template>

  constructor(owner, args) {
    super(owner, args);

    this.options = {
      allowInput: args.allowInput,
      dateFormat: args.dateFormat,
      defaultDate: args.date,
    };
  }

  datePicker = modifier((element) => {
    let picker = flatpickr(element, {
      ...this.options,
      onChange: (dates) => this.args.onChange(dates),
      onClose: () => this.args.onClose(),
    });

    picker.open();

    return () => picker.destroy();
  });
}
