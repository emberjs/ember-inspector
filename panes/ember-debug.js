/*jshint boss:true*/
(function() {

if (Ember.Debug) { return; }

console.debug("Ember Debugger Active");

if (document.readyState === 'complete') {
  activateDebugger();
} else {
  document.addEventListener('DOMContentLoaded', activeDebugger);
}

var sentObjects = {},
    boundObservers = {},
    sentObjectId = 0;

function retainObject(object) {
  sentObjects[++sentObjectId] = object;
  return sentObjectId;
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
    } else if (message.type === 'dropObject') {
      dropObject(message.objectId);
    } else if (message.type === 'showLayer') {
      showLayer(message.objectId);
    } else if (message.type === 'hideLayer') {
      hideLayer();
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
      if (!value._dependentKeys) { string = "<computed>"; }
      else { string = "<computed> \u27a4 " + value._dependentKeys.join(", "); }
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

    var children = [];
    var tree = { value: inspectView(rootView), children: children };

    appendChildren(rootView, children);

    return tree;
  }

  function appendChildren(view, children) {
    var childViews = view.get('_childViews'),
        controller = view.get('controller');

    childViews.forEach(function(childView) {
      if (!(childView instanceof Ember.Object)) { return; }

      if (childView.get('controller') !== controller) {
        var grandChildren = [];
        children.push({ value: inspectView(childView), children: grandChildren });
        appendChildren(childView, grandChildren);
      } else {
        appendChildren(childView, children);
      }
    });
  }

  Ember.Debug.viewTree = viewTree;

  Ember.Debug.sendViewTree = function() {
    var tree = viewTree();

    port1.postMessage({
      from: 'inspectedWindow',
      type: 'viewTree',
      tree: tree
    });
  };
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
      controller = view.get('controller');

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

  Ember.$(div).html("<p><span>template</span>=<span>" + escapeHTML(templateName || '(inline)') + "</p>" +
                    "<p><span>controller</span>=<span>" + escapeHTML(inspectController(controller)) + "</p>");

  Ember.$('p', div).css({ margin: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '5px', color: 'rgb(0, 0, 153)' });
  Ember.$('p span:first-child', div).css({ color: 'rgb(153, 153, 0)' });
  Ember.$('p span:last-child', div).css({ color: 'rgb(153, 0, 153)' });

  Ember.$('p:last-child', div).css({ cursor: 'pointer' }).click(function() {
    Ember.Debug.mixinsForObject(controller);
  });
};

function escapeHTML(string) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
}

function inspectView(view) {
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

  return { viewClass: viewClass, objectId: retainObject(view), name: name, template: templateName || '(inline)', tagName: tagName, controller: inspectController(view.get('controller')) };
}

function inspectController(controller) {
  return controller.get('_debugContainerKey') || controller.toString();
}

})();
