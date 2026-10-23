import { service } from '@ember/service';
import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

/**
 * Base list view config
 */
import buildStyle from 'ember-inspector/helpers/build-style';
import { concat, hash } from '@ember/helper';
export default class ListContent extends Component {
  <template>
    <div
      class="list-content js-list-content"
      style={{this.style}}
      ...attributes
    >
      <div class="list-table-container">
        <table>
          <colgroup>
            {{#each @columns as |column|}}
              <col style={{buildStyle width=(concat column.width "px")}} />
            {{/each}}
          </colgroup>
          {{yield (hash rowEvents=this.rowEvents)}}
        </table>
      </div>
    </div>
  </template>
  /**
   * The layout service. Used to observe the app's content height.
   */
  @service('layout') layoutService;

  get height() {
    let { contentHeight } = this.layoutService;

    /**
     * The content area reports its height after it renders.
     */
    if (!contentHeight) {
      return 1;
    }

    return contentHeight - this.args.headerHeight;
  }

  get style() {
    return htmlSafe(`height:${this.height}px`);
  }
}
