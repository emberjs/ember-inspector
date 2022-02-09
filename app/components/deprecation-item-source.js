import { get, action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
export default class DeprecationItemSource extends Component {
  @service port;

  get url() {
    const source = get(this.args, 'itemModel.map.source');
    if (this.known) {
      return `${source}:${get(this.args, 'itemModel.map.line')}`;
    } else {
      return 'Unkown source';
    }
  }

  get adapter() {
    return this.port.adapter;
  }

  get isClickable() {
    return this.known && this.adapter.canOpenResource;
  }

  get known() {
    return this.args.itemModel.map.source;
  }

  @action
  handleClick() {
    this.args.traceSource?.(this.args.modelGroup, this.args.itemModel);
  }

  @action
  handleRedirect() {
    this.args.openResource?.(this.args.itemModel.map);
  }
}
