import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import parseText from 'ember-inspector/utils/parse-text';
import { on } from '@ember/modifier';
import svgJar from 'ember-svg-jar/helpers/svg-jar';
import DatePropertyField from 'ember-inspector/components/date-property-field';
import PropertyField from 'ember-inspector/components/object-inspector/property-field';
import stopPropagation from 'ember-event-helpers/helpers/stop-propagation';
import DependentKeys from 'ember-inspector/components/object-inspector/dependent-keys';

export default class ObjectInspectorProperty extends Component {
  <template>
    <li
      class="{{if
          this.isOverridden
          'mixin-property-state-overridden line-through'
        }}
        mixin-property flex flex-row relative items-center truncate"
      data-test-object-property
    >
      {{! Disclosure Triangle }}
      {{#if this.hasDependentKeys}}
        <button
          class="mixin-cp-toggle
            {{if this.showDependentKeys 'mixin-cp-toggle-expanded'}}"
          {{on "click" this.toggleDeps}}
          type="button"
        >
          {{svgJar
            "disclosure-triangle"
            title="Toggle dependent keys"
            width="9px"
            height="9px"
          }}
        </button>
      {{else}}
        <span class="pad"></span>
      {{/if}}

      {{! Property Icon }}
      <span
        class="mixin-property-icon-container flex-shrink-0"
        role="button"
        title={{if @model.code @model.code this.iconInfo.title}}
        {{on "click" this.toggleDeps}}
      >
        <span
          class="mixin-property-icon mixin-property-icon-{{this.iconInfo.type}}
            inline-block rounded font-mono text-md text-white text-center select-none"
        ></span>
      </span>

      {{#unless this.isOwner}}
        {{! Property Name }}
        <span
          class="mixin-property-name text-base14 truncate"
          data-test-object-property-name
        >
          {{#if this.isService}}
            <span
              title="service"
              class="mixin-property--group"
              data-test-property-name-service
            >
              {{@model.name}}
            </span>
          {{else}}
            {{#if this.hasDependentKeys}}
              <span title="computed" class="mixin-property--group">
                {{@model.name}}
              </span>
            {{else}}
              {{@model.name}}
            {{/if}}
          {{/if}}
        </span>

        <span class="mr-1">: </span>
      {{/unless}}

      {{#if this.isEdit}}
        {{#if this.isDate}}
          <DatePropertyField
            class="mixin-property-value-txt flex-1 text-base14 outline-none text-base bg-base01 js-object-property-value-date"
            @allowInput={{true}}
            @date={{readonly this.dateValue}}
            @dateFormat="Y-m-d"
            @onChange={{this.dateSelected}}
            @onClose={{this.finishedEditing}}
          />
        {{else}}
          <PropertyField
            class="mixin-property-value-txt flex-1 text-base14 text-base bg-base01 outline-none"
            @value={{this.txtValue}}
            @insert-newline={{this.save}}
            @escape-press={{this.finishedEditing}}
            @focus-out={{this.finishedEditing}}
            data-test-object-property-value-txt
          />
        {{/if}}
      {{else}}
        {{#if this.canCalculate}}
          <button
            data-test-calculate
            class="mixin-calc-btn"
            title="compute property"
            type="button"
            {{on "click" (stopPropagation @calculate)}}
          >
            {{svgJar "calculate" width="16px" height="16px"}}
          </button>
        {{/if}}
        {{#if this.isDate}}
          <span
            class="{{@model.value.type}} mixin-property-value truncate"
            role="button"
            {{on "click" this.dateClick}}
            data-test-object-property-value
          >
            {{@model.value.inspect}}
          </span>
        {{else}}
          <span
            class="{{@model.value.type}}
              {{if this.isService 'type-service'}}
              mixin-property-value truncate"
            role="button"
            {{on "click" this.valueClick}}
            data-test-object-property-value
          >
            {{@model.value.inspect}}
          </span>
        {{/if}}
      {{/if}}

      <span
        class="mixin-property-overridden-by absolute right-0 no-underline bg-spec00"
      >
        (Overridden by
        {{@model.overridden}})
      </span>

      <button
        data-test-send-to-console-btn
        class="mixin-send-btn flex-shrink-0 send-to-console"
        title="Send To Console"
        type="button"
        {{on "click" @sendToConsole}}
      >
        {{svgJar "send-with-text" width="20px" height="10px"}}
      </button>
      {{#if this.isFunction}}
        <button
          data-test-goto-source-btn
          class="mixin-send-btn flex-shrink-0 goto-source"
          title="Goto Source"
          type="button"
          {{on "click" @gotoSource}}
        >
          {{svgJar "code-source" width="20px" height="10px"}}
        </button>
      {{/if}}
    </li>

    {{#if this.showDependentKeys}}
      <DependentKeys @keys={{@model.dependentKeys}} />
    {{/if}}
  </template>
  @tracked dateValue = null;
  @tracked isDepsExpanded = false;
  @tracked isEdit = false;
  // Bound to editing textbox
  @tracked txtValue = null;

  get isCalculated() {
    return this.args.model?.value?.isCalculated;
  }

  get isArray() {
    return this.args.model?.value?.type === 'type-array';
  }

  get isDate() {
    return this.args.model?.value?.type === 'type-date';
  }

  get isEmberObject() {
    return this.args.model?.value?.type === 'type-ember-object';
  }

  get isObject() {
    return this.args.model?.value?.type === 'type-object';
  }

  get isString() {
    return this.args.model?.value?.type === 'type-string';
  }

  get isOwner() {
    return this.args.model?.value?.type === 'type-owner';
  }

  get isService() {
    return this.args.model?.isService;
  }

  get isOverridden() {
    return this.args.model?.overridden;
  }

  get readOnly() {
    return this.args.model?.readOnly;
  }

  get isComputedProperty() {
    return this.args.model?.isComputed;
  }

  get isFunction() {
    return (
      this.args.model?.value?.type === 'type-function' ||
      this.args.model?.value?.type === 'type-asyncfunction'
    );
  }

  get hasDependentKeys() {
    return this.args.model?.dependentKeys?.length && this.isCalculated;
  }

  get showDependentKeys() {
    return this.isDepsExpanded && this.hasDependentKeys;
  }

  get canCalculate() {
    if (this.isOverridden) return false;
    if (
      !this.isComputedProperty &&
      this.args.model?.isGetter &&
      this.args.model?.isExpensive
    ) {
      return true;
    }
    return this.isComputedProperty && !this.isCalculated;
  }

  get iconInfo() {
    if (this.isService) {
      return { type: 'service', title: 'Service' };
    }

    if (this.isFunction) {
      return { type: 'function', title: 'Function' };
    }

    if (this.args.model.isTracked) {
      return { type: 'tracked', title: 'Tracked' };
    }

    if (this.args.model.isProperty) {
      return { type: 'property', title: 'Property' };
    }

    if (this.args.model.isComputed) {
      return { type: 'computed', title: 'Computed' };
    }

    if (this.args.model.isGetter) {
      return { type: 'getter', title: 'Getter' };
    }

    if (this.isOwner) {
      return { type: 'owner', title: 'Owner' };
    }

    return { type: 'n/a', title: 'N/A' };
  }

  get canDig() {
    return this.isObject || this.isEmberObject || this.isArray;
  }

  get cannotEdit() {
    if (this.args.model.name === '...' || !this.isCalculated || this.readOnly)
      return true;
    return !['type-string', 'type-number', 'type-boolean'].includes(
      this.args.model?.value?.type,
    );
  }

  @action
  toggleDeps() {
    if (this.hasDependentKeys) {
      this.isDepsExpanded = !this.isDepsExpanded;
    }
  }

  @action
  valueClick() {
    if (this.canDig) {
      this.args.digDeeper();
      return;
    }

    if (this.cannotEdit) {
      return;
    }

    let value = this.args.model.value.inspect;

    if (this.isString) {
      value = this._quotedString(value);
    }

    this.txtValue = value;
    this.isEdit = true;
  }

  @action
  dateClick() {
    this.dateValue = new Date(this.args.model?.value?.inspect);

    this.isEdit = true;
  }

  @action
  dateSelected([val]) {
    this.dateValue = val;
    this.save();
  }

  @action
  finishedEditing() {
    // eslint-disable-next-line ember/no-runloop
    next(() => {
      this.isEdit = false;
    });
  }

  @action
  save() {
    let realValue, dataType;
    if (!this.isDate) {
      realValue = parseText(this.txtValue ?? '');
    } else {
      realValue = this.dateValue?.getTime();
      dataType = 'date';
    }

    this.args.saveProperty(this.args.model?.name, realValue, dataType);
    this.finishedEditing();
  }

  _quotedString(value) {
    return !value.startsWith('"') && !value.endsWith('"')
      ? `"${value}"`
      : value;
  }
}
