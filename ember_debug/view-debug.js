/* eslint no-cond-assign:0 */
import PortMixin from "ember-debug/mixins/port-mixin";

const Ember = window.Ember;
const { guidFor, $, computed, run, Object: EmberObject, View, typeOf, Component, ViewUtils, A } = Ember;
const { later } = run;
const { oneWay } = computed;

const keys = Object.keys || Ember.keys;

let layerDiv,
    previewDiv,
    highlightedElement;

export default EmberObject.extend(PortMixin, {

  namespace: null,

  application: oneWay('namespace.application').readOnly(),
  adapter: oneWay('namespace.adapter').readOnly(),
  port: oneWay('namespace.port').readOnly(),
  objectInspector: oneWay('namespace.objectInspector').readOnly(),

  retainedObjects: [],

  _durations: {},

  options: {},

  portNamespace: 'view',

  messages: {
    getTree() {
      this.sendTree();
    },
    hideLayer() {
      this.hideLayer();
    },
    showLayer(message) {
      // >= Ember 1.13
      if (message.renderNodeId !== undefined) {
        this._highlightNode(this.get('_lastNodes').objectAt(message.renderNodeId), false);
      } else {
        // < Ember 1.13
        this.showLayer(message.objectId);
      }
    },
    previewLayer(message) {
      // >= Ember 1.13
      if (message.renderNodeId !== undefined) {
        this._highlightNode(this.get('_lastNodes').objectAt(message.renderNodeId), true);
      } else {
        // < Ember 1.13
        this.previewLayer(message.objectId);
      }

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
    inspectElement(message) {
      this.inspectElement(message.objectId);
    },
    setOptions(message) {
      this.set('options', message.options);
      this.sendTree();
    },
    sendModelToConsole(message) {
      let model;
      if (message.renderNodeId) {
        // >= Ember 1.13
        const renderNode = this.get('_lastNodes').objectAt(message.renderNodeId);
        model = this._modelForNode(renderNode);
      } else {
        // < Ember 1.13
        const view = this.get('objectInspector').sentObjects[message.viewId];
        model = this.modelForView(view);
      }
      if (model) {
        this.get('objectInspector').sendValueToConsole(model);
      }
    }
  },

  init() {
    this._super();

    this.viewListener();
    this.retainedObjects = [];
    this.options = {};

    layerDiv = $('<div>').appendTo('body').get(0);
    layerDiv.style.display = 'none';
    layerDiv.setAttribute('data-label', 'layer-div');

    previewDiv = $('<div>').appendTo('body').css('pointer-events', 'none').get(0);
    previewDiv.style.display = 'none';
    previewDiv.setAttribute('data-label', 'preview-div');

    $(window).on('resize.' + this.get('eventNamespace'), () => {
      if (highlightedElement) {
        this.highlightView(highlightedElement);
      }
    });
  },

  updateDurations(durations) {
    for (let guid in durations) {
      if (!durations.hasOwnProperty(guid)) {
        continue;
      }
      this._durations[guid] = durations[guid];
    }
    this.sendTree();
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
    return 'view_debug_' + guidFor(this);
  }),

  willDestroy() {
    this._super();
    $(window).off(this.get('eventNamespace'));
    $(layerDiv).remove();
    $(previewDiv).remove();
    this.get('_lastNodes').clear();
    this.releaseCurrentObjects();
    this.stopInspecting();
  },

  inspectElement(objectId) {
    let view = this.get('objectInspector').sentObjects[objectId];
    if (view && view.get('element')) {
      this.get('adapter').inspectElement(view.get('element'));
    }
  },

  sendTree() {
    run.scheduleOnce('afterRender', this, this.scheduledSendTree);
  },

  startInspecting() {
    let viewElem = null;
    this.sendMessage('startInspecting', {});

    // we don't want the preview div to intercept the mousemove event
    $(previewDiv).css('pointer-events', 'none');

    $('body').on('mousemove.inspect-' + this.get('eventNamespace'), e => {
      let originalTarget = $(e.target);
      viewElem = this.findNearestView(originalTarget);
      if (viewElem) {
        this.highlightView(viewElem, true);
      }
    })
    .on('mousedown.inspect-' + this.get('eventNamespace'), () => {
      // prevent app-defined clicks from being fired
      $(previewDiv).css('pointer-events', '')
      .one('mouseup', function() {
        // chrome
        return pinView();
      });
    })
    .on('mouseup.inspect-' + this.get('eventNamespace'), () => {
      // firefox
      return pinView();
    })
    .css('cursor', '-webkit-zoom-in');

    const pinView = () => {
      if (viewElem) {
        this.highlightView(viewElem);
        let view = this.get('objectInspector').sentObjects[viewElem.id];
        if (view instanceof Ember.Component) {
          this.get('objectInspector').sendObject(view);
        }
      }
      this.stopInspecting();
      return false;
    };
  },

  findNearestView(elem) {
    let viewElem, view;
    if (!elem || elem.length === 0) { return null; }
    if (elem.hasClass('ember-view')) {
      viewElem = elem.get(0);
      view = this.get('objectInspector').sentObjects[viewElem.id];
      if (view && this.shouldShowView(view)) {
        return viewElem;
      }
    }
    return this.findNearestView($(elem).parents('.ember-view:first'));
  },

  stopInspecting() {
    $('body')
    .off('mousemove.inspect-' + this.get('eventNamespace'))
    .off('mousedown.inspect-' + this.get('eventNamespace'))
    .off('mouseup.inspect-' + this.get('eventNamespace'))
    .off('click.inspect-' + this.get('eventNamespace'))
    .css('cursor', '');

    this.hidePreview();
    this.sendMessage('stopInspecting', {});
  },

  scheduledSendTree() {
    // Send out of band
    later(() => {
      if (this.isDestroying) {
        return;
      }
      this.releaseCurrentObjects();
      let tree = this.viewTree();
      if (tree) {
        this.sendMessage('viewTree', {
          tree: tree
        });
      }
    }, 50);
  },

  viewListener() {
    this.viewTreeChanged = () => {
      this.sendTree();
      this.hideLayer();
    };
  },

  viewTree() {
    let tree;
    let emberApp = this.get('application');
    if (!emberApp) {
      return false;
    }

    const applicationViewId = $(emberApp.rootElement).find('> .ember-view').attr('id');
    let rootView = this.get('viewRegistry')[applicationViewId];
    // In case of App.reset view is destroyed
    if (!rootView) {
      return false;
    }

    let children = [];

    if (!this._isGlimmer()) {
      // before Glimmer
      let retained = [];
      let treeId = this.retainObject(retained);
      tree = { value: this.inspectView(rootView, retained), children: children, treeId: treeId };
      this.appendChildren(rootView, children, retained);
    } else {
      this.get('_lastNodes').clear();
      let renderNode = rootView._renderNode;
      tree = { value: this._inspectNode(renderNode), children: children };
      this._appendNodeChildren(renderNode, children);
    }

    return tree;
  },

  modelForView(view) {
    const controller = view.get('controller');
    let model = controller.get('model');
    if (view.get('context') !== controller) {
      model = view.get('context');
    }
    return model;
  },


  inspectView(view, retained) {
    let templateName = view.get('templateName') || view.get('_debugTemplateName');
    let viewClass = shortViewName(view);
    let name;

    let tagName = view.get('tagName');
    if (tagName === '') {
      tagName = '(virtual)';
    }

    tagName = tagName || 'div';

    const controller = view.get('controller');

    name = viewDescription(view);

    const viewId = this.retainObject(view);
    retained.push(viewId);

    const timeToRender = this._durations[viewId];

    let value = {
      viewClass: viewClass,
      completeViewClass: viewName(view),
      objectId: viewId,
      duration: timeToRender,
      name: name,
      template: templateName || '(inline)',
      tagName: tagName,
      isVirtual: view.get('isVirtual'),
      isComponent: (view instanceof Component)
    };

    if (controller && !(view instanceof Component)) {
      value.controller = {
        name: shortControllerName(controller),
        completeName: controllerName(controller),
        objectId: this.retainObject(controller)
      };

      let model = this.modelForView(view);
      if (model) {
        if (EmberObject.detectInstance(model) || typeOf(model) === 'array') {
          value.model = {
            name: shortModelName(model),
            completeName: getModelName(model),
            objectId: this.retainObject(model),
            type: 'type-ember-object'
          };
        } else {
          value.model = {
            name: this.get('objectInspector').inspect(model),
            type: 'type-' + Ember.typeOf(model)
          };
        }
      }
    }

    return value;
  },

  appendChildren(view, children, retained) {
    const childViews = view.get('_childViews');

    childViews.forEach(childView => {
      if (!(childView instanceof EmberObject)) { return; }

      if (this.shouldShowView(childView)) {
        let grandChildren = [];
        children.push({ value: this.inspectView(childView, retained), children: grandChildren });
        this.appendChildren(childView, grandChildren, retained);
      } else {
        this.appendChildren(childView, children, retained);
      }
    });
  },

  shouldShowView(view) {
    return (this.options.allViews || this.hasOwnController(view) || this.hasOwnContext(view)) &&
        (this.options.components || !(view instanceof Component)) &&
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

  highlightView(element, isPreview) {
    let range, view, rect;

    if (!isPreview) {
      highlightedElement = element;
    }

    if (!element) { return; }


    if (element instanceof View) {
      view = element;
    } else {
      view = this.get('viewRegistry')[element.id];
    }

    let getViewBoundingClientRect = ViewUtils.getViewBoundingClientRect;
    if (getViewBoundingClientRect) {
      // Ember >= 1.9 support `getViewBoundingClientRect`
      rect = getViewBoundingClientRect(view);
    } else {
      // Support old Ember versions
      if (view.get('isVirtual')) {
        range = virtualRange(view);
        rect = range.getBoundingClientRect();
      } else {
        element = view.get('element');
        if (!element) { return; }
        rect = element.getBoundingClientRect();
      }
    }


    let templateName = view.get('templateName') || view.get('_debugTemplateName'),
        controller = view.get('controller'),
        model = controller && controller.get('model'),
        modelName;


    let options = {
      isPreview: isPreview,
      view: {
        name: viewName(view),
        object: view
      }
    };

    if (controller) {
      options.controller = {
        name: controllerName(controller),
        object: controller
      };
    }

    if (templateName) {
      options.template = {
        name: templateName
      };
    }

    if (model) {
      modelName = this.get('objectInspector').inspect(model);
      options.model = {
        name: modelName,
        object: model
      };
    }

    this._highlightRange(rect, options);
  },

  // TODO: This method needs a serious refactor/cleanup
  _highlightRange(rect, options) {
    let div;
    let isPreview = options.isPreview;

    // take into account the scrolling position as mentioned in docs
    // https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect
    rect = $.extend({}, rect);
    rect.top = rect.top + window.scrollY;
    rect.left = rect.left + window.scrollX;

    if (isPreview) {
      div = previewDiv;
    } else {
      this.hideLayer();
      div = layerDiv;
      this.hidePreview();
    }

    $(div).css(rect);
    $(div).css({
      display: "block",
      position: "absolute",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      border: "2px solid rgb(102, 102, 102)",
      padding: "0",
      right: "auto",
      direction: "ltr",
      boxSizing: "border-box",
      color: "rgb(51, 51, 255)",
      fontFamily: "Menlo, sans-serif",
      minHeight: 63,
      zIndex: 10000
    });

    let output = "";

    if (!isPreview) {
      output = "<span class='close' data-label='layer-close'>&times;</span>";
    }

    let template = options.template;

    if (template) {
      output += "<p class='template'><span>template</span>=<span data-label='layer-template'>" + escapeHTML(template.name) + "</span></p>";
    }
    let view = options.view;
    let controller = options.controller;
    if (!view ||!(view.object instanceof Ember.Component)) {
      if (controller) {
        output += "<p class='controller'><span>controller</span>=<span data-label='layer-controller'>" + escapeHTML(controller.name) + "</span></p>";
      }
      if (view) {
        output += "<p class='view'><span>view</span>=<span data-label='layer-view'>" + escapeHTML(view.name) + "</span></p>";
      }
    } else {
      output += "<p class='component'><span>component</span>=<span data-label='layer-component'>" + escapeHTML(view.name) + "</span></p>";
    }

    let model = options.model;
    if (model) {
      output += "<p class='model'><span>model</span>=<span data-label='layer-model'>" + escapeHTML(model.name) + "</span></p>";
    }

    $(div).html(output);

    $('p', div).css({ float: 'left', margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
    $('p.model', div).css({ clear: 'left' });
    $('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
    $('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });

    if (!isPreview) {
      $('span.close', div).css({
        float: 'right',
        margin: '5px',
        background: '#666',
        color: '#eee',
        fontFamily: 'helvetica, sans-serif',
        fontSize: '12px',
        width: 16,
        height: 16,
        lineHeight: '14px',
        borderRadius: 16,
        textAlign: 'center',
        cursor: 'pointer'
      }).on('click', () => {
        this.hideLayer();
        return false;
      }).on('mouseup mousedown', function() {
        // prevent re-pinning
        return false;
      });
    }

    $('p.view span:last-child', div).css({ cursor: 'pointer' }).click(() => {
      this.get('objectInspector').sendObject(view.object);
    });

    $('p.controller span:last-child', div).css({ cursor: 'pointer' }).click(() => {
      this.get('objectInspector').sendObject(controller.object);
    });

    $('p.component span:last-child', div).css({ cursor: 'pointer' }).click(() => {
      this.get('objectInspector').sendObject(view.object);
    });

    $('p.template span:last-child', div).css({ cursor: 'pointer' }).click(() => {
      this.inspectElement(guidFor(view.object));
    });

    if (model && model.object && ((model.object instanceof EmberObject) || typeOf(model.object) === 'array')) {
      $('p.model span:last-child', div).css({ cursor: 'pointer' }).click(() => {
        this.get('objectInspector').sendObject(model.object);
      });
    }
  },

  showLayer(objectId) {
    this.highlightView(this.get('objectInspector').sentObjects[objectId]);
  },

  previewLayer(objectId) {
    this.highlightView(this.get('objectInspector').sentObjects[objectId], true);
  },

  hideLayer() {
    layerDiv.style.display = 'none';
    highlightedElement = null;
  },

  hidePreview() {
    previewDiv.style.display = 'none';
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

  /**
   * @method isGlimmer
   * @return {Boolean}
   */
  _isGlimmer() {
    let id = keys(this.get('viewRegistry'))[0];
    return id && !this.get('viewRegistry')[id].get('_childViews');
  },

  viewRegistry: computed('application', function() {
    return this.get('application.__container__').lookup('-view-registry:main') || View.views;
  }),

  /**
   * Walk the render node hierarchy and build the tree.
   *
   * @param  {Object} renderNode
   * @param  {Array} children
   */
  _appendNodeChildren(renderNode, children) {
    let childNodes = renderNode.childNodes;
    if (!childNodes) { return; }
    childNodes.forEach(childNode => {
      if (this._shouldShowNode(childNode, renderNode)) {
        let grandChildren = [];
        children.push({ value: this._inspectNode(childNode), children: grandChildren});
        this._appendNodeChildren(childNode, grandChildren);
      } else {
        this._appendNodeChildren(childNode, children);
      }
    });
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
    return (this.options.allViews || this._nodeHasOwnController(renderNode, parentNode)) &&
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
    return !!renderNode.state.manager;
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
    return renderNode.lastResult.scope.locals.controller.value();
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
      viewClassName = shortViewName(viewClass);
      completeViewClassName = viewName(viewClass);
      tagName = viewClass.get('tagName') || 'div';
      viewId = this.retainObject(viewClass);
      timeToRender = this._durations[viewId];
    }

    name = this._nodeDescription(renderNode);

    let value = {
      template: this._nodeTemplateName(renderNode) || '(inline)',
      name: name,
      objectId: viewId,
      viewClass: viewClassName,
      duration: timeToRender,
      completeViewClass: completeViewClassName,
      isComponent: this._nodeIsEmberComponent(renderNode),
      tagName: tagName,
      isVirtual: !viewClass
    };


    let controller = this._controllerForNode(renderNode);
    if (controller && !(this._nodeIsEmberComponent(renderNode))) {
      value.controller = {
        name: shortControllerName(controller),
        completeName: controllerName(controller),
        objectId: this.retainObject(controller)
      };

      let model = this._modelForNode(renderNode);
      if (model) {
        if (EmberObject.detectInstance(model) || Ember.typeOf(model) === 'array') {
          value.model = {
            name: shortModelName(model),
            completeName: getModelName(model),
            objectId: this.retainObject(model),
            type: 'type-ember-object'
          };
        } else {
          value.model = {
            name: this.get('objectInspector').inspect(model),
            type: 'type-' + Ember.typeOf(model)
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
    return !!(viewInstance && (viewInstance instanceof Ember.Component));
  },

  /**
   * Highlight a render node on the screen.
   *
   * @param  {Object} renderNode
   * @param  {Boolean} isPreview (whether to pin the layer or not)
   */
  _highlightNode(renderNode, isPreview) {
    let modelName;
    // Todo: should be in Ember core
    let range = document.createRange();
    range.setStartBefore(renderNode.firstNode);
    range.setEndAfter(renderNode.lastNode);
    let rect = range.getBoundingClientRect();

    let options = {
      isPreview: isPreview
    };

    let controller = this._controllerForNode(renderNode);
    if (controller) {
      options.controller = {
        name: controllerName(controller),
        object: controller
      };
    }

    let templateName = this._nodeTemplateName(renderNode);
    if (templateName) {
      options.template = {
        name: templateName
      };
    }

    let model;
    if (controller) {
      model = controller.get('model');
    }
    if (model) {
      modelName = this.get('objectInspector').inspect(model);
      options.model = {
        name: modelName,
        object: model
      };
    }

    let view = this._viewInstanceForNode(renderNode);

    if (view) {
      options.view = {
        name: viewName(view),
        object: view
      };
    }

    this._highlightRange(rect, options);
  }
});

function viewName(view) {
  let name = view.constructor.toString(), match;
  if (name.match(/\._/)) {
    name = "virtual";
  } else if (match = name.match(/\(subclass of (.*)\)/)) {
    name = match[1];
  }
  return name;
}

function shortViewName(view) {
  let name = viewName(view);
  // jj-abrams-resolver adds `app@view:` and `app@component:`
  // Also `_debugContainerKey` has the format `type-key:factory-name`
  return name.replace(/.*(view|component):(?!$)/, '').replace(/:$/, '');
}

function getModelName(model) {
  let name = '<Unknown model>';
  if (model.toString) {
    name = model.toString();
  }


  if (name.length > 50) {
    name = name.substr(0, 50) + '...';
  }
  return name;
}

function shortModelName(model) {
  let name = getModelName(model);
  // jj-abrams-resolver adds `app@model:`
  return name.replace(/<[^>]+@model:/g, '<');
}

function controllerName(controller) {
  let
   className = controller.constructor.toString(), match;

  if (match = className.match(/^\(subclass of (.*)\)/)) {
    className = match[1];
  }

  return className;
}

function shortControllerName(controller) {
  let name = controllerName(controller);
  // jj-abrams-resolver adds `app@controller:` at the begining and `:` at the end
  return name.replace(/^.+@controller:/, '').replace(/:$/, '');
}

function escapeHTML(string) {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}

function virtualRange(view) {
  let start, end;
  let morph = view.get('morph');

  if (morph) {
    start = $('#' + morph.start)[0];
    end = $('#' + morph.end)[0];
  } else {
    // Support for metal-views
    morph = view.get('_morph');
    start = morph.start;
    end = morph.end;
  }

  let range = document.createRange();
  range.setStartAfter(start);
  range.setEndBefore(end);

  return range;
}

function viewDescription(view) {
  let templateName = view.get('templateName') || view.get('_debugTemplateName'),
      name, viewClass = shortViewName(view), controller = view.get('controller'),
      parentClassName;

  if (templateName) {
    name = templateName;
  } else if (view instanceof Ember.LinkView) {
    name = 'link';
  } else if (view.get('_parentView.controller') === controller || view instanceof Ember.Component) {
    let viewClassName = view.get('_debugContainerKey');
    if (viewClassName) {
      viewClassName = viewClassName.match(/\:(.*)/);
      if (viewClassName) {
        viewClassName = viewClassName[1];
      }
    }
    if (!viewClassName && viewClass) {
      viewClassName = viewClass.match(/\.(.*)/);
      if (viewClassName) {
        viewClassName = viewClassName[1];
      } else {
        viewClassName = viewClass;
      }

      let shortName = viewClassName.match(/(.*)(View|Component)$/);
      if (shortName) {
        viewClassName = shortName[1];
      }
    }
    if (viewClassName) {
      name = Ember.String.camelize(viewClassName);
    }
  } else if (view.get('_parentView.controller') !== controller) {
    let key = controller.get('_debugContainerKey'),
    className = controller.constructor.toString();

    if (key) {
      name = key.split(':')[1];
    } else {
      if (parentClassName = className.match(/^\(subclass of (.*)\)/)) {
        className = parentClassName[1];
      }
      name = className.split('.').pop();
      name = Ember.String.camelize(name);
    }
  }

  if (!name) {
    name = '(inline view)';
  }
  return name;
}
