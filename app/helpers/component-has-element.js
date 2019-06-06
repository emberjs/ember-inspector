import Helper from '@ember/component/helper';

export default Helper.extend({
  compute(view) {
    return view.tagName !== '';
  }
});
