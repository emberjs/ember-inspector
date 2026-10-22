import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ObjectInspector extends Component {
  @service port;

  @tracked propDisplayType = 'grouped';
  @tracked customFilter = '';

  constructor() {
    super(...arguments);
    this.searchInputId = 'custom-filter-input';
  }

  get isClass() {
    return this.current.mixins.length > 1;
  }

  get current() {
    return this.args.model[this.args.model.length - 1];
  }
  get trail() {
    let nested = this.args.model.slice(1);
    if (nested.length === 0) {
      return '';
    }
    return `.${nested.map((item) => item.property).join('.')}`;
  }

  get isNested() {
    return this.args.model.length > 1;
  }

  @action setPropDisplay(type) {
    // The custom filter is only working for the "all" table yet
    // Otherwise, we reset the customFilter input value
    if (type !== 'all') {
      this.customFilter = '';
    }

    this.propDisplayType = type;
  }

  @action setCustomFilter(event) {
    let { value } = event.target;

    this.propDisplayType = 'all';
    this.customFilter = value;
  }

  @action clearCustomFilter() {
    document.querySelector('#' + this.searchInputId).focus();
    this.customFilter = '';
  }

  @action sendObjectToConsole(obj) {
    let objectId = obj.objectId;
    this.port.send('objectInspector:sendToConsole', {
      objectId,
    });
  }

  @action gotoSource(obj) {
    let objectId = obj.objectId;
    this.port.send('objectInspector:gotoSource', {
      objectId,
    });
  }

  @action popStack() {
    if (this.isNested) {
      this.args.popMixinDetails();
    }
  }

  @action traceErrors(objectId) {
    this.port.send('objectInspector:traceErrors', {
      objectId,
    });
  }
}

{{#if @model.length}}
  <div class="split-panel-hd">
    <div class="toolbar">
      <button
        data-test-object-inspector-back
        class="toolbar-icon-button {{if this.isNested "enabled" "disabled"}}"
        type="button"
        {{on "click" this.popStack}}
      >
        {{svg-jar "arrow-back" width="21px" height="21px"}}
      </button>

      <code class="flex-auto truncate font-bold" data-test-object-name>
        {{get @model "0.name"}}
      </code>

      <button
        data-test-send-object-to-console-btn
        class="send-to-console"
        title="Send to Console"
        type="button"
        {{on
          "click"
          (fn this.sendObjectToConsole this.current)
        }}
      >
        {{svg-jar "send-with-text" width="20px" height="10px"}}
      </button>
      {{#if this.isClass}}
        <button
          data-test-goto-class-source-btn
          class="goto-source"
          title="Goto Source"
          type="button"
          {{on
            "click"
            (fn this.gotoSource this.current)
          }}
        >
          {{svg-jar "code-source" width="20px" height="10px"}}
        </button>
      {{/if}}
    </div>

    {{#if this.trail}}
      <code class="object-trail mb-1 break-all" data-test-object-trail>
        {{this.trail}}
      </code>
    {{/if}}
  </div>

  <div class="split-panel-bd">
    <div class="toolbar object-inspector-toolbar">
      <button
        data-test-object-display-type-grouped
        class="toolbar-radio toolbar-radio-first {{
          if (eq this.propDisplayType "grouped") "active"
        }}"
        type="button"
        {{on "click" (fn this.setPropDisplay "grouped")}}
      >
        Grouped
      </button>
      <button
        data-test-object-display-type-all
        class="toolbar-radio {{if (eq this.propDisplayType "all") "active"}}"
        type="button"
        {{on "click" (fn this.setPropDisplay "all")}}
      >
        All
      </button>

      <Ui::ToolbarDivider />

      <div class="toolbar-search relative mx-1">
        <Input
          id={{this.searchInputId}}
          @type="text"
          @value={{this.customFilter}}
          placeholder="Search"
          class="box-border m-0 rounded pt-0 pr-4 pb-0 pl-1 text-base leading-none outline-none bg-base00"
          {{on "keydown" this.setCustomFilter}}
        />
        {{#if this.customFilter}}
          <button
            class="toolbar-icon-button toolbar-search-clear-button absolute right-0 w-auto h-auto"
            title="clear"
            data-test-object-inspector-custom-search-clear
            type="button"
            {{on "click" this.clearCustomFilter}}
          >
            {{svg-jar "clear" width="14px" height="14px"}}
          </button>
        {{/if}}
      </div>
    </div>

    {{#if @mixinDetails.errors.length}}
      <ObjectInspector::Errors
        @errors={{@mixinDetails.errors}}
        @traceErrors={{fn this.traceErrors @mixinDetails.objectId}}
      />
    {{/if}}

    {{#if (eq this.propDisplayType "all")}}
      <ObjectInspector::PropertiesAll
        @customFilter={{this.customFilter}}
        @model={{@mixinDetails}}
      />
    {{else if (eq this.propDisplayType "grouped")}}
      <ObjectInspector::PropertiesGrouped @model={{@mixinDetails}} />
    {{/if}}
    <Ui::ToolbarDivider />
    <ObjectInspector::ComponentParents @select={{@selectComponent}} @item={{@item}}/>
  </div>
{{else}}
  <div class="split-panel-bd">
    <Ui::EmptyMessage>
      No object selected
    </Ui::EmptyMessage>
  </div>
{{/if}}