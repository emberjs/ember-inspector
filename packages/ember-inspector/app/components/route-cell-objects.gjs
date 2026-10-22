import { on } from '@ember/modifier';
import SendToConsole from 'ember-inspector/components/ui/send-to-console';
<template>
  <div class="route-cell-objects">
    <span
      class="is-link inline-block"
      role="button"
      title={{@route.value.routeHandler.className}}
      {{on "click" @inspectRoute}}
      data-test-route-handler
    >
      Route
    </span>

    <SendToConsole
      @action={{@sendRouteHandlerToConsole}}
      @param={{@route.value.routeHandler.name}}
    />

    {{#if @route.value.controller.exists}}
      <span
        class="is-link js-route-controller"
        role="button"
        title={{@route.value.controller.className}}
        {{on "click" @inspectController}}
      >
        Controller
      </span>

      <SendToConsole
        @action={{@sendControllerToConsole}}
        @param={{@route.value.controller.name}}
      />
    {{/if}}
  </div>
</template>
