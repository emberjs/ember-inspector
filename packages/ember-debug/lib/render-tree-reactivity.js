import { GlimmerReference, GlimmerValidator } from './ember.js';
import { inspect, typeOf } from './type-check.js';
import { getDependencyTags } from './tracked-tags.js';
import { createTagNamer, labelForTagName } from './tag-names.js';

/**
 * Reads of @glimmer/validator and @glimmer/reference exports.
 *
 * Reads work in every build type.
 * Writes (the export patches in object-inspector.js) fail
 * where module namespaces are read-only.
 */
const valueForTag = GlimmerValidator?.valueForTag || GlimmerValidator?.value;
const CURRENT_TAG = GlimmerValidator?.CURRENT_TAG;
const tagMetaFor = GlimmerValidator?.tagMetaFor;
const valueForRef = GlimmerReference?.valueForRef;
const REFERENCE = GlimmerReference?.REFERENCE;

function currentRevision() {
  return valueForTag(CURRENT_TAG);
}

/**
 * The update info of a render node that has not re-rendered yet.
 *
 * @param {number|null} timestamp The render time, or null if unknown.
 */
function newUpdateInfo(timestamp) {
  return {
    updateCount: 0,
    revision: currentRevision(),
    previousRevision: null,
    timestamp,
    initialRender: true,
  };
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
 * Records why render tree nodes re-render.
 *
 * A render node is any reactive output of the debug render tree:
 * components, route templates, outlets, modifiers.
 *
 * The debug render tree hooks record the global revision of each re-render.
 * The tags behind the args and the consumed instance properties
 * give the inspector:
 *
 * - what a render node depends on
 * - which of those dependencies changed after the previous render,
 *   so what caused the most recent re-render
 */
export default class RenderTreeReactivity {
  constructor(debugRenderTree) {
    if (!debugRenderTree || !valueForTag || !CURRENT_TAG) {
      throw new Error(
        'Reactivity introspection is not supported by this app/Ember version',
      );
    }

    this.debugRenderTree = debugRenderTree;

    /**
     * internal render tree node → update info
     *
     * A WeakMap, so destroyed nodes and their instances can be collected.
     */
    this.updates = new WeakMap();

    /** "render-node:N" → internal render tree node, rebuilt on each capture */
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
        self.updates.set(this.nodeFor(state), newUpdateInfo(Date.now()));
      } catch {
        /** Inspector errors must not break rendering. */
      }
      return result;
    };

    /**
     * The update hook runs only for the nodes on the path to a change.
     *
     * Dependencies that changed between the previous revision
     * and this one caused the re-render.
     */
    const update = debugRenderTree.update;
    debugRenderTree.update = function (state) {
      try {
        const node = this.nodeFor(state);
        let info = self.updates.get(node);
        if (!info) {
          info = newUpdateInfo(null);
          self.updates.set(node, info);
        }
        info.previousRevision = info.revision;
        info.revision = currentRevision();
        info.updateCount++;
        info.timestamp = Date.now();
        info.initialRender = false;
      } catch {
        /** Inspector errors must not break rendering. */
      }
      return update.call(this, state);
    };

    const captureNode = debugRenderTree.captureNode;
    debugRenderTree.captureNode = function (id, state) {
      try {
        const node = this.nodeFor(state);
        self.capturedNodes[id] = node;
        /**
         * A node that rendered before the inspector attached has no info.
         *
         * Its first capture is the baseline for its first re-render.
         */
        if (!self.updates.has(node)) {
          self.updates.set(node, newUpdateInfo(null));
        }
      } catch {
        /** Inspector errors must not break the capture. */
      }
      return captureNode.call(this, id, state);
    };

    this.originals = { create, update, captureNode };
  }

  teardown() {
    Object.assign(this.debugRenderTree, this.originals);
    this.capturedNodes = Object.create(null);
  }

  /**
   * Runs before each render tree capture.
   *
   * Ids of removed render nodes must not keep their nodes in memory.
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

    /**
     * Everything that changed after the previous re-render caused the most
     * recent one.
     *
     * A node that never re-rendered uses its first render.
     */
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

    const nameForTag = createTagNamer(null, argsOwner(node));
    this._collectArgs(report.args, node.args, baseline, nameForTag);
    this._collectTracked(report.tracked, node.instance, baseline);

    return report;
  }

  _collectArgs(out, args, baseline, nameForTag) {
    if (!args || typeof args !== 'object') {
      return;
    }

    const named = args.named || {};
    const positional = args.positional || [];

    Object.keys(named).forEach((name) => {
      const ref = named[name];

      /**
       * Curried invocations (`{{component}}`) bundle the named args
       * in one __ARGS__ reference.
       */
      if (name === '__ARGS__' && isRef(ref)) {
        const inner = this._safeValueForRef(ref);
        if (inner && typeof inner === 'object') {
          Object.keys(inner).forEach((innerName) => {
            if (isRef(inner[innerName])) {
              out.named.push(
                this._describeRef(
                  innerName,
                  inner[innerName],
                  baseline,
                  nameForTag,
                ),
              );
            }
          });
          return;
        }
      }

      out.named.push(this._describeRef(name, ref, baseline, nameForTag));
    });

    positional.forEach((ref, index) => {
      out.positional.push(
        this._describeRef(String(index), ref, baseline, nameForTag),
      );
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

  _describeRef(name, ref, baseline, nameForTag) {
    const entry = { name, dependencies: [] };

    if (!isRef(ref)) {
      /** in-element and html-element nodes store plain values as args */
      entry.inspect = inspect(ref);
      entry.type = `type-${typeOf(ref)}`;
      return entry;
    }

    if (typeof ref.debugLabel === 'string') {
      /** Only debug builds of glimmer-vm have labels. */
      entry.debugLabel = ref.debugLabel;
    }

    const value = this._safeValueForRef(ref);
    entry.inspect = inspect(value);
    entry.type = `type-${typeOf(value)}`;

    const tag = ref.tag;
    if (tag) {
      entry.revision = valueForTag(tag);
      entry.changed = baseline !== null && entry.revision > baseline;
      entry.dependencies = this._collectTagDependencies(
        tag,
        baseline,
        nameForTag,
      );
    }

    return entry;
  }

  _collectTagDependencies(tag, baseline, nameForTag) {
    const tags = getDependencyTags(tag, null);
    const byName = new Map();
    const dependencies = [];

    tags.forEach((t) => {
      const tagName = nameForTag(t);
      if (!tagName) {
        return;
      }
      const name = labelForTagName(tagName);
      const revision = valueForTag(t);
      const changed = baseline !== null && revision > baseline;
      const existing = byName.get(name);
      if (!existing) {
        const dependency = { name, revision, changed };
        byName.set(name, dependency);
        dependencies.push(dependency);
      } else if (revision > existing.revision) {
        existing.revision = revision;
        existing.changed = changed;
      }
    });

    return dependencies.sort((a, b) => b.revision - a.revision);
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

    /**
     * The tag meta holds a tag for each instance property
     * that a tracking frame consumed.
     */
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

/**
 * The args of a render node come from the nearest ancestor with an instance,
 * so the tracked state behind them is on that instance.
 */
function argsOwner(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.instance && typeof parent.instance === 'object') {
      return parent.instance;
    }
  }
  return null;
}
