import { GlimmerReference, GlimmerValidator } from './ember.js';
import getObjectName from './get-object-name.js';
import { inspect } from './type-check.js';
import { getTagTrackedTags } from './tracked-tags.js';

// Read-only accessors into @glimmer/validator and @glimmer/reference.
// Unlike the export patches in object-inspector.js, reading these is safe
// in every build type (classic AMD builds as well as Vite builds, where
// the module namespaces are read-only).
const valueForTag = GlimmerValidator?.valueForTag || GlimmerValidator?.value;
const CURRENT_TAG = GlimmerValidator?.CURRENT_TAG;
const tagMetaFor = GlimmerValidator?.tagMetaFor;
const valueForRef = GlimmerReference?.valueForRef;
const REFERENCE = GlimmerReference?.REFERENCE;

function currentRevision() {
  return valueForTag(CURRENT_TAG);
}

function isRef(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (REFERENCE) {
    return REFERENCE in value;
  }
  return 'lastRevision' in value && 'tag' in value;
}

/**
 * Tracks *why* render tree nodes (components, route templates, modifiers —
 * every reactive output the debug render tree knows about) re-render.
 *
 * It hooks the debug render tree's lifecycle to record when each node last
 * re-rendered (and the global revision at that point), and walks the tags
 * behind the node's args and the consumed properties of its instance, so
 * the inspector can show:
 *
 *   - what a render node depends on, and
 *   - which of those dependencies were dirtied since the previous render,
 *     i.e. what caused it to change most recently.
 */
export default class RenderTreeReactivity {
  constructor(debugRenderTree) {
    if (!debugRenderTree || !valueForTag || !CURRENT_TAG) {
      throw new Error(
        'Reactivity introspection is not supported by this app/Ember version',
      );
    }

    this.debugRenderTree = debugRenderTree;

    // internal render tree node -> update info. WeakMap so we never retain
    // nodes (and through them, component instances) of destroyed subtrees.
    this.updates = new WeakMap();

    // "render-node:N" -> internal render tree node, rebuilt on each capture.
    this.capturedNodes = Object.create(null);

    this._patch();
  }

  _patch() {
    const self = this;
    const { debugRenderTree } = this;

    const create = debugRenderTree.create;
    debugRenderTree.create = function (state, node) {
      const result = create.call(this, state, node);
      try {
        self.updates.set(this.nodeFor(state), {
          updateCount: 0,
          revision: currentRevision(),
          previousRevision: null,
          timestamp: Date.now(),
          initialRender: true,
        });
      } catch {
        // never break rendering
      }
      return result;
    };

    // The update hook runs exactly for the nodes on the path to a change,
    // which makes it the right place to snapshot "this node re-rendered at
    // revision X". Dependencies dirtied between the previous revision and
    // this one are what caused the re-render.
    const update = debugRenderTree.update;
    debugRenderTree.update = function (state) {
      try {
        const node = this.nodeFor(state);
        let info = self.updates.get(node);
        if (!info) {
          info = self._newUpdateInfo();
          self.updates.set(node, info);
        }
        info.previousRevision = info.revision;
        info.revision = currentRevision();
        info.updateCount++;
        info.timestamp = Date.now();
        info.initialRender = false;
      } catch {
        // never break rendering
      }
      return update.call(this, state);
    };

    const captureNode = debugRenderTree.captureNode;
    debugRenderTree.captureNode = function (id, state) {
      try {
        const node = this.nodeFor(state);
        self.capturedNodes[id] = node;
        // Nodes rendered before we were attached (e.g. the inspector was
        // opened on an already-running app) have no create-time info yet;
        // baseline them at first capture so their first re-render can
        // still report what changed.
        if (!self.updates.has(node)) {
          self.updates.set(node, {
            updateCount: 0,
            revision: currentRevision(),
            previousRevision: null,
            timestamp: null,
            initialRender: true,
          });
        }
      } catch {
        // never break capturing
      }
      return captureNode.call(this, id, state);
    };

    this.originals = { create, update, captureNode };
  }

  _newUpdateInfo() {
    return {
      updateCount: 0,
      revision: null,
      previousRevision: null,
      timestamp: null,
      initialRender: true,
    };
  }

  teardown() {
    Object.assign(this.debugRenderTree, this.originals);
    this.capturedNodes = Object.create(null);
  }

  /**
   * Called right before a render tree capture so ids of removed render
   * nodes don't pile up (and don't retain their nodes/instances).
   */
  beginCapture() {
    this.capturedNodes = Object.create(null);
  }

