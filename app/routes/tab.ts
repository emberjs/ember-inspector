import type Controller from '@ember/controller';
import Route from '@ember/routing/route';
import { scheduleOnce } from '@ember/runloop';
import type Transition from '@ember/routing/transition';

export default class TabRoute extends Route {
  setupController(
    controller: Controller,
    model: unknown,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);

    function setToolbarContainer() {
      // @ts-expect-error The controller could be different types.
      controller.set('toolbarContainer', document.querySelector('#toolbar'));
    }

    scheduleOnce('afterRender', this, setToolbarContainer);
  }
}
