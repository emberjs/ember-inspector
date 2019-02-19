import Component from '@ember/component';

export default Component.extend({
  click(e) {
    if (e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault();
      window.open(e.target.href);
    }
  }
});
