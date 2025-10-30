import Component from '@glimmer/component';

interface SummaryItemArgs {
  model: {
    name: string;
    'initial-render': number;
    'avg-re-render': number;
    'render-count': number;
  };
  list: unknown; // or just leave this out
}

export default class SummaryItem extends Component<SummaryItemArgs> {
  get row() {
    return this.args.model;
  }
}
