{{#each @model.mixins as |mixin|}}
  <ObjectInspector::Accordion @mixin={{mixin}} as |accordion|>
    <div
      class="mixin {{mixin.type}} {{if accordion.isExpanded "mixin-state-expanded"}} {{if mixin.properties.length "mixin-props-yes" "mixin-props-no"}}"
      data-test-object-detail
    >
      {{#if mixin.properties.length}}
        <h2
          data-test-object-detail-name
          class="mixin-name sticky top-0 truncate select-none cursor-default text-base15 bg-base01"
          role="button"
          {{on "click" accordion.toggle}}
        >
          {{mixin.name}}
        </h2>
      {{else}}
        <h2
          class="mixin-name mixin-name--no-props sticky top-0 truncate select-none text-base09 cursor-default bg-base01"
          data-test-object-detail-name
        >
          {{mixin.name}}
        </h2>
      {{/if}}
      {{#if accordion.isExpanded}}
        <ul class="mixin-properties m-0 text-base font-mono list-none">
          <ObjectInspector::SortProperties
            @properties={{mixin.properties}} as |sortedProperties|
          >
            {{#each sortedProperties as |prop|}}
              <ObjectInspector::Property
                @model={{prop}}
                @calculate={{fn this.calculate prop mixin}}
                @digDeeper={{fn this.digDeeper prop}}
                @saveProperty={{this.saveProperty}}
                @sendToConsole={{fn this.sendToConsole prop}}
                @gotoSource={{fn this.gotoSource prop}}
              />
            {{else}}
              <li class="mixin-property flex relative flex-row items-center truncate">No Properties</li>
            {{/each}}
          </ObjectInspector::SortProperties>
        </ul>
      {{/if}}
    </div>
  </ObjectInspector::Accordion>
{{/each}}

