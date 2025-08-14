/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { action, computed } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias, equal } from '@ember/object/computed';
import { next } from '@ember/runloop';
import parseText from 'ember-inspector/utils/parse-text';

interface ObjectInspectorPropertySignature {
  Args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: any;
    digDeeper: () => unknown;
    gotoSource: () => void;
    sendToConsole: () => void;
    saveProperty: (
      property: unknown,
      value: unknown,
      dataType: unknown,
    ) => unknown;
  };
}

export default class ObjectInspectorProperty extends Component<ObjectInspectorPropertySignature> {
  @tracked dateValue: Date | null = null;
  @tracked isDepsExpanded = false;
  @tracked isEdit = false;
  // Bound to editing textbox
  @tracked txtValue: string | null = null;

  @alias('args.model.value.isCalculated') isCalculated!: boolean;

  @equal('args.model.value.type', 'type-array')
  isArray!: boolean;

  @equal('args.model.value.type', 'type-date')
  isDate!: boolean;

  @equal('args.model.value.type', 'type-ember-object')
  isEmberObject!: boolean;

  @equal('args.model.value.type', 'type-object')
  isObject!: boolean;

  @equal('args.model.value.type', 'type-string')
  isString!: boolean;

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

  @computed('args.model.dependentKeys.[]', 'isCalculated')
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let value = this.args.model.value.inspect;

    if (this.isString) {
      value = this._quotedString(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.txtValue = value;
    this.isEdit = true;
  }

  @action
  dateClick() {
    this.dateValue = new Date(this.args.model?.value?.inspect);

    this.isEdit = true;
  }

  @action
  dateSelected([val]: [Date]) {
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

  _quotedString(value: string) {
    return !value.startsWith('"') && !value.endsWith('"')
      ? `"${value}"`
      : value;
  }
}
