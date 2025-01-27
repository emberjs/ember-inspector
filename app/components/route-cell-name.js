// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';

export default class RouteCellName extends Component {
  @computed('args.route.parentCount')
  get labelStyle() {
    return htmlSafe(
      `padding-left: ${+this.args.route?.parentCount * 20 + 5}px;`,
    );
  }

  @computed('args.currentRoute.{name,url}', 'args.route.value.{name,url}')
  get isCurrent() {
    const { currentRoute, route } = this.args;

    if (!currentRoute || !route) {
      return false;
    }

    return checkCurrentRoute(currentRoute, route.value);
  }
}
