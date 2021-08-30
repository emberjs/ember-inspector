import Route from '@ember/routing/route';
import { scheduleOnce } from '@ember/runloop';

export default class TabRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);

    function setToolbarContainer() {
      controller.set('toolbarContainer', document.querySelector('#toolbar'));
    }

    scheduleOnce('afterRender', this, setToolbarContainer);
  }
}
