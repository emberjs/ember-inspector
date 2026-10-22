import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';

export default class RouteCellName extends Component {
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
