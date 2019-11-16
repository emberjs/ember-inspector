import captureRenderTree from './capture-render-tree';

export default class RenderTree {
  /**
   * Sets up the initial options.
   *
   * @method constructor
   * @param {Object} options
   *  - {owner}      owner           The Ember app's owner.
   *  - {Function}   retainObject    Called to retain an object for future inspection.
   */
  constructor({ owner, retainObject }) {
    this.owner = owner;
    this.retainObject = retainObject;

    this.tree = [];
    this.nodes = Object.create(null);
    this.serialized = Object.create(null);
    this.ranges = Object.create(null);
  }

  /**
   * Capture the render tree and serialize it for sending.
   *
   * This returns an array of these:
   *
   * type SerializedObject = string | number | bigint | boolean | null | undefined | { id: string };
   *
   * interface SerializedRenderNode {
   *   id: string;
   *   type: 'outlet' | 'engine' | 'route-template' | 'component';
   *   name: string;
   *   args: {
   *     named: Dict<SerializedObject>;
   *     positional: SerializedObject[];
   *   };
   *   instance: SerializedObject;
   *   template: Option<string>;
   *   bounds: Option<'single' | 'range'>;
   *   children: SerializedRenderNode[];
   * }
   *
   * @method build
   * @return {Array<SerializedRenderNode>} The render nodes tree.
   */
  build() {
    this.tree = captureRenderTree(this.owner);
    this.nodes = Object.create(null);
    this.serialized = Object.create(null);
    this.ranges = Object.create(null);
    return this._serializeRenderNodes(this.tree);
  }

  /**
   * Find a render node by id.
   *
   * @param {string} id A render node id.
   * @return {Option<SerializedRenderNode>} A render node with the given id, if any.
   */
  find(id) {
    return this.nodes[id] || null;
  }

  /**
   * Find the deepest enclosing render node for a given DOM node.
   *
   * @method findNearest
   * @param {Node} node A DOM node.
   * @return {Option<SerializedRenderNode>} The deepest enclosing render node, if any.
   */
  findNearest(node) {
    let renderNode = this._matchRenderNodes(this.tree, node);

    if (renderNode) {
      return this._serializeRenderNode(renderNode);
    } else {
      return null;
    }
  }

  /**
   * Get the DOM range for a give render node id.
   *
   * @method getRange
   * @param {string} id A render node id.
   * @return {Option<Range>} The DOM range, if the render node is found and has valid `bounds`.
   */
  getRange(id) {
    let range = this.ranges[id];

    if (range === undefined) {
      let node = this.nodes[id];

      if (node && node.bounds) {
        let { parentElement, firstNode, lastNode } = node.bounds;

        if (firstNode.parentElement === parentElement && lastNode.parentElement === parentElement) {
          range = document.createRange();
          range.setStartBefore(node.bounds.firstNode);
          range.setEndAfter(node.bounds.lastNode);
        } else {
          // The node has already been detached, we probably have a stale tree
          range = null;
        }
      } else {
        range = null;
      }

      this.ranges[id] = range;
    }

    return range;
  }

  _serializeRenderNodes(nodes) {
    return nodes.map(node => this._serializeRenderNode(node));
  }

  _serializeRenderNode(node) {
    let serialized = this.serialized[node.id];

    if (serialized === undefined) {
      this.nodes[node.id] = node;
      this.serialized[node.id] = serialized = {
        ...node,
        args: this._serializeArgs(node.args),
        instance: this._serializeItem(node.instance),
        bounds: this._serializeBounds(node.bounds),
        children: this._serializeRenderNodes(node.children),
      };
    }

    return serialized;
  }

  _serializeArgs({ named, positional }) {
    return {
      named: this._serializeDict(named),
      positional: this._serializeArray(positional),
    };
  }

  _serializeBounds(bounds) {
    if (bounds === null) {
      return null;
    } else if (bounds.firstNode === bounds.lastNode) {
      return 'single';
    } else {
      return 'range';
    }
  }

  _serializeDict(dict) {
    let result = Object.create(null);

    Object.keys(dict).forEach(key => {
      result[key] = this._serializeItem(dict[key]);
    });

    return result;
  }

  _serializeArray(array) {
    return array.map(item => this._serializeItem(item));
  }

  _serializeItem(item) {
    switch (typeof item) {
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean':
      case 'undefined':
        return item;

      default:
        return item && this._serializeObject(item);
    }
  }

  _serializeObject(object) {
    return { id: this.retainObject(object) };
  }

  _matchRenderNodes(renderNodes, dom) {
    for (let renderNode of renderNodes) {
      let match = this._matchRenderNode(renderNode, dom);

      if (match) {
        return match;
      }
    }

    return null;
  }

  _matchRenderNode(renderNode, dom) {
    let match = null;
    let range = this.getRange(renderNode.id);

    if (range && range.isPointInRange(dom, 0)) {
      match = renderNode;
    }

    return this._matchRenderNodes(renderNode.children, dom) || match;
  }
}
