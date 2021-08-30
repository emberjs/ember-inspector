import { tagName } from '@ember-decorators/component';
import { computed, get } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';

@tagName('')
export default class RouteCellName extends Component {
  @computed('route.parentCount')
  get labelStyle() {
    return htmlSafe(
      `padding-left: ${+get(this, 'route.parentCount') * 20 + 5}px;`
    );
  }

  @computed('currentRoute.{name,url}', 'route.value.{name,url}')
  get isCurrent() {
    const { currentRoute, route } = this;

    if (!currentRoute || !route) {
      return false;
    }

    return checkCurrentRoute(currentRoute, route.value);
  }
}
