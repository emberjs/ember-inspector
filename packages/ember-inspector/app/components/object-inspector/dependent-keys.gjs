import DependentKeyConnectionIcon from 'ember-inspector/svg/dependent-key-connection.svg?unsafe-inline';
import DependentKeyBulletIcon from 'ember-inspector/svg/dependent-key-bullet.svg?unsafe-inline';
<template>
  <li class="mixin-property-dependency-list relative">
    <DependentKeyConnectionIcon width="20px" height="10px" aria-hidden="true" />
    <ul class="m-0 p-0 list-none">
      {{#each @keys as |dep|}}
        <li
          class="mixin-property-dependency-item relative text-base12 text-sm
            {{if dep.changed 'text-spec01'}}"
          title={{if dep.changed "this property changed"}}
        >
          {{#if dep.child}}
            <span
              class="mixin-property-dependency-name subkey"
              data-label="object-property-name"
            >
              • --
              {{dep.child}}
            </span>
          {{else}}
            <DependentKeyBulletIcon
              width="9px"
              height="9px"
              aria-hidden="true"
            />
            <span
              class="mixin-property-dependency-name"
              data-label="object-property-name"
            >
              {{dep.name}}
            </span>
          {{/if}}
          {{#if dep.changed}}🔸{{/if}}
        </li>
      {{/each}}
    </ul>
  </li>
</template>
