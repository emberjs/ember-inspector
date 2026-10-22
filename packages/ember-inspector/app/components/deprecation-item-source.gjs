import { action } from '@ember/object';
import { service } from '@ember/service';

import Component from '@glimmer/component';
export default class DeprecationItemSource extends Component {
  @service port;

  get url() {
    let source = this.args.itemModel?.map.source;
    if (this.known) {
      return `${source}:${this.args.itemModel?.map.line}`;
    } else {
      return 'Unkown source';
    }
  }

  get adapter() {
    return this.port.adapter;
  }

  get isClickable() {
    return this.known && this.adapter.canOpenResource;
  }

  get known() {
    return this.args.itemModel?.map.source;
  }

  @action
  handleClick() {
    this.args.traceSource?.(this.args.modelGroup, this.args.itemModel);
  }

  @action
  handleRedirect() {
    this.args.openResource?.(this.args.itemModel?.map);
  }
}

<div class="deprecation-source pb-2" data-test-deprecation-source>
  <button
    class="send-to-console send-to-console-chevron-only mr-3"
    title="Trace deprecations in console"
    data-test-trace-deprecations-btn
    {{on "click" this.handleClick}}
    type="button"
  >
    {{svg-jar "send-with-chevron" width="6px" height="9px"}}
    Trace in the Console
  </button>
  <span class="source">
    {{#if this.isClickable}}
      <a
        class="font-mono"
        href="#"
        data-test-deprecation-source-link
        {{on "click" this.handleRedirect}}
      >
        {{this.url}}
      </a>
    {{else}}
      <span class="font-mono" data-test-deprecation-source-text>
        {{this.url}}
      </span>
    {{/if}}
  </span>
</div>