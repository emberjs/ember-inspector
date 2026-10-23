/* global basicContext */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { localCopy } from 'tracked-toolbox';
import { bind } from '@ember/runloop';
import ResizableColumns from 'ember-inspector/libs/resizable-columns';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { onResize } from 'ember-primitives/on-resize';
import buildStyle from 'ember-inspector/helpers/build-style';
import { concat, hash, get, fn } from '@ember/helper';
import ListCell from 'ember-inspector/components/list-cell';
import ListContent from 'ember-inspector/components/list-content';
import { VerticalCollection } from '@html-next/vertical-collection';
import and from 'ember-truth-helpers/helpers/and';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import sub_ from 'ember-math-helpers/helpers/sub';
import DragHandle from 'ember-inspector/components/ui/drag-handle';
import oneWay from 'ember-inspector/helpers/one-way';

const CHECK_HTML = '&#10003;';

export default class ListComponent extends Component {
  <template>
    <div class="list" ...attributes>
      {{#if this.schema.columns.length}}
        <div class="list-header" {{on "contextmenu" this.showContextMenu}}>
          <div
            class="list-table-container"
            {{onResize (fn this.tableDidResize this.resizableColumns)}}
          >
            <table>
              <colgroup>
                {{#each this.columns key="id" as |column|}}
                  <col style={{buildStyle width=(concat column.width "px")}} />
                {{/each}}
              </colgroup>
              <tbody>
                <tr class="list-row">
                  {{#each this.columns key="id" as |column|}}
                    <ListCell class="js-header-column" @tagName="th">
                      {{column.name}}
                    </ListCell>
                  {{/each}}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      {{/if}}

      <ListContent
        @columns={{this.columns}}
        @headerHeight={{this.headerHeight}}
        as |content|
      >
        {{yield
          (hash
            cell=(component ListCell tagName="td")
            rowEvents=content.rowEvents
            vertical-collection=(component
              VerticalCollection
              estimateHeight=30
              containerSelector=".js-list-content"
              tagName="tbody"
            )
          )
        }}
      </ListContent>

      {{#each this.columns key="id" as |column|}}
        {{#if
          (and
            column.visible
            (notEq column (get this.columns (sub_ this.columns.length 1)))
          )
        }}
          <DragHandle
            @faded={{true}}
            @left={{column.left}}
            @minWidth={{this.minWidth}}
            @maxWidth={{column.maxWidth}}
            @on-drag={{fn this.didResize column.id}}
            @position={{oneWay column.width}}
            @side="left"
          />
        {{/if}}
      {{/each}}
    </div>
  </template>
  /**
   * Service used for storage. Storage is
   * needed for caching of widths and visibility of columns.
   * The default storage service is local storage however we
   * fall back to memory storage if local storage is disabled (For
   * example as a security setting in Chrome).
   *
   * @property storage
   * @return {Service}
   */
  @service storage;

  /**
   * Class to pass to each row in `vertical-collection`.
   *
   * @property itemClass
   * @type {String}
   * @default ''
   */
  itemClass = '';

  /**
   * The minimum width a column can be resized to.
   * It should be high enough so that the column is still
   * visible and resizable.
   *
   * @property minWidth
   * @type {Number}
   * @default 10
   */
  minWidth = 10;

  /**
   * The instance responsible for building the `columns`
   * array. This means that this instance controls
   * the widths of the columns as well as their visibility.
   *
   * A new schema, for example another model type, gets new columns.
   *
   * @property resizableColumns
   * @type {ResizableColumn}
   */
  @cached
  get resizableColumns() {
    return new ResizableColumns({
      key: this.storageKey,
      minWidth: this.minWidth,
      storage: this.storage,
      columnSchema: this.schema?.columns || [],
    });
  }

  /**
   * Indicate the table's header's height in pixels.
   * Set this to `0` when there's no header.
   *
   * @property headerHeight
   * @type {Number}
   * @default 31
   */
  @localCopy('args.headerHeight', 31) headerHeight;

  /**
   * The schema that contains the list's columns,
   * their ids, names, and default visibility.
   *
   * @property schema
   * @type {Object}
   */
  @localCopy('args.schema', null) schema;

  /**
   * The array of columns including their ids, names,
   * and widths. This array only contains the currently
   * visible columns.
   *
   * @property columns
   * @type {Array}
   */
  get columns() {
    return this.resizableColumns?.columns;
  }

  /**
   * The key used to cache the current schema. Defaults
   * to the list's name.
   *
   * @property storageKey
   * @type {String}
   */
  get storageKey() {
    return this.name;
  }

  /**
   * The header table reports its width when it renders, when it resizes,
   * and when the columns change.
   *
   * @method tableDidResize
   */
  @action
  tableDidResize(resizableColumns, entry) {
    resizableColumns.setTableWidth(entry.target.clientWidth);
  }

  /**
   * Shows the context menu, opened by right clicking on the table's
   * header, which allows the user to toggle the visibility of each column.
   *
   * @method showContextMenu
   */
  @action
  showContextMenu(event) {
    let menu = this.resizableColumns
      .getColumnVisibility()
      .map(({ id, name, visible }) => {
        let check = `${CHECK_HTML}`;
        if (!visible) {
          check = `<span style='opacity:0'>${check}</span>`;
        }
        name = `${check} ${name}`;
        return {
          name,
          title: name,
          // eslint-disable-next-line ember/no-runloop
          fn: bind(this, this.toggleColumnVisibility, id),
        };
      });

    basicContext.show(menu, event);
  }

  /**
   * Toggle a column's visibility. This is called
   * when a user clicks on a specific column in the context
   * menu.
   *
   * @method toggleColumnVisibility
   * @param {String} id The column's id
   */
  @action
  toggleColumnVisibility(id) {
    this.resizableColumns.toggleVisibility(id);
  }

  /**
   * Called whenever a column is resized using the draggable handle.
   * It is responsible for updating the column info by notifying
   * `resizableColumns` about the update.
   *
   * @method didResize
   * @param {String} id The column's id
   * @param {Number} width The new width
   */
  @action
  didResize(id, width) {
    this.resizableColumns.updateColumnWidth(id, width);
  }
}
