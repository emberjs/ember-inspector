/* eslint no-cond-assign:0 */
import PortMixin from 'ember-debug/mixins/port-mixin';
import RenderTree from 'ember-debug/libs/render-tree';
import ViewInspection from 'ember-debug/libs/view-inspection';

const Ember = window.Ember;

const {
  computed,
  run,
  Object: EmberObject,
} = Ember;
const { throttle } = run;
const { readOnly } = computed;

export default EmberObject.extend(PortMixin, {
  namespace: null,

  adapter: readOnly('namespace.adapter'),
  objectInspector: readOnly('namespace.objectInspector'),

  portNamespace: 'view',

  messages: {
    getTree() {
      this.sendTree();
    },

    showPreview({ id }) {
      this.viewInspection.show(id, false);
      // this.renderTree.highlightLayer(message.objectId || message.elementId, true);
    },

    hidePreview() {
      this.viewInspection.hide();
    },

    inspectViews(message) {
      if (message.inspect) {
        this.startInspecting();
      } else {
        this.stopInspecting();
      }
    },

    scrollIntoView({ id }) {
      this.renderTree.scrollIntoView(id);
    },

    inspect({ id }) {
      this.renderTree.inspect(id);
    },

    contextMenu() {
      let { lastRightClicked } = this;
      this.lastRightClicked = null;
      this.inspectNearest(lastRightClicked);
    }
  },

  init() {
    this._super(...arguments);

    this.retainedObjects = [];

    let renderTree = this.renderTree = new RenderTree({
      owner: this.getOwner(),
      retainObject: this.retainObject.bind(this),
      inspectNode: this.inspectNode.bind(this),
    });

    this.viewInspection = new ViewInspection({
      renderTree,
      objectInspector: this.objectInspector,
    });

    this.setupListeners();
  },

  setupListeners() {
    this.lastRightClicked = null;
    this.onRightClick = this.onRightClick.bind(this);
    window.addEventListener('mousedown', this.onRightClick);

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  },

  cleanupListeners() {
    this.lastRightClicked = null;
    window.removeEventListener('mousedown', this.onRightClick);

    window.removeEventListener('resize', this.onResize);
  },

  onRightClick(event) {
    if (event.button === 2) {
      this.lastRightClicked = event.target;
    }
  },

  onResize() {
    // TODO hide or redraw highlight/tooltip
  },

  inspectNearest(node) {
    if (!this.viewInspection.inspectNearest(node)) {
      this.adapter.log('No Ember component found.');
    }
  },

  retainObject(object) {
    let guid = this.objectInspector.retainObject(object);
    this.retainedObjects.push(guid);
    return guid;
  },

  releaseCurrentObjects() {
    this.retainedObjects.forEach(guid => {
      this.objectInspector.releaseObject(guid);
    });
    this.retainedObjects = [];
  },

  willDestroy() {
    this._super();

    this.cleanupLayers();
    this.cleanupListeners();

    this.releaseCurrentObjects();
    this.stopInspecting();
  },

  /**
   * Opens the "Elements" tab and selects the given DOM node. Doesn't work in all
   * browsers/addons (only in the Chrome and FF devtools addons at the time of writing).
   *
   * @method inspectNode
   * @param  {Node} node The DOM node to inspect
   */
  inspectNode(node) {
    this.get('adapter').inspectNode(node);
  },

  sendTree() {
    run.scheduleOnce('afterRender', this, this.scheduledSendTree);
  },

  scheduledSendTree() {
    // needs to trigger on the trailing edge of the wait interval, otherwise it might happen
    // that we do not pick up fast route switching or 2 or more short rerenders
    throttle(this, this.send, 250, false);
  },

  send() {
    if (this.isDestroying) {
      return;
    }

    this.sendMessage('viewTree', {
      tree: this.getTree()
    });
  },

  getTree() {
    this.releaseCurrentObjects();

    // TODO: why is this needed?
    let emberApp = this.getOwner();

    if (!emberApp) {
      return [];
    }

    return this.renderTree.build();
  },

  startInspecting() {
    this.sendMessage('startInspecting', {});
    this.viewInspection.start();
  },

  stopInspecting() {
    this.viewInspection.stop();
    this.sendMessage('stopInspecting', {});
  },

  getOwner() {
    return this.namespace.owner;
  }
});
