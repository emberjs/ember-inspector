import { action } from '@ember/object';
import Component from '@glimmer/component';

let uuid = 0;

export default class ToolbarSearchFieldComponent extends Component {
  constructor() {
    super(...arguments);
    this.inputId = `toolbar-search-field-input-${uuid++}`;
  }

  @action
  clear() {
    document.querySelector('#' + this.inputId).focus();
    this.args.clear?.();
  }
}
