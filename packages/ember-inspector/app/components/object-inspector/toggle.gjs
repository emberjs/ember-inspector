<button
  class="object-inspector-toggle toolbar-icon-button"
  type="button"
  title="{{if this.layout.inspectorExpanded "hide" "show"}} object inspector"
  ...attributes
  {{on "click" this.layout.toggleInspector}}
>
  {{svg-jar "sidebar-toggle-trailing" width="16" height="16"}}
</button>