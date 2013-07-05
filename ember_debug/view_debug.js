import "mixins/port_mixin" as PortMixin;

var layerDiv,
    previewDiv,
    highlightedElement,
    previewedElement;

var ViewDebug = Ember.Object.extend(PortMixin, {

  namespace: null,

  port: Ember.computed.alias('namespace.port'),

  objectInspector: Ember.computed.alias('namespace.objectInspector'),

  init: function() {
    this._super();
    var self = this;

    this.viewListener();

    layerDiv = Ember.$('<div>').appendTo('body').get(0);
    layerDiv.style.display = 'none';
    layerDiv.setAttribute('data-label', 'layer-div');

    previewDiv = Ember.$('<div>').appendTo('body').get(0);
    previewDiv.style.display = 'none';
    previewDiv.setAttribute('data-label', 'preview-div');

    Ember.$(window).on('resize.' + this.get('eventNamespace'), function() {
      if (highlightedElement) {
        self.highlightView(highlightedElement);
      }
    });

  },

  eventNamespace: Ember.computed(function() {
    return 'view_debug_' + Ember.guidFor(this);
  }),

  willDestroy: function() {
    this._super();
    Ember.$(window).off(this.get('eventNamespace'));
    Ember.$(layerDiv).remove();
    Ember.$(previewDiv).remove();
    Ember.View.removeMutationListener(this.viewTreeChanged);
  },

  portNamespace: 'view',

  messages: {
    getTree: function() {
      this.sendTree();
    },
    hideLayer: function() {
      this.hideLayer();
    },
    showLayer: function(message) {
      this.showLayer(message.objectId);
    },
    previewLayer: function(message) {
      this.previewLayer(message.objectId);
    },
    hidePreview: function(message) {
      this.hidePreview(message.objectId);
    }
  },

  sendTree: function() {
    var tree = this.viewTree();
    if (tree) {
      this.sendMessage('viewTree', {
        tree: tree
      });
    }
  },

  viewListener: function() {
    var self = this;

    this.viewTreeChanged = function() {
      Em.run.schedule('afterRender', function() {
        self.sendTree();
        self.hideLayer();
      });
    };
    Ember.View.addMutationListener(this.viewTreeChanged);
  },

  viewTree: function() {
     var rootView = Ember.View.views[Ember.$('.ember-application > .ember-view').attr('id')];
      // In case of App.reset view is destroyed
      if (!rootView) {
        return false;
      }
      var retained = [];

      var children = [];
      var treeId = this.get('objectInspector').retainObject(retained);

      var tree = { value: this.inspectView(rootView, retained), children: children, treeId: treeId };

      this.appendChildren(rootView, children, retained);


      return tree;
  },

  inspectView: function(view, retained) {
    var templateName = view.get('templateName') || view.get('_debugTemplateName'),
        viewClass = view.constructor.toString(), match, name;

    if (viewClass.match(/\._/)) {
      viewClass = "virtual";
    } else if (match = viewClass.match(/\(subclass of (.*)\)/)) {
      viewClass = match[1];
    }

    var tagName = view.get('tagName');
    if (tagName === '') {
      tagName = '(virtual)';
    }

    tagName = tagName || 'div';

    if (templateName) {
      name = templateName;
    } else {
      var controller = view.get('controller'),
          key = controller.get('_debugContainerKey'),
          className = controller.constructor.toString();

      if (key) {
        name = key.split(':')[1];
      } else {
        if (className.charAt(0) === '(') {
          className = className.match(/^\(subclass of (.*)\)/)[1];
        }
        name = className.split('.')[1];
        name = name.charAt(0).toLowerCase() + name.substr(1);
      }
    }

    var viewId = this.get('objectInspector').retainObject(view);
    retained.push(viewId);

    return { viewClass: viewClass, objectId: viewId, name: name, template: templateName || '(inline)', tagName: tagName, controller: controllerName(view.get('controller')) };
  },

  appendChildren: function(view, children, retained) {
    var self = this;
    var childViews = view.get('_childViews'),
        controller = view.get('controller');

    childViews.forEach(function(childView) {
      if (!(childView instanceof Ember.Object)) { return; }

      if (childView.get('controller') !== controller) {
        var grandChildren = [];
        children.push({ value: self.inspectView(childView, retained), children: grandChildren });
        self.appendChildren(childView, grandChildren, retained);
      } else {
        self.appendChildren(childView, children, retained);
      }
    });
  },

  highlightView: function(element, preview) {
    var self = this;
    var range, view, rect, div;

    if (preview) {
      previewedElement = element;
      div = previewDiv;
    } else {
      highlightedElement = element;
      div = layerDiv;
      this.hidePreview();
    }

    if (element instanceof Ember.View && element.get('isVirtual')) {
      view = element;
      if (view.get('isVirtual')) {
        range = virtualRange(view);
        rect = range.getBoundingClientRect();
      }
    } else if (element instanceof Ember.View) {
      view = element;
      rect = view.get('element').getBoundingClientRect();
    } else {
      view = Ember.View.views[element.id];
      rect = element.getBoundingClientRect();
    }

    var templateName = view.get('templateName') || view.get('_debugTemplateName'),
        controller = view.get('controller'),
        model = controller && controller.get('model');

    Ember.$(div).css(rect);
    Ember.$(div).css({
      display: "block",
      position: "absolute",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      border: "2px solid rgb(102, 102, 102)",
      padding: "0",
      boxSizing: "border-box",
      color: "rgb(51, 51, 255)",
      fontFamily: "Menlo, sans-serif",
      minHeight: 63,
      zIndex: 10000
    });

    var output = "";

    if (!preview) {
      output = "<span class='close' data-label='layer-close'>x</span>";
    }

    if (templateName) {
      output += "<p class='template'><span>template</span>=<span data-label='layer-template'>" + escapeHTML(templateName) + "</span></p>";
    }

    output += "<p class='controller'><span>controller</span>=<span data-label='layer-controller'>" + escapeHTML(controllerName(controller)) + "</span></p>";

    if (model) {
      output += "<p class='model'><span>model</span>=<span data-label='layer-model'>" + escapeHTML(model.toString()) + "</span></p>";
    }

    Ember.$(div).html(output);

    Ember.$('p', div).css({ float: 'left', margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
    Ember.$('p.model', div).css({ clear: 'left' });
    Ember.$('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
    Ember.$('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });

    if (!preview) {
      Ember.$('span.close', div).css({
        float: 'right',
        margin: '5px',
        background: '#666',
        color: '#eee',
        fontFamily: 'Menlo',
        fontSize: '12px',
        width: 13,
        height: 13,
        lineHeight: '12px',
        borderRadius: 12,
        textAlign: 'center',
        fontWeight: 'bold',
        cursor: 'pointer'
      }).on('click', function() {
        self.hideLayer();
      });
    }

    Ember.$('p.controller span:last-child', div).css({ cursor: 'pointer' }).click(function() {
      self.get('objectInspector').sendObject(controller);
    });

    Ember.$('p.model span:last-child', div).css({ cursor: 'pointer' }).click(function() {
      self.get('objectInspector').sendObject(controller.get('model'));
    });
  },

  showLayer: function(objectId) {
    this.highlightView(this.get('objectInspector').sentObjects[objectId]);
  },

  previewLayer: function(objectId) {
    this.highlightView(this.get('objectInspector').sentObjects[objectId], true);
  },

  hideLayer: function() {
    layerDiv.style.display = 'none';
    highlightedElement = null;
  },

  hidePreview: function() {
    previewDiv.style.display = 'none';
    previewedElement = null;
  }
});


function controllerName(controller) {
  var key = controller.get('_debugContainerKey'),
      className = controller.constructor.toString(),
      name;

  if (key) {
    name = key.split(':')[1];
  } else {
    if (className.charAt(0) === '(') {
      className = className.match(/^\(subclass of (.*)\)/)[1];
    }
    name = className.split('.')[1];
    name = name.charAt(0).toLowerCase() + name.substr(1);
  }

  return name;
}

function escapeHTML(string) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}

function virtualRange(view) {
  var morph = view.get('morph'),
      startId = morph.start,
      endId = morph.end;

  var range = document.createRange();
  range.setStartAfter(Ember.$('#' + startId)[0]);
  range.setEndBefore(Ember.$('#' + endId)[0]);

  return range;
}


export = ViewDebug;
