import Component from '@glimmer/component';

export default class ItemTypesComponent extends Component {
  get typeClass() {
    return `js-${this.args.type}-type`;
  }
}
