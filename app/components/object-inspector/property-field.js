import TextField from '@ember/component/text-field';

export default TextField.extend({
  didInsertElement() {
    this.element.select();
    return this._super(...arguments);
  }
});

