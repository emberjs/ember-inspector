/* eslint no-cond-assign:0 */
import PortMixin from 'ember-debug/mixins/port-mixin';
import GlimmerTree from 'ember-debug/libs/glimmer-tree';
import { typeOf } from './utils/type-check';
import {
  modelName as getModelName,
  shortModelName as getShortModelName,
  controllerName as getControllerName,
  shortControllerName as getShortControllerName,
  viewName as getViewName,
  shortViewName as getShortViewName
} from 'ember-debug/utils/name-functions';
import { makeRenderNodeCloneable } from './libs/octane-tree';

const Ember = window.Ember;

const {
  _captureRenderTree,
  guidFor,
  computed,
  get,
  run,
  Object: EmberObject,
  Component,
  String
} = Ember;
const { throttle } = run;
const { readOnly } = computed;
const { classify } = String;

let layerDiv, previewDiv;

export default EmberObject.extend(PortMixin, {
  namespace: null,

  adapter: readOnly('namespace.adapter'),
  objectInspector: readOnly('namespace.objectInspector'),

  portNamespace: 'view',

  messages: {
    getTree() {
      this.sendTree();
    },
    hideLayer() {
      this.hideLayer();
    },
    previewLayer(message) {
      this.glimmerTree.highlightLayer(message.objectId || message.elementId, true);
    },
    hidePreview() {
      this.hidePreview();
    },
    inspectViews(message) {
      if (message.inspect) {
        this.startInspecting();
      } else {
        this.stopInspecting();
      }
    },

    scrollToElement({ elementId }) {
      let el = document.querySelector(`#${elementId}`);
      if (el) {
        el.scrollIntoView();
      }
    },

    /**
     * Inspect the element in the Chrome inspector
     */
    inspectElement({ elementId, objectId }) {
      if (objectId) {
        this.inspectViewElement(objectId);
      } else {
        let element = document.getElementById(elementId);
        this.inspectElement(element);
      }
    },

    contextMenu() {
      this.inspectComponentForNode(this.lastClickedElement);
    }
  },

  init() {
    this._super(...arguments);

    this.retainedObjects = [];
    this._durations = {};
    layerDiv = document.createElement('div');
    layerDiv.setAttribute('data-label', 'layer-div');
    layerDiv.style.display = 'none';
    document.body.appendChild(layerDiv);

    previewDiv = document.createElement('div');
    previewDiv.style.pointerEvents = 'none';
    previewDiv.style.display = 'none';
    previewDiv.setAttribute('data-label', 'preview-div');
    document.body.appendChild(previewDiv);

    // Store last clicked element for context menu
    this.lastClickedHandler = (event) => {
      if (event.button === 2) {
        this.lastClickedElement = event.target;
      }
    };
    window.addEventListener('mousedown', this.lastClickedHandler);

    this.resizeHandler = () => {
      this.hideLayer();
    };
    window.addEventListener('resize', this.resizeHandler);

    this.glimmerTree = new GlimmerTree({
      owner: this.getOwner(),
      retainObject: this.retainObject.bind(this),
      highlightRange: this._highlightRange.bind(this),
      objectInspector: this.get('objectInspector'),
      durations: this._durations,
      viewRegistry: this.get('viewRegistry')
    });
  },

  inspectComponentForNode(domNode) {
    let viewElem = this.findNearestView(domNode);
    if (!viewElem) {
      this.get('adapter').log('No Ember component found.');
      return;
    }

    this.sendMessage('inspectComponent', {
      viewId: viewElem.id
    });
  },

  updateDurations(durations) {
    for (let guid in durations) {
      if (!durations.hasOwnProperty(guid)) {
        continue;
      }
      this._durations[guid] = durations[guid];
    }

    this.glimmerTree.updateDurations(this._durations);
  },

  retainObject(object) {
    this.retainedObjects.push(object);
    return this.get('objectInspector').retainObject(object);
  },

  releaseCurrentObjects() {
    this.retainedObjects.forEach(item => {
      this.get('objectInspector').releaseObject(guidFor(item));
    });
    this.retainedObjects = [];
  },

  willDestroy() {
    this._super();
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousedown', this.lastClickedHandler);
    document.body.removeChild(layerDiv);
    document.body.removeChild(previewDiv);
    this.releaseCurrentObjects();
    this.stopInspecting();
  },

  inspectViewElement(objectId) {
    let view = this.get('objectInspector').sentObjects[objectId];
    if (view) {
      // In Octane we have access to bounds from the tree
      const bounds = get(view, 'bounds');
      // Before Octane, components generally had an element
      const element = get(view, 'element');

      if (bounds) {
        // Octane
        if (bounds.firstNode) {
          bounds.firstNode.setAttribute('data-inspector-selector', objectId);
          this.inspectElement(bounds.firstNode);
        }
      } else if (element) {
        // Pre-Octane
        element.setAttribute('data-inspector-selector', objectId);
        this.inspectElement(element);
      }
    }
  },

  /**
   * Opens the "Elements" tab and selects the given element. Doesn't work in all
   * browsers/addons (only in the Chrome and FF devtools addons at the time of writing).
   *
   * @method inspectElement
   * @param  {Element} element The element to inspect
   */
  inspectElement(element) {
    this.get('adapter').inspectElement(element);
  },

  sendTree() {
    run.scheduleOnce('afterRender', this, this.scheduledSendTree);
  },

  startInspecting() {
    let viewElem = null;
    this.sendMessage('startInspecting', {});

    // we don't want the preview div to intercept the mousemove event
    previewDiv.style.pointerEvents = 'none';

    let pinView = () => {
      if (viewElem) {
        this.glimmerTree.highlightLayer(viewElem.id);

        let view = this.get('objectInspector').sentObjects[viewElem.id];
        if (view instanceof Component) {
          this.get('objectInspector').sendObject(view);
          this.sendMessage('inspectComponent', { viewId: viewElem.id });
        }
      }
      this.stopInspecting();
      return false;
    };

    this.mousemoveHandler = (e) => {
      viewElem = this.findNearestView(e.target);

      if (viewElem) {
        this.glimmerTree.highlightLayer(viewElem.id, true);
      }
    };
    this.mousedownHandler = () => {
      // prevent app-defined clicks from being fired
      previewDiv.style.pointerEvents = '';
      previewDiv.addEventListener('mouseup', () => pinView(), { once: true });
    };
    this.mouseupHandler = () => pinView();
    document.body.addEventListener('mousemove', this.mousemoveHandler);
    document.body.addEventListener('mousedown', this.mousedownHandler);
    document.body.addEventListener('mouseup', this.mouseupHandler);
    document.body.style.cursor = '-webkit-zoom-in';
  },

  findNearestView(elem) {
    if (!elem) {
      return null;
    }
    if (elem.classList.contains('ember-view')) {
      return elem;
    }
    return this.findNearestView(elem.closest('.ember-view'));
  },

  stopInspecting() {
    document.body.removeEventListener('mousemove', this.mousemoveHandler);
    document.body.removeEventListener('mousedown', this.mousedownHandler);
    document.body.removeEventListener('mouseup', this.mouseupHandler);
    document.body.style.cursor = '';
    this.hidePreview();
    this.sendMessage('stopInspecting', {});
  },

  send() {
    if (this.isDestroying) {
      return;
    }
    this.releaseCurrentObjects();
    let tree = this.viewTree();
    if (tree) {
      this.sendMessage('viewTree', { tree });
    }
  },

  scheduledSendTree() {
    // needs to trigger on the trailing edge of the wait interval, otherwise it might happen
    // that we do not pick up fast route switching or 2 or more short rerenders
    throttle(this, this.send, 250, false);
  },

  viewTree() {
    let emberApp = this.getOwner();
    if (!emberApp) {
      return false;
    }

    // If we have the _captureRenderTree method, we should use it
    if (_captureRenderTree) {
      const [renderNode] = _captureRenderTree(emberApp);
      return makeRenderNodeCloneable(this.retainObject.bind(this), renderNode);
    } else {
      return this.glimmerTree.build();
    }
  },

  getOwner() {
    return this.get('namespace.owner');
  },

  // TODO: This method needs a serious refactor/cleanup
  _highlightRange(rect, options) {
    let div;
    let isPreview = options.isPreview;

    // take into account the scrolling position as mentioned in docs
    // https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect
    let styles = {
      display: 'block',
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      border: '2px solid rgb(102, 102, 102)',
      padding: '0',
      right: 'auto',
      direction: 'ltr',
      boxSizing: 'border-box',
      color: 'rgb(51, 51, 255)',
      fontFamily: 'Menlo, sans-serif',
      minHeight: '63px',
      zIndex: 10000,
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    };

    if (isPreview) {
      div = previewDiv;
    } else {
      this.hideLayer();
      div = layerDiv;
      this.hidePreview();
    }
    for (let prop in styles) {
      div.style[prop] = styles[prop];
    }
    let output = '';

    if (!isPreview) {
      output = '<span class=\'close\' data-label=\'layer-close\'>&times;</span>';
    }

    let template = options.template;

    if (template) {
      output += `<p class='template'><span>template</span>=<span data-label='layer-template'>${escapeHTML(template.name)}</span></p>`;
    }
    let view = options.view;
    let controller = options.controller;
    if (!view || !(view.object instanceof Component)) {
      if (controller) {
        output += `<p class='controller'><span>controller</span>=<span data-label='layer-controller'>${escapeHTML(controller.name)}</span></p>`;
      }
      if (view) {
        output += `<p class='view'><span>view</span>=<span data-label='layer-view'>${escapeHTML(view.name)}</span></p>`;
      }
    } else {
      output += `<p class='component'><span>component</span>=<span data-label='layer-component'>${classify(escapeHTML(view.name)).replace(/\//g, '::')}</span></p>`;
    }

    let model = options.model;
    if (model) {
      output += `<p class='model'><span>model</span>=<span data-label='layer-model'>${escapeHTML(model.name)}</span></p>`;
    }
    div.innerHTML = output;

    for (let p of div.querySelectorAll('p')) {
      p.style.float = 'left';
      p.style.margin = 0;
      p.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      p.style.padding = '5px';
      p.style.color = 'rgb(0, 0, 153)';
    }
    for (let p of div.querySelectorAll('p.model')) {
      p.style.clear = 'left';
    }
    for (let p of div.querySelectorAll('p span:first-child')) {
      p.style.color = 'rgb(153, 153, 0)';
    }
    for (let p of div.querySelectorAll('p span:last-child')) {
      p.style.color = 'rgb(153, 0, 153)';
    }

    if (!isPreview) {
      let cancelEvent = function(e) {
        e.preventDefault();
        e.stopPropagation();
      };
      for (let span of div.querySelectorAll('span.close')) {
        span.style.float = 'right';
        span.style.margin = '5px';
        span.style.background = '#666';
        span.style.color = '#eee';
        span.style.fontFamily = 'helvetica, sans-serif';
        span.style.fontSize = '14px';
        span.style.width = '16px';
        span.style.height = '16px';
        span.style.lineHeight = '14px';
        span.style.borderRadius = '16px';
        span.style.textAlign = 'center';
        span.style.cursor = 'pointer';
        span.style.opacity = '0.5';
        span.style.fontWeight = 'normal';
        span.style.textShadow = 'none';
        span.addEventListener('click', (e) => {
          cancelEvent(e);
          this.hideLayer();
        });
        span.addEventListener('mouseup', cancelEvent);
        span.addEventListener('mousedown', cancelEvent);
      }
    }

    this._addClickListeners(div, view, 'component');
    this._addClickListeners(div, controller, 'controller');
    this._addClickListeners(div, view, 'view');

    for (let span of div.querySelectorAll('p.template span:last-child')) {
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => {
        if (view) {
          this.inspectViewElement(guidFor(view.object));
        } else if (options.element) {
          this.inspectElement(options.element);
        }
      });
    }


    if (model && model.object && ((model.object instanceof EmberObject) || typeOf(model.object) === 'array')) {
      this._addClickListeners(div, model, 'model');
    }
  },

  hideLayer() {
    layerDiv.style.display = 'none';
  },

  hidePreview() {
    previewDiv.style.display = 'none';
  },

  _addClickListeners(div, item, selector) {
    for (let span of div.querySelectorAll(`p.${selector} span:last-child`)) {
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => {
        this.get('objectInspector').sendObject(item.object);
      });
    }
  },

  viewRegistry: computed('namespace.owner', function() {
    return this.getOwner().lookup('-view-registry:main');
  }),
});

function escapeHTML(string) {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}
