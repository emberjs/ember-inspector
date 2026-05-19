import Route from '@ember/routing/route';
import { scheduleOnce } from '@ember/runloop';

export default class TabRoute extends Route {
  setupController(controller, model, transition) {
    super.setupController(controller, model, transition);

    function setToolbarContainer() {
      controller.set('toolbarContainer', document.querySelector('#toolbar'));
    }

    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', this, setToolbarContainer);
  }
}
