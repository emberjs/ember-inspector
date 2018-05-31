/**
 * An individual cell for the `x-list` table.
 * Usually not called directly but as a contextual helper.
 *
 * For example:
 *
 * ```javascript
 * {{#x-list as |list|}}
 *   <tr>
 *     {{#each model as |item|}}
 *       {{list.cell}} {{item.name}} {{/list.cell}}
 *     {{/each}}
 *   </tr>
 * {{/xlist}}
 * ```
 */
import Component from '@ember/component';

import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';
export default Component.extend({
  /**
   * Defaults to a table cell. For headers
   * set it to `th` by passing it through the
   * template.
   *
   * @property tagName
   * @type {String}
   * @default 'td'
   */
  tagName: '',

  /**
   * Avoid unsafe style warning. This property does not
   * depend on user input so this is safe.
   *
   * @property safeStyle
   * @type {SafeString}
   */
  safeStyle: computed('style', function() {
    return htmlSafe(this.get('style'));
  }),

  /**
   * The `title` attribute of the DOM element.
   *
   * @property title
   * @type {String}
   * @default null
   */
  title: null,

  /**
   * The `style` attribute of the DOM element.
   *
   * @property style
   * @type {String}
   * @default null
   */
  style: null,

  /**
   * Cells can be clickable. One example would be clicking Data records to
   * inspect them in the object inspector. Set this property to `true` to
   * make this cell appear clickable (pointer cursor, underline...).
   *
   * @property clickable
   * @type {Boolean}
   * @default false
   */
  clickable: false,

  /**
   * Set this property to `true` to highlight the cell. For example
   * the current route in the Routes tab is highlighted.
   *
   * @property highlight
   * @type {Boolean}
   * @default false
   */
  highlight: false,

  /**
   * The list of possible columns
   * @property columns
   * @type {Array<{id: String, name: String, maxWidth: Number, width: Number}>}
   */
  columns: null,

  /**
   * The column name that this cell corresponds to. If the column name doesn't
   * exist in `columns, the cell won't render.
   * @property column
   * @type {String}
   */
  column: null,


  showColumn: computed('columns.[]', 'column', function() {
    if (isEmpty(this.get('columns')) || isEmpty(this.get('column'))) {
      return true;
    } else {
      const ids = this.get('columns').map(c => c.id);
      let show = ids.includes(this.get('column'));
      return show;
    }
  }),

  init() {
    this._super(...arguments);
    if (isEmpty(this.get('columns'))) {
      this.set('columns', []);
    }
  },

  /**
   * Action to trigger when the cell is clicked.
   * Pass the action through the template using the `action`
   * helper.
   *
   * @property on-click
   * @type {Function}
   */
  'on-click'() {},
});
