import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import checkCurrentRoute from 'ember-inspector/utils/check-current-route';

export default Component.extend({
  tagName: '',

  labelStyle: computed('route.parentCount', function () {
    return htmlSafe(
      `padding-left: ${+this.get('route.parentCount') * 20 + 5}px;`
    );
  }),

  isCurrent: computed(
    'currentRoute.{name,url}',
    'route.value.{name,url}',
    function () {
      const { currentRoute, route } = this;

      if (!currentRoute) {
        return false;
      }

      return checkCurrentRoute(currentRoute, route.value);
    }
  ),
});
