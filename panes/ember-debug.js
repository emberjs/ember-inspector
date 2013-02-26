/*jshint boss:true*/
(function() {

if (Ember.Debug) { return; }

console.debug("Ember Debugger Active");

var sentObjects = {},
    boundObservers = {};

if (document.readyState === 'complete') {
  activateDebugger();
} else {
  document.addEventListener('DOMContentLoaded', activeDebugger);
}

function retainObject(object) {
  var meta = Ember.meta(object),
      guid = Ember.guidFor(object);

  meta._debugReferences = meta._debugReferences || 0;
  meta._debugReferences++;

  sentObjects[guid] = object;

  return guid;
}

function releaseObject(objectId) {
  var object = sentObjects[objectId];

  var meta = Ember.meta(object),
      guid = Ember.guidFor(object);

  meta._debugReferences--;

  if (meta._debugReferences === 0) {
    dropObject(guid);
  }
}

function dropObject(objectId) {
  var observers = boundObservers[objectId],
      object = sentObjects[objectId];

  if (observers) {
    observers.forEach(function(observer) {
      Ember.removeObserver(object, observer.property, observer.handler);
    });
  }

  delete boundObservers[objectId];
  delete sentObjects[objectId];
}

function activateDebugger() {
  var port;

  var channel = new MessageChannel(), port1 = channel.port1;
  window.postMessage('debugger-client', [channel.port2], '*');

  port1.addEventListener('message', function(event) {
    var message = event.data, value;

    if (message.type === 'calculate') {
      value = valueForObjectProperty(message.objectId, message.property, message.mixinIndex);
      port1.postMessage(value);
      bindPropertyToDebugger(message);
    } else if (message.type === 'digDeeper') {
      value = digIntoObject(message.objectId, message.property);
      if (value) { port1.postMessage(value); }
    } else if (message.type === 'releaseObject') {
      releaseObject(message.objectId);
    } else if (message.type === 'showLayer') {
      showLayer(message.objectId);
    } else if (message.type === 'hideLayer') {
      hideLayer();
    } else if (message.type === 'getTree') {
      console.log('getTree');
      sendTree();
    }
  });

  port1.start();

  function bindPropertyToDebugger(message) {
    var objectId = message.objectId,
        property = message.property,
        mixinIndex = message.mixinIndex;

    var object = sentObjects[objectId];

    function handler() {
      var value = Ember.get(object, property);

      port1.postMessage({
        from: 'inspectedWindow',
        objectId: objectId,
        property: property,
        value: inspect(value),
        mixinIndex: mixinIndex
      });
    }

    Ember.addObserver(object, property, handler);
    boundObservers[objectId] = boundObservers[objectId] || [];
    boundObservers[objectId].push({ property: property, handler: handler });
  }

  function mixinsForObject(object) {
    var mixins = Ember.Mixin.mixins(object),
        mixinDetails = [];

    var ownProps = propertiesForMixin({ mixins: [{ properties: object }] });
    mixinDetails.push({ name: "Own Properties", properties: ownProps });

    mixins.forEach(function(mixin) {
      mixin.toString();
      var name = mixin[Ember.NAME_KEY] || mixin.ownerConstructor || Ember.guidFor(name);
      mixinDetails.push({ name: name.toString(), properties: propertiesForMixin(mixin) });
    });

    applyMixinOverrides(mixinDetails);

    return { objectId: retainObject(object), mixins: mixinDetails };
  }

  function valueForObjectProperty(objectId, property, mixinIndex) {
    var object = sentObjects[objectId], value;

    if (object.isDestroying) {
      value = '<DESTROYED>';
    } else {
      value = object.get(property);
    }

    return { from: 'inspectedWindow', objectId: objectId, property: property, value: inspect(value), mixinIndex: mixinIndex };
  }

  function digIntoObject(objectId, property) {
    var parentObject = sentObjects[objectId],
        object = Ember.get(parentObject, property);

    if (object instanceof Ember.Object) {
      var details = mixinsForObject(object);
      port1.postMessage({ from: 'inspectedWindow', parentObject: objectId, property: property, objectId: details.objectId, name: object.toString(), details: details.mixins });
    } else {
      console.log(object);
    }
  }

  Ember.Debug = Ember.Namespace.create();

  Ember.Debug.mixinsForObject = function(object) {
    var details = mixinsForObject(object);
    port1.postMessage({ from: 'inspectedWindow', objectId: details.objectId, name: object.toString(), details: details.mixins });
  };

  Ember.Debug.valueForObjectProperty = valueForObjectProperty;

  function applyMixinOverrides(mixinDetails) {
    var seen = {};

    mixinDetails.forEach(function(detail) {
      detail.properties.forEach(function(property) {
        if (Object.prototype.hasOwnProperty(property.name)) { return; }

        if (seen[property.name]) {
          property.overridden = seen[property.name];
          delete property.value.computed;
        }

        seen[property.name] = detail.name;
      });
    });
  }

  function propertiesForMixin(mixin) {
    var seen = {}, properties = [];

    mixin.mixins.forEach(function(mixin) {
      if (mixin.properties) {
        addProperties(properties, mixin.properties);
      }
    });

    return properties;
  }

  function addProperties(properties, hash) {
    for (var prop in hash) {
      if (!hash.hasOwnProperty(prop)) { continue; }
      if (prop.charAt(0) === '_') { continue; }
      if (isMandatorySetter(hash, prop)) { continue; }

      replaceProperty(properties, prop, hash[prop]);
    }
  }

  function isMandatorySetter(object, prop) {
    var descriptor = Object.getOwnPropertyDescriptor(object, prop);
    if (descriptor.set && descriptor.set === Ember.MANDATORY_SETTER_FUNCTION) {
      return true;
    }
  }

  function replaceProperty(properties, name, value) {
    var found, type;

    for (var i=0, l=properties.length; i<l; i++) {
      if (properties[i].name === name) {
        found = i;
        break;
      }
    }

    if (found) { properties.splice(i, 1); }

    if (name) {
      type = name.PrototypeMixin ? 'ember-class' : 'ember-mixin';
    }

    properties.push({ name: name, value: inspectValue(value) });
  }

  function inspectValue(value) {
    var string;

    if (value instanceof Ember.Object) {
      return { type: "type-ember-object", inspect: value.toString() };
    } else if (value instanceof Ember.ComputedProperty) {
      string = "<computed>";
      return { type: "type-descriptor", inspect: string, computed: true };
    } else if (value instanceof Ember.Descriptor) {
      return { type: "type-descriptor", inspect: value.toString(), computed: true };
    } else {
      return { type: "type-" + Ember.typeOf(value), inspect: inspect(value) };
    }
  }

  function inspect(value) {
    if (typeof value === 'function') {
      return "function() { ... }";
    } else if (value instanceof Ember.Object) {
      return value.toString();
    } else if (Ember.typeOf(value) === 'array') {
      if (value.length === 0) { return '[]'; }
      else if (value.length === 1) { return '[ ' + inspect(value[0]) + ' ]'; }
      else { return '[ ' + inspect(value[0]) + ', ... ]'; }
    } else {
      return Ember.inspect(value);
    }
  }

  function viewTree() {
    var rootView = Ember.View.views[Ember.$('.ember-application > .ember-view').attr('id')];
    var retained = [];

    var children = [];
    var treeId = retainObject(retained);

    var tree = { value: inspectView(rootView, retained), children: children, treeId: treeId };

    appendChildren(rootView, children, retained);

    return tree;
  }

  function appendChildren(view, children, retained) {
    var childViews = view.get('_childViews'),
        controller = view.get('controller');

    childViews.forEach(function(childView) {
      if (!(childView instanceof Ember.Object)) { return; }

      if (childView.get('controller') !== controller) {
        var grandChildren = [];
        children.push({ value: inspectView(childView, retained), children: grandChildren });
        appendChildren(childView, grandChildren, retained);
      } else {
        appendChildren(childView, children, retained);
      }
    });
  }

  function dropTree(retainedTree) {
    retainedTree.forEach(function(id) {
      dropObject(id);
    });

    dropObject(retainedTree);
  }

  Ember.Debug.viewTree = viewTree;

  function sendTree() {
    var tree = viewTree();

    port1.postMessage({
      from: 'inspectedWindow',
      type: 'viewTree',
      tree: tree
    });
  }

  Ember.Debug.sendTree = sendTree;

  Ember.View.addMutationListener(function() {
    sendTree();
    hideLayer();
  });
}

var div = document.createElement('div');
div.style.display = 'none';
document.body.appendChild(div);

var highlightedElement;

Ember.$(window).resize(function() {
  if (highlightedElement) {
    Ember.Debug.highlightView(highlightedElement);
  }
});

function virtualRange(view) {
  var morph = view.get('morph'),
      startId = morph.start,
      endId = morph.end;

  var range = document.createRange();
  range.setStartAfter(Ember.$('#' + startId)[0]);
  range.setEndBefore(Ember.$('#' + endId)[0]);

  return range;
}

function showLayer(objectId) {
  Ember.Debug.highlightView(sentObjects[objectId]);
}

function hideLayer() {
  div.style.display = 'none';
}

Ember.Debug.highlightView = function(element) {
  var range, view, rect;

  highlightedElement = element;

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
    view = Ember.Views.views[element.id];
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

  var output = "<span class='close'>x</span>";

  if (templateName) {
    output += "<p class='template'><span>template</span>=<span>" + escapeHTML(templateName) + "</span></p>";
  }

  output += "<p class='controller'><span>controller</span>=<span>" + escapeHTML(controllerName(controller)) + "</span></p>";

  if (model) {
    output += "<p class='model'><span>model</span>=<span>" + escapeHTML(model.toString()) + "</span></p>";
  }

  Ember.$(div).html(output);

  Ember.$('p', div).css({ float: 'left', margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
  Ember.$('p.model', div).css({ clear: 'left' });
  Ember.$('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
  Ember.$('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });
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
    hideLayer();
  });

  Ember.$('p.controller span:last-child', div).css({ cursor: 'pointer' }).click(function() {
    Ember.Debug.mixinsForObject(controller);
  });

  Ember.$('p.model span:last-child', div).css({ cursor: 'pointer' }).click(function() {
    Ember.Debug.mixinsForObject(controller.get('model'));
  });
};

function escapeHTML(string) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}

function inspectView(view, retained) {
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

  var viewId = retainObject(view);
  retained.push(viewId);

  return { viewClass: viewClass, objectId: viewId, name: name, template: templateName || '(inline)', tagName: tagName, controller: controllerName(view.get('controller')) };
}

function inspectController(controller) {
  return controller.get('_debugContainerKey') || controller.toString();
}

function controllerName(controller) {
  var key = controller.get('_debugContainerKey'),
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

  return name;
}

})();
