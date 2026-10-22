import { action } from '@ember/object';
import { service } from '@ember/service';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';
import SortProperties from 'ember-inspector/components/object-inspector/sort-properties';
import Property from 'ember-inspector/components/object-inspector/property';
import { fn } from '@ember/helper';
import EmptyMessage from 'ember-inspector/components/ui/empty-message';

const findMixin = function (mixins, property) {
  return mixins.find((m) => {
    return m.properties.includes(property);
  });
};

export default class PropertiesAll extends PropertiesBase {
  <template>
    {{#if this.flatPropertyList.length}}
      <ul class="mixin-properties m-0 text-base font-mono list-none">
        <SortProperties
          @properties={{this.flatPropertyList}}
          as |sortedProperties|
        >
          {{#each sortedProperties as |prop|}}
            <Property
              @calculate={{fn this.calculate prop}}
              @digDeeper={{fn this.digDeeper prop}}
              @model={{prop}}
              @saveProperty={{this.saveProperty}}
              @sendToConsole={{fn this.sendToConsole prop}}
              @gotoSource={{fn this.gotoSource prop}}
            />
          {{/each}}
        </SortProperties>
      </ul>
    {{else}}
      <EmptyMessage>
        No properties found
      </EmptyMessage>
    {{/if}}
  </template>
  @service port;

  @action calculate(property) {
    const mixin = findMixin(this.args.model.mixins, property);

    this.port.send('objectInspector:calculate', {
      objectId: this.args.model.objectId,
      mixinIndex: this.args.model.mixins.indexOf(mixin),
      property: property.name,
    });
  }

  get flatPropertyList() {
    const props = this.args.model.mixins.map(function (mixin) {
      return mixin.properties.filter(function (p) {
        let shouldApplyCustomFilter = this.args.customFilter
          ? p.name.toLowerCase().indexOf(this.args.customFilter.toLowerCase()) >
            -1
          : true;
        return (
          !Object.prototype.hasOwnProperty.call(p, 'overridden') &&
          shouldApplyCustomFilter
        );
      }, this);
    }, this);

    return props.flat();
  }
}
