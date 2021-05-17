import classic from 'ember-classic-decorator';
import TextField from '@ember/component/text-field';

@classic
export default class PropertyField extends TextField {
  didInsertElement() {
    this.element.select();
    return super.didInsertElement(...arguments);
  }
}
