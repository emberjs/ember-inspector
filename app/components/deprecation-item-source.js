import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { bool, readOnly, and } from '@ember/object/computed';

export default class DeprecationItemSourceComponent extends Component {
  @readOnly('port.adapter') adapter;
  @and('known', 'adapter.canOpenResource') isClickable;
  @bool('args.model.map.source') known;

  @computed('args.model.map.{line,source}', 'known')
  get url() {
    let source = this.args.model?.map?.source;
    if (this.known) {
      return `${source}:${this.args.model?.map?.line}`;
    } else {
      return 'Unkown source';
    }
  }
}
