import Component from '@glimmer/component';
import { compare } from '@ember/utils';

export default class SortProperties extends Component {
  get isArray() {
    const props = this.args.properties || [];
    return (
      props.find((x) => x.name === 'length') &&
      props.find((x) => x.name === '0')
    );
  }

  /**
   * Sort the properties by name and group them by property type to make them easier to find in the object inspector.
   *
   * @property sortedProperties
   * @type {Array<Object>}
   */
  get sortedProperties() {
    const isArray = this.isArray;
    const sorted = sortBy(this.props, this.sortProperties(isArray));

    // limit arrays
    if (!isArray) {
      return sorted;
    }
    const item = sorted.find((x) => x.name === 'length');
    const index = sorted.indexOf(item);
    if (index !== -1) {
      sorted.splice(index, 1);
    }
    sorted.splice(0, 0, item);
    if (sorted.length > 100) {
      const indicator = {
        name: '...',
        value: {
          inspect: 'there are more items, send to console to see all',
        },
      };
      const limited = sorted.slice(0, 100);
      limited.push(indicator);
      return limited;
    }
    return sorted;
  }

  get props() {
    return (this.args.properties || []).map((p) => {
      p.isFunction =
        p.value.type === 'type-function' ||
        p.value.type === 'type-asyncfunction';
      if (p.name == parseInt(p.name)) {
        p.name = parseInt(p.name);
      }
      return p;
    });
  }

  sortProperties(isArray) {
    const order = [
      'isFunction',
      'isService:desc',
      'isProperty:desc',
      'isTracked:desc',
      'isComputed:desc',
      'isGetter:desc',
      'name',
    ];
    // change order for arrays, if the array doesnt have items, then the order does not need to be changed
    if (isArray) {
      const i = order.indexOf('isProperty:desc');
      order.splice(i, 1);
      order.splice(order.length - 1, 0, 'isProperty:desc');
    }
    return order;
  }
}

/**
 * Sorts by each key in turn. A `:desc` suffix reverses that key.
 */
function sortBy(items, keys) {
  const sortKeys = keys.map((entry) => {
    const [key, direction] = entry.split(':');
    return { key, factor: direction === 'desc' ? -1 : 1 };
  });

  return items.slice().sort((a, b) => {
    for (const { key, factor } of sortKeys) {
      const result = compare(a[key], b[key]);
      if (result !== 0) {
        return result * factor;
      }
    }
    return 0;
  });
}
