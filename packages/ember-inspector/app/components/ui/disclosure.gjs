import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import UiDisclosureTriangle from 'ember-inspector/components/ui/disclosure-triangle';

export default class DisclosureComponent extends Component {
  <template>
    {{yield
      (hash
        isExpanded=this.isExpanded
        toggle=this.toggle
        triangleIcon=(component UiDisclosureTriangle expanded=this.isExpanded)
        triangleButton=(component
          UiDisclosureTriangle expanded=this.isExpanded toggle=this.toggle
        )
      )
    }}
  </template>
  @tracked isExpanded = false;

  @action
  toggle() {
    set(this, 'isExpanded', !this.isExpanded);
  }
}
