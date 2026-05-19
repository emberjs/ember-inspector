import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import { TrackedArray } from 'tracked-built-ins';

import debounceComputed from 'ember-inspector/computed/debounce';
import searchMatch from 'ember-inspector/utils/search-match';

export default class DeprecationsController extends Controller {
  @service adapter;
  @service port;

  deprecations = new TrackedArray([]);
  @tracked search = null;
  @tracked toggleDeprecationWorkflow = false;

  @debounceComputed('search', 300) searchValue;

  @action
  changeDeprecationWorkflow(e) {
    this.toggleDeprecationWorkflow = e.target.checked;

    this.port.send('deprecation:setOptions', {
      options: { toggleDeprecationWorkflow: this.toggleDeprecationWorkflow },
    });
  }

  get filtered() {
    return this.deprecations.filter((item) =>
      searchMatch(item.message, this.search),
    );
  }

  @action
  clear() {
    this.port.send('deprecation:clear');
    this.deprecations.splice(0, this.deprecations.length);
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
}
