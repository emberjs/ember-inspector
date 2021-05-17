import {
  classNames,
  attributeBindings,
  classNameBindings,
  tagName,
} from '@ember-decorators/component';
import { computed } from '@ember/object';
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
import Component from '@ember/component';

import { htmlSafe } from '@ember/template';

@tagName('td')
@classNames('list__cell')
@classNameBindings(
  'highlight:list__cell_highlight',
  'clickable:list__cell_clickable'
)
@attributeBindings('safeStyle:style', 'title')
export default class ListCell extends Component {
  /**
   * Avoid unsafe style warning. This property does not
   * depend on user input so this is safe.
   *
   * @property safeStyle
   * @type {SafeString}
   */
  @computed('style')
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
  title = null;

  /**
   * The `style` attribute of the DOM element.
   *
   * @property style
   * @type {String}
   * @default null
   */
  style = null;

  /**
   * Cells can be clickable. One example would be clicking Data records to
   * inspect them in the object inspector. Set this property to `true` to
   * make this cell appear clickable (pointer cursor, underline...).
   *
   * @property clickable
   * @type {Boolean}
   * @default false
   */
  clickable = false;

  /**
   * Set this property to `true` to highlight the cell. For example
   * the current route in the Routes tab is highlighted.
   *
   * @property highlight
   * @type {Boolean}
   * @default false
   */
  highlight = false;

  /**
   * Action to trigger when the cell is clicked.
   * Pass the action through the template using the `action`
   * helper.
   *
   * @property on-click
   * @type {Function}
   */
  'on-click'() {}

  /**
   * DOM event triggered when cell is clicked.
   * Calls the `on-click` action (if set).
   *
   * @method click
   */
  click() {
    this['on-click']();
  }
}
