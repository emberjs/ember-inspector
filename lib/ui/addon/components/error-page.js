import Component from '@ember/component';
import layout from '../templates/components/error-page';

export default Component.extend({
  layout,

  didInsertElement() {
    setTimeout(() => {
      if (!this.element) { return; }
      const tom = this.element.querySelector('.tomster');
      if (tom) { tom.classList.add('hello'); }
    }, 1000);
  }
});
