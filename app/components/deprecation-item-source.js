import Component from '@ember/component';
import { computed } from '@ember/object';
import { bool, readOnly, and } from '@ember/object/computed';

export default Component.extend({
  tagName: '',

  known: bool('model.map.source'),

  url: computed('model.map.{line,source}', 'known', function() {
    let source = this.get('model.map.source');
    if (this.known) {
      return `${source}:${this.get('model.map.line')}`;
    } else {
      return 'Unkown source';
    }
  }),

  adapter: readOnly('port.adapter'),

  isClickable: and('known', 'adapter.canOpenResource')
});
