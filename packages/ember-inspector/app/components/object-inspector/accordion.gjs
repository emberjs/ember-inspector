import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { hash } from '@ember/helper';

export default class AccordionComponent extends Component {
  <template>
    {{yield (hash isExpanded=this.isExpanded toggle=this.toggle)}}
  </template>
  @tracked _isExpanded;

  constructor() {
    super(...arguments);

    this._isExpanded = this.args.mixin.expand;
  }

  get isExpanded() {
    return this._isExpanded && this.args.mixin.properties.length > 0;
  }

  @action
  toggle() {
    this._isExpanded = !this._isExpanded;
  }
}
