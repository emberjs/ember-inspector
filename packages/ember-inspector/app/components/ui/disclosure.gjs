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

{{yield (hash
  isExpanded=this.isExpanded
  toggle=this.toggle
  triangleIcon=(component "ui/disclosure-triangle" expanded=this.isExpanded)
  triangleButton=(component "ui/disclosure-triangle" expanded=this.isExpanded toggle=this.toggle)
)}}
