import Component from '@ember/component';

export default Component.extend({
  actions: {
    clear() {
      this.element.querySelector('input').focus();
      this.set('value', '');
    }
  }
});
