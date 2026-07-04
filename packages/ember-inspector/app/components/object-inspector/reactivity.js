import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Shows why a render node (component invocation, route template, …)
 * rendered: what it depends on — its args and the instance properties it
 * consumes — and which of those dependencies changed most recently.
 *
 * The data comes from the `view:getReactivity` / `view:reactivity`
 * messages; it is re-requested whenever the app sends a new render tree so
 * the pane stays live while the app re-renders.
 */
export default class Reactivity extends Component {
  @service port;

  @tracked reactivity = null;

  constructor() {
    super(...arguments);

    this.port.on('view:reactivity', this, this.receiveReactivity);
    this.port.on('view:renderTree', this, this.requestReactivity);
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this.port.off('view:reactivity', this, this.receiveReactivity);
    this.port.off('view:renderTree', this, this.requestReactivity);
  }

  get accordionMixin() {
    return {
      name: 'reactivity',
      expand: true,
      properties: {
        length: 1,
      },
    };
  }

  get renderNodeId() {
    return this.args.item?.renderNode?.id;
  }

  @action requestReactivity() {
    if (this.renderNodeId) {
      this.port.send('view:getReactivity', { id: this.renderNodeId });
    }
  }

  @action receiveReactivity({ id, reactivity }) {
    if (id === this.renderNodeId) {
      this.reactivity = reactivity;
    }
  }

  get namedArgs() {
    return this.reactivity?.args?.named ?? [];
  }

  get positionalArgs() {
    return this.reactivity?.args?.positional ?? [];
  }

  get trackedProps() {
    return this.reactivity?.tracked ?? [];
  }

  /**
   * The dependencies that were dirtied since the previous render — what
   * caused the most recent re-render of this node.
   */
  get causes() {
    if (!this.reactivity || !this.reactivity.updateCount) {
      return [];
    }

    const causes = new Set();

    for (const arg of this.namedArgs) {
      if (arg.changed) {
        causes.add(`@${arg.name}`);
      }
      for (const dep of arg.dependencies ?? []) {
        if (dep.changed) {
          causes.add(dep.name);
        }
      }
    }

    for (const arg of this.positionalArgs) {
      if (arg.changed) {
        causes.add(`@${arg.name}`);
      }
      for (const dep of arg.dependencies ?? []) {
        if (dep.changed) {
          causes.add(dep.name);
        }
      }
    }

    for (const prop of this.trackedProps) {
      if (prop.changed) {
        causes.add(`this.${prop.name}`);
      }
    }

    return [...causes];
  }
}
