import Ember from "ember";
export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['send-to-console'],
  attributeBindings: ['dataLabel:data-label'],
  dataLabel: 'send-to-console-btn'
});
