import Component from '@ember/component';

export default class PropertyField extends Component {
  didInsertElement() {
    this.element.select();
    return super.didInsertElement(...arguments);
  }
}
