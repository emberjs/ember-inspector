import Component from '@glimmer/component';
import { on } from '@ember/modifier';

export default class OpenLinksInNewWindow extends Component {
  <template>
    {{! template-lint-disable no-invalid-interactive }}
    <div {{on "click" this.linkClicked}}>
      {{yield}}
    </div>
  </template>
  linkClicked(e) {
    if (e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault();
      window.open(e.target.href);
    }
  }
}
