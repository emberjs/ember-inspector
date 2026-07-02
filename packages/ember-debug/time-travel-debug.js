import DebugPort from './debug-port.js';
import bound from './utils/bound-method.js';
import { set } from './lib/ember.js';
import { _backburner, debounce, join } from './lib/ember/runloop.js';

/**
 * Container types whose singletons hold long-lived application state.
 * Components are deliberately excluded: they are transient, and their
 * state is derived from these objects.
 */
const RECORDED_TYPES = ['service', 'controller'];

/**
 * Properties that exist on framework base classes and either aren't
 * application state or are unsafe to write back.
 */
const SKIPPED_KEYS = new Set([
  'concatenatedProperties',
  'isDestroyed',
  'isDestroying',
  'mergedProperties',
  'queryParams',
  'store',
  'target',
]);

const MAX_SNAPSHOTS = 200;

/**
 * Deep-clones a value if (and only if) it is plainly serializable:
 * primitives, plain objects and arrays of serializable values. Class
 * instances, DOM nodes, functions, promises etc. are rejected because
 * cloning them would lose identity and writing the clone back on
 * travel would corrupt the app.
 *
 * @return {{ ok: boolean, value: * }}
 */
export function cloneValue(value, depth = 0) {
  if (depth > 8) {
    return { ok: false };
  }
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return { ok: true, value };
    case 'object':
      break;
    default:
      return { ok: false };
  }
  if (value === null) {
    return { ok: true, value };
  }
  if (Array.isArray(value)) {
    const result = [];
    for (const item of value) {
      const cloned = cloneValue(item, depth + 1);
      if (!cloned.ok) {
        return { ok: false };
      }
      result.push(cloned.value);
    }
    return { ok: true, value: result };
  }
  if (value instanceof Date) {
    return { ok: true, value: new Date(value.getTime()) };
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return { ok: false };
  }
  const result = {};
  for (const key of Object.keys(value)) {
    const cloned = cloneValue(value[key], depth + 1);
    if (!cloned.ok) {
      return { ok: false };
    }
    result[key] = cloned.value;
  }
  return { ok: true, value: result };
}

function valuesEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
    return false;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Records snapshots of the serializable state of container singletons
 * (services and controllers) at the end of every runloop, and can write
 * any recorded snapshot back, which triggers Glimmer revalidation and
 * re-renders the app at that point in time.
 */
export default class extends DebugPort {
  recording = false;
  snapshots = [];
  currentIndex = -1;

  // Set while a snapshot is being written back, so that the runloops
  // caused by the restore don't get recorded as new snapshots.
  _restoring = false;

  get container() {
    return this.namespace?.owner?.__container__;
  }

  static {
    this.prototype.portNamespace = 'timeTravel';
    this.prototype.messages = {
      checkState() {
        this.sendState();
      },
      startRecording() {
        this.startRecording();
      },
      stopRecording() {
        this.stopRecording();
      },
      clear() {
        this.snapshots = [];
        this.currentIndex = -1;
        this.sendState();
      },
      travel(message) {
        this.travelTo(message.index);
      },
    };
  }

  willDestroy() {
    if (this.recording) {
      this.recording = false;
      _backburner.off('end', bound(this, this.capture));
    }
    super.willDestroy();
  }

  startRecording() {
    if (this.recording) {
      return;
    }
    this.recording = true;
    _backburner.on('end', bound(this, this.capture));
    // Capture the state as it is right now, so the slider always has a
    // "before anything happened" origin to return to.
    this.capture();
    this.sendState();
  }

  stopRecording() {
    if (!this.recording) {
      return;
    }
    this.recording = false;
    _backburner.off('end', bound(this, this.capture));
    this.sendState();
  }

