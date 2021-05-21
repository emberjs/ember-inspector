import TextField from '@ember/component/text-field';

export default class PropertyField extends TextField {
  didInsertElement() {
    this.element.select();
    return super.didInsertElement(...arguments);
  }
}
