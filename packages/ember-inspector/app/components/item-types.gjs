import Component from '@glimmer/component';
import DraggableColumn from 'ember-inspector/components/ui/draggable-column';
import { LinkTo } from '@ember/routing';
import eq from 'ember-truth-helpers/helpers/eq';
import escapeUrl from 'ember-inspector/helpers/escape-url';
import { concat } from '@ember/helper';

export default class ItemTypesComponent extends Component {
  <template>
    <div class="split">
      <DraggableColumn
        @classes="split-panel split-panel-sidebar-2 nav"
        @side="left"
        @width={{@width}}
      >
        <div class="split-panel-bd">
          <h1 class="nav-title">{{@header}}</h1>

          <ul>
            {{#each @sorted as |itemType|}}
              <li class={{this.typeClass}}>
                <LinkTo
                  @route={{if (eq @type "model") "records" "container-type"}}
                  @model={{escapeUrl itemType.name}}
                  class="nav-item"
                >
                  <span
                    class={{concat this.typeClass "-name" " nav-item-label"}}
                  >
                    {{itemType.name}}
                  </span>

                  <span
                    class={{concat this.typeClass "-count" " pill"}}
                  >{{itemType.count}}</span>
                </LinkTo>
              </li>
            {{/each}}
          </ul>
        </div>
      </DraggableColumn>

      <div class="split-panel">
        <div class="split-panel-bd">
          {{yield}}
        </div>
      </div>
    </div>
  </template>
  get typeClass() {
    return `js-${this.args.type}-type`;
  }
}
