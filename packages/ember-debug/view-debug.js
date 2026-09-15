/* eslint no-cond-assign:0 */
import DebugPort from './debug-port.js';
import RenderTree from './lib/render-tree.js';
import ViewInspection from './lib/view-inspection.js';
import bound from './utils/bound-method.js';

export default class extends DebugPort {
  get adapter() {
    return this.namespace?.adapter;
  }
  get objectInspector() {
    return this.namespace?.objectInspector;
  }

  static {
    this.prototype.portNamespace = 'view';

    this.prototype.messages = {
      getTree({ immediate }) {
        this.sendTree(immediate);
      },

      showInspection({ id, pin }) {
        this.viewInspection.show(id, pin);
      },

      hideInspection() {
        this.viewInspection.hide();
      },

      inspectViews({ inspect }) {
        if (inspect) {
          this.startInspecting();
        } else {
          this.stopInspecting();
        }
      },

      // Sent by the devtools extension when the Ember panel is shown or
      // hidden. While the panel is hidden we stop capturing and streaming
      // the render tree: on large apps that work is expensive enough to
      // freeze the DevTools renderer (which also hosts the other panels,
      // like Elements) as well as slow down the inspected app itself.
      setVisibility({ visible }) {
        this.panelVisible = visible;

        if (visible) {
          // Send a fresh tree so the panel catches up on whatever was
          // missed while it was hidden.
          this.sendTree(true);
        } else if (this.scheduledSendTree) {
          window.clearTimeout(this.scheduledSendTree);
          this.scheduledSendTree = null;
        }
      },

      scrollIntoView({ id }) {
        this.renderTree.scrollIntoView(id);
      },

      inspectElement({ id }) {
        this.renderTree.inspectElement(id);
      },

      contextMenu() {
        let { lastRightClicked } = this;
        this.lastRightClicked = null;
        this.inspectNearest(lastRightClicked);
      },

      editorUrlPatternReceived(message) {
        this.setEditorPattern(message.value);
      },
    };
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init();

    let renderTree = (this.renderTree = new RenderTree({
      owner: this.getOwner(),
      retainObject: bound(
        this.objectInspector,
        this.objectInspector.retainObject,
      ),
      releaseObject: bound(
        this.objectInspector,
        this.objectInspector.releaseObject,
      ),
      inspectNode: bound(this, this.inspectNode),
    }));

    this.viewInspection = new ViewInspection({
      renderTree,
      objectInspector: this.objectInspector,
      didShow: bound(this, this.didShowInspection),
      didHide: bound(this, this.didHideInspection),
      didStartInspecting: bound(this, this.didStartInspecting),
      didStopInspecting: bound(this, this.didStopInspecting),
    });

    this.setupListeners();
  }

  setupListeners() {
    this.lastRightClicked = null;
    this.scheduledSendTree = null;
    window.addEventListener('mousedown', bound(this, this.onRightClick));
    window.addEventListener('resize', bound(this, this.onResize));
  }

  cleanupListeners() {
    this.lastRightClicked = null;

    window.removeEventListener('mousedown', bound(this, this.onRightClick));
    window.removeEventListener('resize', bound(this, this.onResize));

    if (this.scheduledSendTree) {
      window.clearTimeout(this.scheduledSendTree);
      this.scheduledSendTree = null;
    }
  }

  onRightClick(event) {
    if (event.button === 2) {
      this.lastRightClicked = event.target;
      if (event.target.shadowRoot) {
        this.lastRightClicked =
          event.target.shadowRoot.elementFromPoint(event.x, event.y) ||
          event.target;
      }
    }
  }

  onResize() {
    // TODO hide or redraw highlight/tooltip
  }

  inspectNearest(node) {
    let renderNode = this.viewInspection.inspectNearest(node);

    if (!renderNode) {
      this.adapter.log('No Ember component found.');
    }
  }

  willDestroy() {
    super.willDestroy();
    this.cleanupListeners();
    this.viewInspection.teardown();
    this.renderTree.teardown();
  }

  /**
   * Opens the "Elements" tab and selects the given DOM node. Doesn't work in all
   * browsers/addons (only in the Chrome and FF devtools addons at the time of writing).
   *
   * @method inspectNode
   * @param  {Node} node The DOM node to inspect
   */
  inspectNode(node) {
    this.adapter.inspectValue(node);
  }

  sendTree(immediate = false) {
    if (immediate) {
      this.send(true);
      return;
    }

    // Skip passive updates entirely while the Ember panel is hidden.
    // `undefined` (adapters that never report visibility) counts as visible.
    if (this.panelVisible === false) {
      return;
    }

    if (this.scheduledSendTree) {
      return;
    }

    this.scheduledSendTree = window.setTimeout(() => {
      this.send();
      this.scheduledSendTree = null;
    }, this.sendTreeDelay ?? 250);
  }

  send(force = false) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    if (!force && this.panelVisible === false) {
      return;
    }

    // Building and posting the tree is O(number of render nodes) on both
    // sides of the message port. Adapt the debounce delay to how long it
    // actually takes, so that on large apps a passive stream of updates
    // can never saturate the app's or the DevTools' main thread.
    let start = performance.now();

    this.sendMessage('renderTree', {
      tree: this.renderTree.build(),
    });

    let duration = performance.now() - start;
    this.sendTreeDelay = Math.min(Math.max(250, duration * 10), 5000);
  }

  startInspecting() {
    this.viewInspection.start();
  }

  stopInspecting() {
    this.viewInspection.stop();
  }

  didShowInspection(id, pin) {
    if (pin) {
      this.sendMessage('inspectComponent', { id });
    } else {
      this.sendMessage('previewComponent', { id });
    }
  }

  didHideInspection(id, pin) {
    this.sendMessage('cancelSelection', { id, pin });
  }

  didStartInspecting() {
    this.sendMessage('startInspecting', {});
  }

  didStopInspecting() {
    this.sendMessage('stopInspecting', {});
  }

  getOwner() {
    return this.namespace?.owner;
  }

  setEditorPattern(pattern) {
    this.viewInspection.editorUrlPattern = pattern;
  }
}
