import Ember from "ember";
const { Controller, computed } = Ember;
const { bool, readOnly, and } = computed;

export default Controller.extend({
  known: bool('model.map.source'),

  url: function() {
    let source = this.get('model.map.source');
    if (this.get('known')) {
      return source + ':' + this.get('model.map.line');
    } else {
      return 'Unkown source';
    }
  }.property('model.map.source', 'model.map.line', 'known'),

  adapter: readOnly('port.adapter'),

  isClickable: and('known', 'adapter.canOpenResource')
});
