import Component from '@ember/component';
import { sort, map } from '@ember/object/computed';
import { set, computed } from '@ember/object';
import { A } from '@ember/array';

export default Component.extend({
  tagName: '',

  isArray: computed('properties', function () {
    const props = A(this.get('properties') || []);
    return props.findBy('name', 'length') && props.findBy('name', 0);
  }),

  /**
   * Sort the properties by name and group them by property type to make them easier to find in the object inspector.
   *
   * @property sortedProperties
   * @type {Array<Object>}
   */
  sortedProperties: sort('props', 'sortProperties'),

  props: map('properties', function (p) {
    set(p, 'isFunction', p.value.type.includes('function');
    if (p.name == parseInt(p.name)) {
      set(p, 'name', parseInt(p.name));
    }
    return p;
  }),

  /**
   * Used by the `sort` computed macro.
   *
   * @property sortProperties
   * @type {Array<String>}
   */
  sortProperties: computed('isArray', function () {
    const order = [
      'isFunction',
      'isService:desc',
      'isProperty:desc',
      'isTracked:desc',
      'isComputed:desc',
      'isGetter:desc',
      'name'
    ];
    // change order for arrays, if the array doesnt have items, then the order does not need to be changed
    if (this.get('isArray')) {
      const i = order.indexOf('isProperty:desc');
      order.splice(i, 1);
      order.splice(order.length - 1, 0, 'isProperty:desc');
    }
    return order;
  })
});

