import DebugPort from './debug-port.js';
import { emberInspectorAPI } from './utils/ember-inspector-api.js';

/**
 * Container Debug - Refactored to use new Ember Inspector API
 * 
 * Key improvements:
 * - No direct access to owner.__container__
 * - No version-specific logic (InheritingDict handling)
 * - Simpler, more maintainable code
 * - All filtering logic encapsulated in the API
 */
export default class extends DebugPort {
  get objectInspector() {
    return this.namespace?.objectInspector;
  }

  get owner() {
    return this.namespace?.owner;
  }

  TYPES_TO_SKIP = [
    'component-lookup',
    'container-debug-adapter',
    'resolver-for-debugging',
    'event_dispatcher',
  ];

  static {
    this.prototype.portNamespace = 'container';
    this.prototype.messages = {
      getTypes() {
        this.sendMessage('types', {
          types: this.getTypes(),
        });
      },
      getInstances(message) {
        let instances = this.getInstances(message.containerType);
        if (instances) {
          this.sendMessage('instances', {
            instances,
            status: 200,
          });
        } else {
          this.sendMessage('instances', {
            status: 404,
          });
        }
      },
      sendInstanceToConsole(message) {
        // Use new API for lookup
        const instance = emberInspectorAPI.owner.lookup(this.owner, message.name);
        this.objectInspector.sendValueToConsole(instance);
      },
    };
  }

  typeFromKey(key) {
    return key.split(':').shift();
  }

  nameFromKey(key) {
    return key.split(':').pop();
  }

  /**
   * Get all container instances grouped by type.
   * 
   * BEFORE (30+ lines):
   * - Direct cache access: owner.__container__.cache
   * - Version detection: InheritingDict vs plain object
   * - Manual iteration and filtering
   * - Manual grouping by type
   * 
   * AFTER (1 line):
   * - Single API call with filtering options
   * - All complexity handled by Ember
   */
  instancesByType() {
    // Use new high-level API - replaces all the complex logic
    return emberInspectorAPI.owner.getContainerInstances(this.owner, {
      excludeTypes: this.TYPES_TO_SKIP,
      includePrivate: false,
    });
  }

  getTypes() {
    const instancesByType = this.instancesByType();
    return Object.keys(instancesByType).map((type) => ({
      name: type,
      count: instancesByType[type].length,
    }));
  }

  getInstances(type) {
    const instancesByType = this.instancesByType();
    const instances = instancesByType[type];
    
    if (!instances) {
      return null;
    }
    
    return instances.map((item) => ({
      name: this.nameFromKey(item.fullName),
      fullName: item.fullName,
      inspectable: this.objectInspector.canSend(item.instance),
    }));
  }
}