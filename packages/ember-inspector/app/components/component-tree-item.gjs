import { concat } from '@ember/helper';
import DisclosureTriangle from 'ember-inspector/components/ui/disclosure-triangle';
import isString from 'ember-inspector/helpers/is-string';
import ComponentTreeArg from 'ember-inspector/components/component-tree-arg';
import classify from 'ember-inspector/helpers/classify';
import svgJar from 'ember-inspector/helpers/svg-jar';
<template>
  {{! template-lint-disable no-invalid-interactive }}
  <div
    style={{@item.style}}
    class="component-tree-item relative flex items-center mx-1 rounded
      {{if @item.hasInstance 'cursor-pointer' 'cursor-default'}}
      {{if @item.isComponent 'component-tree-item-component'}}
      {{if @item.isPinned 'component-tree-item-pinned'}}
      {{if @item.isHighlighted 'component-tree-item-highlighted'}}"
    {{on "click" @item.toggleInspection}}
    {{on "mouseenter" @item.showPreview}}
    {{on "mouseleave" @item.hidePreview}}
  >
    <div class="component-tree-item-background flex items-center pr-2 rounded">
      {{#if @item.hasChildren}}
        <DisclosureTriangle
          class="component-tree-item-expand self-stretch px-1 cursor-pointer"
          title="Click to toggle (alt/option click to toggle with children)"
          @toggle={{@item.toggleExpansion}}
          @expanded={{@item.isExpanded}}
        />
      {{/if}}

      <code
        class="component-tree-item-tag flex whitespace-no-wrap
          {{if @item.isClosingTag 'component-tree-item-closing'}}
          {{if @item.hasModifiers 'component-tree-item-has-modifier'}}
          {{if
            (or @item.isComponent @item.isModifier @item.isHtmlTag)
            (if
              @item.isCurlyInvocation
              'component-tree-item-classic-bracket'
              (if
                @item.hasChildren
                'component-tree-item-bracket'
                'component-tree-item-bracket component-tree-item-bracket-self-closing'
              )
            )
          }}"
      >
        {{! template-lint-disable no-unbalanced-curlies }}
        {{#if (or @item.isComponent @item.isModifier)}}
          {{#if @item.isCurlyInvocation}}
            <span class="component-name">
              {{@item.name}}
            </span>

            {{#each @item.args.positional key="@index" as |value|}}
              <div class="arg-token flex ml-2">
                {{if (isString value) '"'}}
                <ComponentTreeArg @value={{value}} />
                {{if (isString value) '"'}}
              </div>
            {{/each}}

            {{#each-in @item.args.named as |name value|}}
              <div class="arg-token flex ml-2">
                <span class="key-token">
                  {{name}}
                </span>
                ={{if (isString value) '"'}}
                <ComponentTreeArg @value={{value}} />
                {{if (isString value) '"'}}
              </div>
            {{/each-in}}
          {{else}}
            <span class="component-name">
              {{classify @item.name}}
            </span>

            {{#each-in @item.args.named as |name value|}}
              <div class="arg-token flex ml-2">
                <span class="key-token">
                  @{{name}}
                </span>
                ={{#if (isString value)}}"{{else}}<span
                    class="bracket-token"
                  >\{{</span>{{/if}}
                <ComponentTreeArg @value={{value}} />
                {{#if (isString value)}}"{{else}}<span
                    class="bracket-token"
                  >}}</span>{{/if}}
              </div>
            {{/each-in}}
          {{/if}}
        {{else if @item.isOutlet}}
          \{{outlet "{{@item.name}}"}}
        {{else if @item.isEngine}}
          \{{mount "{{@item.name}}"}}
        {{else if @item.isRouteTemplate}}
          {{concat @item.name " route"}}
        {{else if @item.isHtmlTag}}
          <span class="component-name">
            {{@item.name}}
          </span>
          {{#each-in @item.args.named as |name value|}}
            <div class="arg-token flex ml-2">
              <span class="key-token">
                {{name}}
              </span>
              ={{if (isString value) '"'}}
              <ComponentTreeArg @value={{value}} />
              {{if (isString value) '"'}}
            </div>
          {{/each-in}}
        {{/if}}
      </code>
    </div>

    {{#if @item.hasBounds}}
      <div
        class="component-tree-item-actions sticky flex items-center pr-1 whitespace-no-wrap"
      >
        <button
          class="component-tree-item-action inline-flex items-center h-full p-0 border-0 cursor-pointer bg-transparent z-10"
          title="Scroll into view"
          data-test-scroll-into-view
          {{on "click" @item.scrollIntoView}}
          type="button"
        >
          {{svgJar "eye" width="20px" height="20px"}}
        </button>

        <button
          class="component-tree-item-action inline-flex items-center h-full ml-2 p-0 border-0 cursor-pointer bg-transparent z-10"
          title="View in Elements panel"
          data-test="view-dom-element"
          {{on "click" @item.inspectElement}}
          type="button"
        >
          {{svgJar "code-line" width="20px" height="20px"}}
        </button>
      </div>
    {{/if}}
  </div>
</template>
