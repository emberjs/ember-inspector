import Component from '@glimmer/component';
import { get } from '@ember/object';

export default class InspectorTableCell extends Component {
  get value() {
    return get(this.args.data, this.args.column.key);
  }
}
