import { action, computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import debounceComputed from 'ember-inspector/computed/debounce';
import searchMatch from 'ember-inspector/utils/search-match';

export default class DeprecationsController extends Controller {
  @service port;

  search = null;
  toggleDeprecationWorkflow = false;

  @debounceComputed('search', 300) searchValue;

  constructor() {
    super(...arguments);
    set(this, 'deprecations', []);
  }

  @computed('deprecations.@each.message', 'search')
  get filtered() {
    return this.deprecations.filter((item) =>
      searchMatch(item.message, this.search)
    );
  }

  @action
  openResource(item) {
    this.adapter.openResource(item.fullSource, item.line);
  }

  @action
  traceSource(deprecation, source) {
    this.port.send('deprecation:sendStackTraces', {
      deprecation: {
        message: deprecation.message,
        sources: [source],
      },
    });
  }

  @action
  traceDeprecations(deprecation) {
    this.port.send('deprecation:sendStackTraces', {
      deprecation,
    });
  }

  @action
  changeDeprecationWorkflow(e) {
    this.set('toggleDeprecationWorkflow', e.target.checked);

    this.port.send('deprecation:setOptions', {
      options: { toggleDeprecationWorkflow: this.toggleDeprecationWorkflow },
    });
  }
}
