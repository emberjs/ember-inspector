/**
 * An individual cell for the `list` table.
 * Usually not called directly but as a contextual helper.
 *
 * For example:
 *
 * ```hbs
 * <List as |list|>
 *   <tr>
 *     {{#each model as |item|}}
 *       {{list.cell}} {{item.name}} {{/list.cell}}
 *     {{/each}}
 *   </tr>
 * </List>
 * ```
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class ListCell extends Component {
  /**
   * Avoid unsafe style warning. This property does not
   * depend on user input so this is safe.
   *
   * @property safeStyle
   * @type {SafeString}
   */
  get safeStyle() {
    return htmlSafe(this.style);
  }

  /**
   * The `title` attribute of the DOM element.
   *
   * @property title
   * @type {String}
   * @default null
   */
  get title() {
    return this.args.title ?? null;
  }

  /**
   * The `style` attribute of the DOM element.
   *
   * @property style
   * @type {String}
   * @default null
   */
  get style() {
    return this.args.style ?? null;
  }

  /**
   * Cells can be clickable. One example would be clicking Data records to
   * inspect them in the object inspector. Set this property to `true` to
   * make this cell appear clickable (pointer cursor, underline...).
   *
   * @property clickable
   * @type {Boolean}
   * @default false
   */
  get clickable() {
    return this.args.clickable ?? false;
  }

  /**
   * Set this property to `true` to highlight the cell. For example
   * the current route in the Routes tab is highlighted.
   *
   * @property highlight
   * @type {Boolean}
   * @default false
   */
  get highlight() {
    return this.args.highlight ?? false;
  }

  /**
   * Action triggered when cell is clicked.
   * Calls the `on-click` argument (if set).
   *
   * @method click
   */
  @action
  click() {
    this.args['on-click']?.();
  }
}
