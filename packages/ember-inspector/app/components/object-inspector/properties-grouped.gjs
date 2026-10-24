import { action } from '@ember/object';
import { service } from '@ember/service';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';
import Accordion from 'ember-inspector/components/object-inspector/accordion';
import SortProperties from 'ember-inspector/components/object-inspector/sort-properties';
import Property from 'ember-inspector/components/object-inspector/property';

export default class PropertiesGrouped extends PropertiesBase {
  <template>
    {{#each @model.mixins as |mixin|}}
      <Accordion @mixin={{mixin}} as |accordion|>
        <div
          class="mixin
            {{mixin.type}}
            {{if accordion.isExpanded 'mixin-state-expanded'}}
            {{if mixin.properties.length 'mixin-props-yes' 'mixin-props-no'}}"
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
              <SortProperties
                @properties={{mixin.properties}}
                as |sortedProperties|
              >
                {{#each sortedProperties as |prop|}}
                  <Property
                    @model={{prop}}
                    @calculate={{fn this.calculate prop mixin}}
                    @digDeeper={{fn this.digDeeper prop}}
                    @saveProperty={{this.saveProperty}}
                    @sendToConsole={{fn this.sendToConsole prop}}
                    @gotoSource={{fn this.gotoSource prop}}
                  />
                {{else}}
                  <li
                    class="mixin-property flex relative flex-row items-center truncate"
                  >No Properties</li>
                {{/each}}
              </SortProperties>
            </ul>
          {{/if}}
        </div>
      </Accordion>
    {{/each}}
  </template>
  @service port;

  @action calculate({ name }, mixin) {
    this.port.send('objectInspector:calculate', {
      objectId: this.args.model.objectId,
      mixinIndex: this.args.model.mixins.indexOf(mixin),
      property: name,
    });
  }
}
