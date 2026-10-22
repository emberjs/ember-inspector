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