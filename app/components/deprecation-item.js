import Ember from 'ember';

const { computed } = Ember;
const { notEmpty } = computed;

export default Ember.Component.extend({
  isExpanded: true,

  hasMap: notEmpty('item.hasSourceMap'),

  expandedClass: computed('hasMap', 'isExpanded', function() {
    if (this.get('isExpanded')) {
      return 'row_arrow_expanded';
    } else {
      return 'row_arrow_collapsed';
    }
  }),

  actions: {
    toggleExpand() {
      this.toggleProperty('isExpanded');
    },

    traceDeprecations(item) {
      this.sendAction('traceDeprecations', item);
    },

    traceSource(item, source) {
      this.sendAction('traceSource', item, source);
    },

    openResource(sourceMap) {
      this.sendAction('openResource', sourceMap);
    }
  }
});
