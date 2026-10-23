import Component from '@glimmer/component';
import { service } from '@ember/service';
import svgJar from 'ember-inspector/helpers/svg-jar';

export default class PropertiesGrouped extends Component {
  <template>
    <button
      class="object-inspector-toggle toolbar-icon-button"
      type="button"
      title="{{if
        this.layout.inspectorExpanded
        'hide'
        'show'
      }} object inspector"
      ...attributes
      {{on "click" this.layout.toggleInspector}}
    >
      {{svgJar "sidebar-toggle-trailing" width="16" height="16"}}
    </button>
  </template>
  @service layout;
}