  /**
   * Build the reactivity report for a captured render node id.
   *
   * @param {string} id The unprefixed render node id ("render-node:N").
   * @return {Option<Object>} The report, or null if the node is unknown.
   */
  getReport(id) {
    const node = this.capturedNodes[id];

    if (!node) {
      return null;
    }

    const info = this.updates.get(node) || null;

    // Everything dirtied after the previous re-render (or after the initial
    // render, if the node never updated) caused the most recent change.
    const baseline = info ? (info.previousRevision ?? info.revision) : null;

    const report = {
      updateCount: info ? info.updateCount : 0,
      lastRender:
        info && info.timestamp !== null
          ? {
              revision: info.revision,
              timestamp: info.timestamp,
              initial: info.initialRender,
            }
          : null,
      args: { named: [], positional: [] },
      tracked: [],
    };

    this._collectArgs(report.args, node.args, baseline);
    this._collectTracked(report.tracked, node.instance, baseline);

    return report;
  }

  _collectArgs(out, args, baseline) {
    if (!args || typeof args !== 'object') {
      return;
    }

    const named = args.named || {};
    const positional = args.positional || [];

    Object.keys(named).forEach((name) => {
      const ref = named[name];

      // `{{component}}`/curried invocations pass their named args bundled
      // in a single __ARGS__ reference; unpack it so the individual args
      // show up under their own names.
      if (name === '__ARGS__' && isRef(ref)) {
        const inner = this._safeValueForRef(ref);
        if (inner && typeof inner === 'object') {
          Object.keys(inner).forEach((innerName) => {
            if (isRef(inner[innerName])) {
              out.named.push(
                this._describeRef(innerName, inner[innerName], baseline),
              );
            }
          });
          return;
        }
      }

      out.named.push(this._describeRef(name, ref, baseline));
    });

    positional.forEach((ref, index) => {
      out.positional.push(this._describeRef(String(index), ref, baseline));
    });
  }

  _safeValueForRef(ref) {
    if (!valueForRef) {
      return undefined;
    }
    try {
      return valueForRef(ref);
    } catch {
      return undefined;
    }
  }

  _describeRef(name, ref, baseline) {
    const entry = { name, dependencies: [] };

    if (!isRef(ref)) {
      // in-element/html-element nodes store plain values in their args
      entry.inspect = inspect(ref);
      return entry;
    }

    if (typeof ref.debugLabel === 'string') {
      // only present in debug builds of glimmer-vm
      entry.debugLabel = ref.debugLabel;
    }

    entry.inspect = inspect(this._safeValueForRef(ref));

    const tag = ref.tag;
    if (tag) {
      entry.revision = valueForTag(tag);
      entry.changed = baseline !== null && entry.revision > baseline;
      entry.dependencies = this._collectTagDependencies(tag, baseline);
    }

    return entry;
  }

  _collectTagDependencies(tag, baseline) {
    const tags = getTagTrackedTags(tag, null);

    // A reference that consumed a single tag gets that very tag instead of
    // a combinator, so the walked list misses it.
    if (tag._propertyKey && !tags.includes(tag)) {
      tags.unshift(tag);
    }

    const byName = new Map();

    tags.forEach((t) => {
      const objectName = t._object ? getObjectName(t._object) : '';
      const name = (objectName ? `${objectName}.` : '') + t._propertyKey;
      const revision = valueForTag(t);
      const existing = byName.get(name);
      if (!existing || revision > existing.revision) {
        byName.set(name, {
          name,
          revision,
          changed: baseline !== null && revision > baseline,
        });
      }
    });

    return [...byName.values()].sort((a, b) => b.revision - a.revision);
  }

  _collectTracked(out, instance, baseline) {
    if (!instance || typeof instance !== 'object' || !tagMetaFor) {
      return;
    }

    let tagMeta;
    try {
      tagMeta = tagMetaFor(instance);
    } catch {
      return;
    }

    if (!tagMeta || typeof tagMeta.forEach !== 'function') {
      return;
    }

    // The tag meta holds a tag for every property of the instance that was
    // ever consumed by a tracking frame — that is, the instance state this
    // render node (or anything else) reactively depends on.
    tagMeta.forEach((tag, key) => {
      const revision = valueForTag(tag);
      out.push({
        name: String(key),
        revision,
        changed: baseline !== null && revision > baseline,
      });
    });

    out.sort((a, b) => b.revision - a.revision);
  }
}
