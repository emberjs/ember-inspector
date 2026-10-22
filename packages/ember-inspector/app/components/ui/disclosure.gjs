import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DisclosureComponent extends Component {
  @tracked isExpanded = false;

  @action
  toggle() {
    set(this, 'isExpanded', !this.isExpanded);
  }
}
