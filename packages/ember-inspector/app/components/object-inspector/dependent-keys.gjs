import DependentKeyConnectionIcon from 'ember-inspector/svg/dependent-key-connection.svg?unsafe-inline';
import DependentKeyBulletIcon from 'ember-inspector/svg/dependent-key-bullet.svg?unsafe-inline';
<template>
  <li class="mixin-property-dependency-list relative">
    <DependentKeyConnectionIcon width="20px" height="10px" aria-hidden="true" />
    <ul class="m-0 p-0 list-none">
      {{#each @keys as |dep|}}
        <li
          class="mixin-property-dependency-item relative text-base12 text-sm
            {{if dep.changed 'text-spec01'}}
            {{if dep.child 'mixin-property-dependency-item-nested'}}"
          title={{if dep.changed "this property changed"}}
        >
          <DependentKeyBulletIcon width="9px" height="9px" aria-hidden="true" />
          <span
            class="mixin-property-dependency-name"
            data-label="object-property-name"
          >
            {{if dep.child dep.child dep.name}}
          </span>
          {{#if dep.changed}}🔸{{/if}}
        </li>
      {{/each}}
    </ul>
  </li>
</template>
