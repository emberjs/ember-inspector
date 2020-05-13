import { action, computed } from '@ember/object';
import Controller from '@ember/controller';
import debounceComputed from 'ember-inspector/computed/debounce';
import searchMatch from 'ember-inspector/utils/search-match';

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.deprecations = [];
  },

  search: null,
  searchValue: debounceComputed('search', 300),
  toggleDeprecationWorkflow: false,

  filtered: computed('deprecations.@each.message', 'search', function () {
    return this.deprecations.filter((item) =>
      searchMatch(item.message, this.search)
    );
  }),

  openResource: action(function (item) {
    this.adapter.openResource(item.fullSource, item.line);
  }),

  traceSource: action(function (deprecation, source) {
    this.port.send('deprecation:sendStackTraces', {
      deprecation: {
        message: deprecation.message,
        sources: [source],
      },
    });
  }),

  traceDeprecations: action(function (deprecation) {
    this.port.send('deprecation:sendStackTraces', {
      deprecation,
    });
  }),

  changeDeprecationWorkflow: action(function (e) {
    this.set('toggleDeprecationWorkflow', e.target.checked);

    this.port.send('deprecation:setOptions', {
      options: { toggleDeprecationWorkflow: this.toggleDeprecationWorkflow },
    });
  }),
});
