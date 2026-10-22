import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';
import { concat } from '@ember/helper';

export default class RouteCellName extends Component {
  <template>
    <div style={{this.labelStyle}}>
      <span
        title={{@route.value.name}}
        class={{concat
          "js-route-name"
          (if this.isCurrent " pill pill-blue pill-text font-bold")
        }}
      >
        {{@route.value.name}}
      </span>
    </div>
  </template>
  get labelStyle() {
    return htmlSafe(
      `padding-left: ${+this.args.route?.parentCount * 20 + 5}px;`,
    );
  }

  get isCurrent() {
    const { currentRoute, route } = this.args;

    if (!currentRoute || !route) {
      return false;
    }

    return checkCurrentRoute(currentRoute, route.value);
  }
}
