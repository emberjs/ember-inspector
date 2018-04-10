import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  actions: {
    clear() {
      this.set('value', '');
    }
  }
});
