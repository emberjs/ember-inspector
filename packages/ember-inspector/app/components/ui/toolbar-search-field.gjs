import { action } from '@ember/object';
import Component from '@glimmer/component';
import { Input } from '@ember/component';
import { on } from '@ember/modifier';
import svgJar from 'ember-svg-jar/helpers/svg-jar';

let uuid = 0;

export default class ToolbarSearchFieldComponent extends Component {
  <template>
    <div class="toolbar-search relative mx-1" ...attributes>
      <Input
        id={{this.inputId}}
        @type="text"
        @value={{@value}}
        placeholder="Search"
        class="box-border m-0 rounded pt-0 pr-4 pb-0 pl-1 text-base leading-none outline-none bg-base00"
      />

      {{#if @value}}
        <button
          class="toolbar-icon-button toolbar-search-clear-button absolute right-0 w-auto h-auto"
          title="clear"
          data-test-search-field-clear-button
          {{on "click" this.clear}}
          type="button"
        >
          {{svgJar "clear" width="14px" height="14px"}}
        </button>
      {{/if}}
    </div>
  </template>
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
