{{! template-lint-disable require-presentational-children }}
<Ui::Disclosure as |disclosure|>
  <div class="deprecation-item px-3 text-lg" data-test-deprecation-item>
    <div class="flex items-center">
      <div
        class="flex items-center flex-grow py-2"
        role="button"
        {{on "click" disclosure.toggle}}
      >
        {{#if @model.hasSourceMap}}
          <div class="flex-shrink-0 w-3">
            <disclosure.triangleIcon />
          </div>
        {{/if}}

        <div class="w-12 flex-shrink-0 pr-2 text-right">
          <span class="pill" data-test-deprecation-count>
            {{@model.count}}
          </span>
        </div>

        <span class="flex-grow font-bold" data-test-deprecation-message>
          {{@model.message}}
        </span>
      </div>

      {{#if (not @model.hasSourceMap)}}
        <button
          class="send-to-console send-to-console-chevron-only mr-2"
          title="Trace deprecations in console"
          data-test-full-trace-deprecations-btn
          type="button"
          {{on "click" (fn @traceDeprecations @model)}}
        >
          {{svg-jar "send-with-chevron" width="6px" height="9px"}}
          Trace in the Console
        </button>
      {{/if}}

      {{#if @model.url}}
        <a
          href={{@model.url}}
          class="flex items-center flex-shrink-0 py-1 px-2 rounded no-underline bg-base02"
          target="_blank"
          rel="noopener noreferrer"
        >
          Transition Plan
          {{svg-jar
            "external-link"
            width="16px"
            height="16px"
            class="ml-1 external-link"
          }}
        </a>
      {{/if}}
    </div>

    {{#if (and @model.hasSourceMap disclosure.isExpanded)}}
      {{#each @model.sources as |single|}}
        <DeprecationItemSource
          @itemModel={{single}}
          @modelGroup={{@model}}
          @traceSource={{@traceSource}}
          @openResource={{@openResource}}
        />
      {{/each}}
    {{/if}}
  </div>
</Ui::Disclosure>