import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { tracked } from '@glimmer/tracking';

import searchMatch from 'ember-inspector/utils/search-match';

export default class ComponentTreeController extends Controller {
  queryParams = ['pinned', 'previewing', 'query'];

  // Estimated height for each row
  itemHeight = 22;

  @controller application;
  @service port;

  @tracked query = '';
  @tracked isInspecting = false;
  @tracked renderItems = [];

  _store = Object.create(null);

  set renderTree(renderTree) {
    let { _store } = this;

    let store = Object.create(null);
    let renderItems = [];

    let flatten = (parent, renderNode) => {
      if (isInternalRenderNode(renderNode)) {
        renderNode.children.forEach(node => flatten(parent, node));
      } else {
        let item = _store[renderNode.id];

        if (item === undefined) {
          item = new RenderItem(this, parent, renderNode);
        } else {
          item.renderNode = renderNode;
        }

        store[renderNode.id] = item;

        renderItems.push(item);

        renderNode.children.forEach(node => flatten(item, node));
      }
    };

    renderTree.forEach(node => flatten(null, node));

    this._store = store;

    this.renderItems = renderItems;
  }

  findItem(id) {
    return this._store[id];
  }

  get currentItem() {
    if (this.previewing) {
      return this.findItem(this.previewing);
    } else if (this.pinned) {
      return this.findItem(this.pinned);
    } else {
      return undefined;
    }
  }

  get matchingItems() {
    let { renderItems, query } = this;

    if (query) {
      let match = item => searchMatch(item.name, query) || item.childItems.some(match);
      renderItems = renderItems.filter(match);
    }

    return renderItems;
  }

  get visibleItems() {
    return this.matchingItems.filter(item => item.isVisible);
  }

  @tracked _pinned = undefined;

  get pinned() {
    return this._pinned;
  }

  set pinned(id) {
    if (this.pinned === id) {
      return;
    }

    let item = this.findItem(id);

    if (item) {
      this._pinned = id;
      this._previewing = undefined;

      item.show();

      if (item.hasInstance) {
        this.port.send('objectInspector:inspectById', { objectId: item.instance });
      } else {
        this.application.hideInspector();
      }
    } else {
      this._pinned = undefined;
      this._previewing = undefined;

      this.port.send('view:hideInspection');
      this.application.hideInspector();
    }

    this.syncInspection();
  }

  @tracked _previewing = undefined;

  get previewing() {
    return this._previewing;
  }

  set previewing(id) {
    let { pinned, previewing } = this;

    if ((pinned && pinned === id) || previewing === id) {
      return;
    }

    let item = this.findItem(id);

    if (item) {
      this._previewing = id;
      item.show();
    } else {
      this._previewing = undefined;
    }

    this.syncInspection();
  }

  syncInspection() {
    debounce(this, this._syncInspection, 50);
  }

  _syncInspection() {
    let { pinned, previewing } = this;

    if (previewing) {
      this.port.send('view:showInspection', { id: previewing, pin: false });
    } else if (pinned) {
      this.port.send('view:showInspection', { id: pinned, pin: true });
    } else {
      this.port.send('view:hideInspection');
    }
  }

  cancelSelection(id, pinned) {
    if (pinned && this.pinned === id) {
      this.pinned = undefined;
    } else if (!pinned && (this.previewing === id || this.previewing === undefined)) {
      this.previewing = undefined;
    }
  }

  @action toggleInspect() {
    this.port.send('view:inspectViews', { inspect: !this.isInspecting });
  }

  @action expandAll() {
    this.renderItems.forEach(item => item.expand());
  }

  @action collapseAll() {
    this.renderItems.forEach(item => item.collapse());
  }
}

function isInternalRenderNode(renderNode) {
  return renderNode.type === 'outlet' && renderNode.name === 'main' ||
    renderNode.type === 'route-template' && renderNode.name === '-top-level';
}

class RenderItem {
  @tracked isExpanded = true;

  constructor(controller, parentItem, renderNode) {
    this.controller = controller;
    this.parentItem = parentItem;
    this.renderNode = renderNode;
  }

  get id() {
    return this.renderNode.id;
  }

  get isOutlet() {
    return this.renderNode.type === 'outlet';
  }

  get isEngine() {
    return this.renderNode.type === 'engine';
  }

  get isRouteTemplate() {
    return this.renderNode.type === 'route-template';
  }

  get isComponent() {
    return this.renderNode.type === 'component';
  }

  get name() {
    return this.renderNode.name;
  }

  get hasInstance() {
    let { instance } = this.renderNode;
    return typeof instance === 'object' && instance !== null;
  }

  get instance() {
    if (this.hasInstance) {
      return this.renderNode.instance.id;
    } else {
      return null;
    }
  }

  get hasBounds() {
    return this.renderNode.bounds !== null;
  }

  get isRoot() {
    return this.parentItem === null;
  }

  get level() {
    if (this.isRoot) {
      return 0;
    } else {
      return this.parentItem.level + 1;
    }
  }

  get hasChildren() {
    return this.childItems.length > 0;
  }

  get childItems() {
    return this.renderNode.children
      .filter(child => !isInternalRenderNode(child))
      .map(child => this.controller.findItem(child.id));
  }

  get isVisible() {
    if (this.isRoot) {
      return true;
    } else {
      return this.parentItem.isVisible && this.parentItem.isExpanded;
    }
  }

  get isSelected() {
    return this.id === this.controller.pinned;
  }

  get isHighlighted() {
    return this.id === this.controller.previewing;
  }

  get style() {
    let indentation = 25;

    indentation += this.level * 20;

    if (this.hasChildren) {
      // folding triangle
      indentation -= 12;
    }

    return htmlSafe(`padding-left: ${indentation}px`);
  }

  @action showPreview() {
    this.controller.previewing = this.id;
  }

  @action hidePreview() {
    if (this.isHighlighted) {
      this.controller.previewing = undefined;
    }
  }

  @action toggleInspection() {
    if (this.isSelected) {
      this.controller.pinned = undefined;
    } else {
      this.controller.pinned = this.id;
    }
  }

  @action toggleExpansion(event) {
    event.stopPropagation();

    if (this.isExpanded) {
      this.collapse(event.altKey);
    } else {
      this.expand(event.altKey);
    }
  }

  @action scrollIntoView() {
    event.stopPropagation();

    this.send('view:scrollIntoView', { id: this.id });
  }

  @action inspectElement() {
    event.stopPropagation();

    this.send('view:inspectElement', { id: this.id });
  }

  show() {
    let item = this.parent;

    while (item) {
      item.expand();
      item = item.parent;
    }
  }

  expand(deep = false) {
    this.isExpanded = true;

    if (deep === true) {
      this.childItems.forEach(child => child.expand(true));
    }
  }

  collapse(deep = false) {
    this.isExpanded = false;

    if (deep === true) {
      this.childItems.forEach(child => child.collapse(true));
    }
  }

  send(message, payload) {
    this.controller.port.send(message, payload);
  }
}
