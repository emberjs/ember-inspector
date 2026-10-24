import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

const selectText = modifier((element) => element.select());

/**
 * A text field that starts with its text selected.
 *
 * - `@onInput`: called with each new value
 * - `@onEnter`, `@onEscape`: called on keyup of those keys
 * - `@onFocusOut`
 */
export default class PropertyField extends Component {
  <template>
    <input
      type="text"
      value={{@value}}
      {{selectText}}
      {{on "input" this.input}}
      {{on "keyup" this.keyUp}}
      {{on "focusout" @onFocusOut}}
      ...attributes
    />
  </template>

  input = (event) => {
    this.args.onInput(event.target.value);
  };

  keyUp = (event) => {
    if (event.key === 'Enter') {
      this.args.onEnter();
    } else if (event.key === 'Escape') {
      this.args.onEscape();
    }
  };
}
