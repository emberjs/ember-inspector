import { get, observer, computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';
import debounceComputed from "ember-inspector/computed/debounce";
import searchMatch from "ember-inspector/utils/search-match";

export default Controller.extend({
  /**
   * Used by the view for content height calculation
   *
   * @property application
   * @type {Controller}
   */
  application: controller(),
  search: null,
  searchValue: debounceComputed('search', 300),
  options: {
    toggleDeprecationWorkflow: false
  },

  filtered: computed('model.@each.message', 'search', function() {
    return get(this, 'model')
      .filter((item) => searchMatch(get(item, 'message'), this.get('search')));
  }),

  optionsChanged: observer('options.toggleDeprecationWorkflow', function() {
    this.port.send('deprecation:setOptions', { options: this.get('options') });
  }),

  actions: {
    openResource(item) {
      this.get('adapter').openResource(item.fullSource, item.line);
    },

    traceSource(deprecation, source) {
      this.get('port').send('deprecation:sendStackTraces', {
        deprecation: {
          message: deprecation.message,
          sources: [source]
        }
      });
    },

    traceDeprecations(deprecation) {
      this.get('port').send('deprecation:sendStackTraces', {
        deprecation
      });
    }
  }
});
