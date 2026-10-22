import ContainerTypesToolbar from 'ember-inspector/components/container-types-toolbar';
<template>
  {{#if @controller.toolbarContainer}}
    {{#in-element @controller.toolbarContainer}}
      <ContainerTypesToolbar
        @reload={{@controller.refresh}}
        @sendContainerToConsole={{@controller.sendContainerToConsole}}
      />
    {{/in-element}}
  {{/if}}

  {{yield}}
</template>
