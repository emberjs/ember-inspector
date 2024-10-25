import { map, sort } from '@ember/object/computed';
import Component from '@glimmer/component';
import { set, computed } from '@ember/object';
import { A } from '@ember/array';

export default class SortProperties extends Component {
  @computed('args.properties')
  get isArray() {
    const props = A(this.args.properties || []);
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
  @computed('isArray', 'sorted.length')
  get sortedProperties() {
    // limit arrays
    let props = A(this.sorted);
    if (this.isArray) {
      const item = props.find((x) => x.name === 'length');
      props.removeObject(item);
      props.splice(0, 0, item);
    }
    if (this.isArray && this.sorted.length > 100) {
      const indicator = {
        name: '...',
        value: {
          inspect: 'there are more items, send to console to see all',
        },
      };
      props = props.slice(0, 100);
      props.push(indicator);
      return props;
    }
    return this.sorted;
  }

  @sort('props', 'sortProperties')
  sorted;

  @map('args.properties', function (p) {
    set(
      p,
      'isFunction',
      p.value.type === 'type-function' || p.value.type === 'type-asyncfunction',
    );
    if (p.name == parseInt(p.name)) {
      set(p, 'name', parseInt(p.name));
    }
    return p;
  })
  props;

  /**
   * Used by the `sort` computed macro.
   *
   * @property sortProperties
   * @type {Array<String>}
   */
  @computed('isArray')
  get sortProperties() {
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
    if (this.isArray) {
      const i = order.indexOf('isProperty:desc');
      order.splice(i, 1);
      order.splice(order.length - 1, 0, 'isProperty:desc');
    }
    return order;
  }
}
