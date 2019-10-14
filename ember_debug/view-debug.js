/* eslint no-cond-assign:0 */
import PortMixin from 'ember-debug/mixins/port-mixin';
import GlimmerTree from 'ember-debug/libs/glimmer-tree';
import {
  modelName as getModelName,
  shortModelName as getShortModelName,
  controllerName as getControllerName,
  shortControllerName as getShortControllerName,
  viewName as getViewName,
  shortViewName as getShortViewName
} from 'ember-debug/utils/name-functions';

const Ember = window.Ember;

const {
  guidFor,
  computed,
  run,
  Object: EmberObject,
  typeOf,
  Component,
  Controller,
  A,
  String
} = Ember;
const { throttle } = run;
const { readOnly } = computed;
const { classify } = String;

const keys = Object.keys || Ember.keys;

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

    inspectElement({ objectId, elementId }) {
      if (objectId) {
        this.inspectViewElement(objectId);
      } else {
        let element = document.getElementById(elementId);
        this.inspectElement(element);
      }
    },
    setOptions({ options }) {
      this.set('options', options);
      this.glimmerTree.updateOptions(options);
      this.sendTree();
    },
    sendModelToConsole(message) {
      const model = this.glimmerTree.modelForViewNodeValue(message);

      if (model) {
        this.get('objectInspector').sendValueToConsole(model);
      }
    },
    contextMenu() {
      this.inspectComponentForNode(this.lastClickedElement);
    }
  },

  init() {
    this._super(...arguments);

    this.retainedObjects = [];
    this.options = {};
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
      options: this.get('options'),
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

  eventNamespace: computed(function() {
    return `view_debug_${guidFor(this)}`;
  }),

  willDestroy() {
    this._super();
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousedown', this.lastClickedHandler);
    document.body.removeChild(layerDiv);
    document.body.removeChild(previewDiv);
    this.get('_lastNodes').clear();
    this.releaseCurrentObjects();
    this.stopInspecting();
  },

  inspectViewElement(objectId) {
    let view = this.get('objectInspector').sentObjects[objectId];
    if (view && view.get('element')) {
      this.inspectElement(view.get('element'));
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
    let emberApp = this.get('namespace.owner');
    if (!emberApp) {
      return false;
    }

    return this.glimmerTree.build();
  },

  getOwner() {
    return this.get('namespace.owner');
  },

  modelForView(view) {
    const controller = view.get('controller');
    let model = controller.get('model');
    if (view.get('context') !== controller) {
      model = view.get('context');
    }
    return model;
  },

  shouldShowView(view) {
    if (view instanceof Component) {
      return this.options.components;
    }
    return (this.hasOwnController(view) || this.hasOwnContext(view)) &&
      (!view.get('isVirtual') || this.hasOwnController(view) || this.hasOwnContext(view));
  },

  hasOwnController(view) {
    return view.get('controller') !== view.get('_parentView.controller') &&
      ((view instanceof Component) || !(view.get('_parentView.controller') instanceof Component));
  },

  hasOwnContext(view) {
    // Context switching is deprecated, we will need to find a better way for {{#each}} helpers.
    return view.get('context') !== view.get('_parentView.context') &&
      // make sure not a view inside a component, like `{{yield}}` for example.
      !(view.get('_parentView.context') instanceof Component);
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

  /**
   * List of render nodes from the last
   * sent view tree.
   *
   * @property lastNodes
   * @type {Array}
   */
  _lastNodes: computed(function() {
    return A([]);
  }),

  viewRegistry: computed('namespace.owner', function() {
    return this.getOwner().lookup('-view-registry:main');
  }),

  /**
   * Walk the render node hierarchy and build the tree.
   *
   * @param  {Object} renderNode
   * @param  {Array} children
   */
  _appendNodeChildren(renderNode, children) {
    let childNodes = this._childrenForNode(renderNode);
    if (!childNodes) {
      return;
    }
    childNodes.forEach(childNode => {
      if (this._shouldShowNode(childNode, renderNode)) {
        let grandChildren = [];
        children.push({ value: this._inspectNode(childNode), children: grandChildren });
        this._appendNodeChildren(childNode, grandChildren);
      } else {
        this._appendNodeChildren(childNode, children);
      }
    });
  },

  /**
   * Gather the children assigned to the render node.
   *
   * @param  {Object} renderNode
   * @return {Array} children
   */
  _childrenForNode(renderNode) {
    if (renderNode.morphMap) {
      return keys(renderNode.morphMap).map(key => renderNode.morphMap[key]).filter(node => !!node);
    } else {
      return renderNode.childNodes;
    }
  },

  /**
   * Whether a render node is elligible to be included
   * in the tree.
   * Depends on whether the node is actually a view node
   * (as opposed to an attribute node for example),
   * and also checks the filtering options. For example,
   * showing Ember component nodes can be toggled.
   *
   * @param  {Object} renderNode
   * @param  {Object} parentNode
   * @return {Boolean} `true` for show and `false` to skip the node
   */
  _shouldShowNode(renderNode, parentNode) {

    // Filter out non-(view/components)
    if (!this._nodeIsView(renderNode)) {
      return false;
    }
    // Has either a template or a view/component instance
    if (!this._nodeTemplateName(renderNode) && !this._nodeHasViewInstance(renderNode)) {
      return false;
    }
    return this._nodeHasOwnController(renderNode, parentNode) &&
      (this.options.components || !(this._nodeIsEmberComponent(renderNode))) &&
      (this._nodeHasViewInstance(renderNode) || this._nodeHasOwnController(renderNode, parentNode));
  },

  /**
   * The node's model. If the view has a controller,
   * it will be the controller's `model` property.s
   *
   * @param  {Object} renderNode
   * @return {Object} the model
   */
  _modelForNode(renderNode) {
    let controller = this._controllerForNode(renderNode);
    if (controller) {
      return controller.get('model');
    }
  },

  /**
   * Not all nodes are actually views/components.
   * Nodes can be attributes for example.
   *
   * @param  {Object} renderNode
   * @return {Boolean}
   */
  _nodeIsView(renderNode) {
    if (renderNode.getState) {
      return !!renderNode.getState().manager;
    } else {
      return !!renderNode.state.manager;
    }
  },

  /**
   * Check if a node has its own controller (as opposed to sharing
   * its parent's controller).
   * Useful to identify route views from other views.
   *
   * @param  {Object} renderNode
   * @param  {Object} parentNode
   * @return {Boolean}
   */
  _nodeHasOwnController(renderNode, parentNode) {
    return this._controllerForNode(renderNode) !== this._controllerForNode(parentNode);
  },

  /**
   * Check if the node has a view instance.
   * Virtual nodes don't have a view/component instance.
   *
   * @param  {Object} renderNode
   * @return {Boolean}
   */
  _nodeHasViewInstance(renderNode) {
    return !!this._viewInstanceForNode(renderNode);
  },


  /**
   * Returns the nodes' controller.
   *
   * @param  {Object} renderNode
   * @return {Ember.Controller}
   */
  _controllerForNode(renderNode) {
    // If it's a component then return the component instance itself
    if (this._nodeIsEmberComponent(renderNode)) {
      return this._viewInstanceForNode(renderNode);
    }
    if (renderNode.lastResult) {
      let scope = renderNode.lastResult.scope;
      let controller;
      if (scope.getLocal) {
        controller = scope.getLocal('controller');
      } else {
        controller = scope.locals.controller.value();
      }
      if ((!controller || !(controller instanceof Controller)) && scope.getSelf) {
        // Ember >= 2.2 + no ember-legacy-controllers addon
        controller = scope.getSelf().value();
        if (!(controller instanceof Controller)) {
          controller = controller._controller || controller.controller;
        }
      }
      return controller;
    }
  },

  /**
   * Inspect a node. This will return an object with all
   * the required properties to be added to the view tree
   * to be sent.
   *
   * @param  {Object} renderNode
   * @return {Object} the object containing the required values
   */
  _inspectNode(renderNode) {
    let name, viewClassName, completeViewClassName, tagName, viewId, timeToRender;

    let viewClass = this._viewInstanceForNode(renderNode);

    if (viewClass) {
      viewClassName = getShortViewName(viewClass);
      completeViewClassName = getViewName(viewClass);
      tagName = viewClass.get('tagName') || 'div';
      viewId = this.retainObject(viewClass);
      timeToRender = this._durations[viewId];
    }

    name = this._nodeDescription(renderNode);

    let value = {
      template: this._nodeTemplateName(renderNode) || '(inline)',
      name,
      objectId: viewId,
      viewClass: viewClassName,
      duration: timeToRender,
      completeViewClass: completeViewClassName,
      isComponent: this._nodeIsEmberComponent(renderNode),
      tagName,
      isVirtual: !viewClass
    };

    let controller = this._controllerForNode(renderNode);
    if (controller && !(this._nodeIsEmberComponent(renderNode))) {
      value.controller = {
        name: getShortControllerName(controller),
        completeName: getControllerName(controller),
        objectId: this.retainObject(controller)
      };

      let model = this._modelForNode(renderNode);
      if (model) {
        if (EmberObject.detectInstance(model) || typeOf(model) === 'array') {
          value.model = {
            name: getShortModelName(model),
            completeName: getModelName(model),
            objectId: this.retainObject(model),
            type: 'type-ember-object'
          };
        } else {
          value.model = {
            name: this.get('objectInspector').inspect(model),
            type: `type-${typeOf(model)}`
          };
        }
      }
    }

    value.renderNodeId = this.get('_lastNodes').push(renderNode) - 1;

    return value;
  },

  /**
   * Get the node's template name. Relies on an htmlbars
   * feature that adds the module name as a meta property
   * to compiled templates.
   *
   * @param  {Object} renderNode
   * @return {String} the template name
   */
  _nodeTemplateName(renderNode) {
    let template = renderNode.lastResult && renderNode.lastResult.template;
    if (template && template.meta && template.meta.moduleName) {
      return template.meta.moduleName.replace(/\.hbs$/, '');
    }
  },

  /**
   * The node's name. Should be anything that the user
   * can use to identity what node we are talking about.
   *
   * Usually either the view instance name, or the template name.
   *
   * @param  {Object} renderNode
   * @return {String}
   */
  _nodeDescription(renderNode) {
    let name;

    let viewClass = this._viewInstanceForNode(renderNode);

    if (viewClass) {
      //. Has a view instance - take the view's name
      name = viewClass.get('_debugContainerKey');
      if (name) {
        name = name.replace(/.*(view|component):/, '').replace(/:$/, '');
      }
    } else {
      // Virtual - no view instance
      let templateName = this._nodeTemplateName(renderNode);
      if (templateName) {
        return templateName.replace(/^.*templates\//, '').replace(/\//g, '.');
      }
    }

    // If application view was not defined, it uses a `toplevel` view
    if (name === 'toplevel') {
      name = 'application';
    }
    return name;
  },

  /**
   * Return a node's view instance.
   *
   * @param  {Object} renderNode
   * @return {Ember.View|Ember.Component} The view or component instance
   */
  _viewInstanceForNode(renderNode) {
    return renderNode.emberView;
  },

  /**
   * Returns whether the node is an Ember Component or not.
   *
   * @param  {Object} renderNode
   * @return {Boolean}
   */
  _nodeIsEmberComponent(renderNode) {
    let viewInstance = this._viewInstanceForNode(renderNode);
    return !!(viewInstance && (viewInstance instanceof Component));
  }
});

function escapeHTML(string) {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}
