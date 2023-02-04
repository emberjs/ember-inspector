import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ObjectInspector extends Component {
  @service port;

  @tracked propDisplayType = 'grouped';
  @tracked customFilter = '';

  constructor() {
    super(...arguments);
    this.searchInputId = 'custom-filter-input';
  }

  get trail() {
    let nested = this.args.model.slice(1);
    if (nested.length === 0) {
      return '';
    }
    return `.${nested.mapBy('property').join('.')}`;
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
