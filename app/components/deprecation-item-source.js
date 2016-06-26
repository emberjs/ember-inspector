import Ember from 'ember';
const { computed } = Ember;
const { bool, readOnly, and } = computed;

export default Ember.Component.extend({
  known: bool('model.map.source'),

  url: computed('model.map.source', 'model.map.line', 'known', function() {
    let source = this.get('model.map.source');
    if (this.get('known')) {
      return source + ':' + this.get('model.map.line');
    } else {
      return 'Unkown source';
    }
  }),

  adapter: readOnly('port.adapter'),

  isClickable: and('known', 'adapter.canOpenResource')
});
