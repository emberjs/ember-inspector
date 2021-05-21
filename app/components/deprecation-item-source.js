import { tagName } from '@ember-decorators/component';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { and, readOnly, bool } from '@ember/object/computed';
import Component from '@ember/component';

@tagName('')
export default class DeprecationItemSource extends Component {
  @service port;

  @bool('model.map.source') known;

  @computed('model.map.{line,source}', 'known')
  get url() {
    let source = get(this, 'model.map.source');
    if (this.known) {
      return `${source}:${get(this, 'model.map.line')}`;
    } else {
      return 'Unkown source';
    }
  }

  @readOnly('port.adapter') adapter;

  @and('known', 'adapter.canOpenResource') isClickable;
}
