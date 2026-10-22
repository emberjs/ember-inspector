import Component from '@glimmer/component';

export default class InspectorTableRow extends Component {
  select = () => {
    if (this.args.isSelectable) this.args.onSelect(this.args.data);
  };
}
