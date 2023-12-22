import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

import searchMatch from 'ember-inspector/utils/search-match';
import { KEYS } from 'ember-inspector/utils/key-codes';

export default class ComponentTreeController extends Controller {
  queryParams = ['pinned', 'previewing', 'query'];

  // Estimated height for each row
  itemHeight = 22;

  @controller application;
  @service port;

  @tracked query = '';
  @tracked isInspecting = false;
  @tracked renderItems = [];

  @tracked _pinned = undefined;
  @tracked _previewing = undefined;

  _store = Object.create(null);

  set renderTree(renderTree) {
    let { _store } = this;

    let store = Object.create(null);
    let renderItems = [];

    let flatten = (parent, renderNode) => {
      if (isInternalRenderNode(renderNode)) {
        renderNode.children.forEach((node) => flatten(parent, node));
      } else {
        let item = _store[renderNode.id];

        if (item === undefined) {
          item = new RenderItem(this, parent, renderNode);
        } else {
          item.renderNode = renderNode;
        }

        store[renderNode.id] = item;

        renderItems.push(item);

        if (
          item.isHtmlTag &&
          renderNode.children.some((c) => c.type === 'modifier')
        ) {
          const idx = renderNode.children.findLastIndex(
            (c) => c.type === 'modifier'
          );
          renderNode.children.splice(idx + 1, 0, {
            type: 'placeholder-closing-tag',
            id: renderNode.id + '-closing-tag',
            name: '',
            children: [],
          });
        }

        renderNode.children.forEach((node) => flatten(item, node));
      }
    };

    renderTree.forEach((node) => flatten(null, node));

    this._store = store;

    this.renderItems = renderItems;
  }

  findItem(id) {
    return this._store[id];
  }

  get currentPreviewItem() {
    if (this.previewing) {
      return this.findItem(this.previewing);
    } else {
      return undefined;
    }
  }

  get currentItem() {
    if (this.pinned) {
      return this.findItem(this.pinned);
    } else {
      return undefined;
    }
  }

  get nextItem() {
    const items = this.visibleItems;
    return (
      items[items.indexOf(this.findItem(this.pinned)) + 1] ||
      items[items.length - 1]
    );
  }

  get previousItem() {
    const items = this.visibleItems;
    return items[items.indexOf(this.findItem(this.pinned)) - 1] || items[0];
  }

  get matchingItems() {
    let { renderItems, query } = this;

    if (query) {
      let match = (item) =>
        searchMatch(item.name, query) || item.childItems.some(match);
      renderItems = renderItems.filter(match);
    }

    return renderItems;
  }

  get visibleItems() {
    return this.matchingItems.filter((item) => item.isVisible);
  }

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
        this.port.send('objectInspector:inspectById', {
          objectId: item.instance,
        });
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
    } else if (
      !pinned &&
      (this.previewing === id || this.previewing === undefined)
    ) {
      this.previewing = undefined;
    }
  }

  @action handleKeyDown(event) {
    if (focusedInInput()) {
      return;
    }

    if (arrowKeyPressed(event.keyCode)) {
      event.preventDefault();
    }

    switch (event.keyCode) {
      case KEYS.up:
        this.pinned = this.previousItem.id;
        break;
      case KEYS.right: {
        const pinnedItem = this.findItem(this.pinned);

        if (pinnedItem.isExpanded) {
          this.pinned = this.nextItem.id;
        } else {
          pinnedItem.expand();
        }

        break;
      }
      case KEYS.down:
        this.pinned = this.nextItem.id;
        break;
      case KEYS.left: {
        const pinnedItem = this.findItem(this.pinned);

        if (pinnedItem.isExpanded) {
          pinnedItem.collapse();
        } else {
          this.pinned = pinnedItem.parentItem.id;
        }

        break;
      }
    }
  }

  @action toggleInspect() {
    this.port.send('view:inspectViews', { inspect: !this.isInspecting });
  }

  @action expandAll() {
    this.renderItems.forEach((item) => item.expand());
  }

  @action collapseAll() {
    this.renderItems.forEach((item) => item.collapse());
  }

  @action arrowKeysSetup() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  @action arrowKeysTeardown() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

