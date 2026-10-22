import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

class Cell {
  @tracked value;
}

/**
 * Decorates a field that holds the value of an input.
 * After `delay` ms without a new value, the value is copied to the
 * `target` field. The `target` field must be `@tracked`.
 *
 * ```js
 * @tracked search = '';
 * @debounced('search', 300) searchValue;
 * ```
 */
export default function debounced(target, delay) {
  return function () {
    const cells = new WeakMap();

    function cellFor(owner) {
      let cell = cells.get(owner);
      if (!cell) {
        cell = new Cell();
        cells.set(owner, cell);
      }
      return cell;
    }

    function apply() {
      this[target] = cellFor(this).value;
    }

    return {
      configurable: true,
      enumerable: true,
      get() {
        return cellFor(this).value;
      },
      set(value) {
        cellFor(this).value = value;
        // eslint-disable-next-line ember/no-runloop
        debounce(this, apply, delay);
      },
    };
  };
}
