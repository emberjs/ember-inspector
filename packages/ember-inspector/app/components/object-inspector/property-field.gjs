import { TextField } from '@ember/legacy-built-in-components';

export default class PropertyField extends TextField {
  <template></template>
  didInsertElement() {
    this.element.select();
    return super.didInsertElement(...arguments);
  }
}