function isInternalRenderNode(renderNode) {
  return (
    (renderNode.type === 'outlet' && renderNode.name === 'main') ||
    (renderNode.type === 'route-template' && renderNode.name === '-top-level')
  );
}

function focusedInInput() {
  return ['input', 'textarea'].includes(
    document.activeElement.tagName.toLowerCase()
  );
}

function arrowKeyPressed(keyCode) {
  return [KEYS.up, KEYS.right, KEYS.down, KEYS.left].includes(keyCode);
}

class RenderItem {
  @tracked isExpanded;
  @tracked renderNode;

  constructor(controller, parentItem, renderNode) {
    this.controller = controller;
    this.parentItem = parentItem;
    this.renderNode = renderNode;

    this.isExpanded = this.isExpandable;
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
    return (
      this.renderNode.type === 'component' ||
      this.renderNode.type === 'remote-element'
    );
  }

  get isModifier() {
    return this.renderNode.type === 'modifier';
  }

  get hasModifiers() {
    return this.childItems.some((item) => item.isModifier);
  }

  get isLastModifier() {
    return (
      this.parentItem.childItems.findLast((item) => item.isModifier) === this
    );
  }

  get isHtmlTag() {
    return this.renderNode.type === 'html-element';
  }

  get isClosingTag() {
    return this.renderNode.type === 'placeholder-closing-tag';
  }

  get name() {
    return this.renderNode.name;
  }

  get args() {
    return this.renderNode.args;
  }

  get isCurlyInvocation() {
    if (this.isModifier) {
      return true;
    }
    return this.renderNode.args && this.renderNode.args.positional;
  }

  get hasInstance() {
    let { instance } = this.renderNode;
    return typeof instance === 'object' && instance;
  }

  get instance() {
    if (this.hasInstance) {
      return this.renderNode.instance.id;
    } else {
      return null;
    }
  }

  get hasBounds() {
    return this.renderNode.bounds;
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
    let children = [];
    let candidates = [...this.renderNode.children];

    while (candidates.length > 0) {
      let candidate = candidates.shift();

      if (isInternalRenderNode(candidate)) {
        candidates.unshift(...candidate.children);
      } else {
        children.push(this.controller.findItem(candidate.id));
      }
    }

    return children;
  }

  get isExpandable() {
    return this.hasChildren;
  }

  get isVisible() {
    if (this.isRoot) {
      return true;
    } else {
      return this.parentItem.isVisible && this.parentItem.isExpanded;
    }
  }

  get isPinned() {
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
    if (this.isClosingTag) return;
    this.controller.previewing = this.id;
  }

  @action hidePreview() {
    if (this.isHighlighted) {
      this.controller.previewing = undefined;
    }
  }

  @action toggleInspection() {
    if (this.isClosingTag) return;
    if (this.isPinned) {
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

  @action scrollIntoView(event) {
    event.stopPropagation();

    this.send('view:scrollIntoView', { id: this.id });
  }

  @action inspectElement(event) {
    event.stopPropagation();

    this.send('view:inspectElement', { id: this.id });
  }

  @action inspectValue(event) {
    event.stopPropagation();

    this.send('view:inspectValue', { id: this.id });
  }

  show() {
    let item = this.parentItem;

    while (item) {
      item.expand();
      item = item.parentItem;
    }
  }

  expand(deep = false) {
    if (this.isExpandable) {
      this.isExpanded = true;

      if (deep === true) {
        this.childItems.forEach((child) => child.expand(true));
      }
    }
  }

  collapse(deep = false) {
    if (this.isExpandable) {
      this.isExpanded = false;

      if (deep === true) {
        this.childItems.forEach((child) => child.collapse(true));
      }
    }
  }

  send(message, payload) {
    this.controller.port.send(message, payload);
  }
}