  /**
   * Walks the container cache and captures every serializable property
   * of services and controllers. Called after every runloop while
   * recording; only stores a new snapshot when something changed.
   */
  capture() {
    if (!this.recording || this._restoring || this.isDestroyed) {
      return;
    }
    const objects = this.recordableObjects();
    const states = [];
    for (const { fullName, instance } of objects) {
      const props = {};
      let count = 0;
      for (const key of this.recordableKeys(instance)) {
        let value;
        try {
          value = instance.get ? instance.get(key) : instance[key];
        } catch {
          continue;
        }
        const cloned = cloneValue(value);
        if (cloned.ok) {
          props[key] = cloned.value;
          count++;
        }
      }
      if (count > 0) {
        states.push({ fullName, props });
      }
    }

    const serialized = JSON.stringify(states);
    const last = this.snapshots[this.snapshots.length - 1];
    if (last && last.serialized === serialized) {
      return;
    }

    this.snapshots.push({
      states,
      serialized,
      timestamp: Date.now(),
      url: this.currentUrl(),
    });
    if (this.snapshots.length > MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
    this.currentIndex = this.snapshots.length - 1;
    debounce(this, this.sendState, 100);
  }

  /**
   * Writes the snapshot at `index` back into the live objects. Only
   * properties whose current value differs are set, so untouched state
   * doesn't invalidate.
   */
  travelTo(index) {
    const snapshot = this.snapshots[index];
    if (!snapshot) {
      return;
    }
    this._restoring = true;
    try {
      join(() => {
        const cache = this.containerCache();
        for (const { fullName, props } of snapshot.states) {
          const instance = cache[fullName];
          if (!instance || instance.isDestroyed || instance.isDestroying) {
            continue;
          }
          for (const key of Object.keys(props)) {
            const recorded = props[key];
            let current;
            try {
              current = instance.get ? instance.get(key) : instance[key];
            } catch {
              continue;
            }
            if (valuesEqual(current, recorded)) {
              continue;
            }
            const { ok, value } = cloneValue(recorded);
            if (!ok) {
              continue;
            }
            try {
              if (instance.set) {
                instance.set(key, value);
              } else {
                set(instance, key, value);
              }
            } catch {
              // Read-only or getter-backed properties can't be restored.
            }
          }
        }
      });
    } finally {
      this._restoring = false;
    }
    this.currentIndex = index;
    this.sendState();
  }

  sendState() {
    if (this.isDestroyed) {
      return;
    }
    this.sendMessage('state', {
      recording: this.recording,
      currentIndex: this.currentIndex,
      snapshots: this.snapshots.map(({ timestamp, url }, index) => ({
        index,
        timestamp,
        url,
      })),
    });
  }

  containerCache() {
    const container = this.container;
    if (!container) {
      return {};
    }
    let cache = container.cache;
    if (cache && typeof cache.dict !== 'undefined') {
      cache = cache.dict;
    }
    return cache || {};
  }

  recordableObjects() {
    const cache = this.containerCache();
    const result = [];
    for (const fullName of Object.keys(cache)) {
      const type = fullName.split(':')[0];
      if (!RECORDED_TYPES.includes(type)) {
        continue;
      }
      const instance = cache[fullName];
      if (
        !instance ||
        typeof instance !== 'object' ||
        instance.isDestroyed ||
        instance.isDestroying
      ) {
        continue;
      }
      result.push({ fullName, instance });
    }
    return result;
  }

  /**
   * The keys worth snapshotting on an instance:
   * - own enumerable data properties (classic Ember object state)
   * - accessors with both a getter and a setter anywhere on the
   *   prototype chain (this is the shape `@tracked` produces)
   * Getter-only accessors are derived state and are skipped.
   */
  recordableKeys(instance) {
    const keys = new Set();
    for (const key of Object.keys(instance)) {
      if (this.shouldSkipKey(key)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(instance, key);
      if (descriptor && 'value' in descriptor) {
        if (typeof descriptor.value !== 'function') {
          keys.add(key);
        }
      } else if (descriptor?.get && descriptor?.set) {
        keys.add(key);
      }
    }
    let proto = Object.getPrototypeOf(instance);
    while (proto && proto !== Object.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(proto);
      for (const key of Object.keys(descriptors)) {
        if (this.shouldSkipKey(key) || keys.has(key)) {
          continue;
        }
        const descriptor = descriptors[key];
        if (descriptor.get && descriptor.set) {
          keys.add(key);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    return keys;
  }

  shouldSkipKey(key) {
    return key.startsWith('_') || SKIPPED_KEYS.has(key);
  }

  currentUrl() {
    try {
      // eslint-disable-next-line ember/no-private-routing-service
      const router = this.container?.lookup('router:main');
      return router?.get('currentURL') ?? undefined;
    } catch {
      return undefined;
    }
  }
}
