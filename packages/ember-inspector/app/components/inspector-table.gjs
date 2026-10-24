import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { compare } from '@ember/utils';
import { VerticalCollection } from '@html-next/vertical-collection';
import InspectorTableRow from 'ember-inspector/components/inspector-table/row';

/**
 * A resize does not make a column narrower than this.
 */
const MIN_WIDTH = 128;

/**
 * A table with sticky headers, resizable columns and virtual scrolling.
 *
 * - `@columns`: `[{ valuePath, name }]`
 * - `@rows`: the data, one object per row
 * - `@sorts` and `@onUpdateSorts`: pass both to make the columns sortable.
 *   Each sort is `{ property, direction }`, and the table sorts the rows.
 * - `@reorderable`: drag the headers to move the columns
 * - `@selection` and `@onSelect`: a click on a row selects it
 *
 * The block runs once for each row, and yields a `Row` component and the index.
 * `Row` yields a `Cell` component for each column.
 */
export default class InspectorTable extends Component {
  <template>
    {{! Headers move by drag and drop, with the mouse only. }}
    {{! A drag starts after pointer down, so pointer up is too late to see the resize handle. }}
    {{! template-lint-disable no-invalid-interactive no-pointer-down-event-binding }}
    <div class="inspector-table" ...attributes>
      <div class="inspector-table-overflow">
        <table>
          <thead>
            <tr>
              {{#each this.columns as |column index|}}
                <th
                  class="{{if this.isSortable 'is-sortable'}}
                    {{if @reorderable 'is-reorderable'}}"
                  style={{this.widthStyle column}}
                  aria-sort={{if this.isSortable (this.sortDirection column)}}
                  draggable={{if @reorderable "true"}}
                  data-test-table-header-column
                  {{on "pointerdown" this.onPointerDown capture=true}}
                  {{on "dragstart" (fn this.onDragStart column)}}
                  {{on "dragover" this.onDragOver}}
                  {{on "drop" (fn this.onDrop column)}}
                  {{on "dragend" this.onDragEnd}}
                >
                  {{#if this.isSortable}}
                    <button
                      type="button"
                      class="sort-toggle"
                      data-test-sort-toggle
                      {{on "click" (fn this.sort column)}}
                    >
                      {{column.name}}

                      {{#unless (this.isUnsorted column)}}
                        <span
                          data-test-sort-indicator
                          class="sort-indicator
                            {{if
                              (this.isAscending column)
                              'is-ascending'
                              'is-descending'
                            }}"
                        ></span>
                      {{/unless}}
                    </button>
                  {{else}}
                    {{column.name}}
                  {{/if}}

                  {{#if (this.hasResizeHandle index)}}
                    <button
                      type="button"
                      aria-label="Resize {{column.name}}"
                      class="resize-handle"
                      {{on "pointerdown" (fn this.startResize index)}}
                      {{on "pointermove" this.resize}}
                      {{on "pointerup" this.stopResize}}
                      {{on "pointercancel" this.stopResize}}
                    ></button>
                  {{/if}}
                </th>
              {{/each}}
            </tr>
          </thead>
          <tbody>
            <VerticalCollection
              @items={{this.sortedRows}}
              @containerSelector=".inspector-table-overflow"
              @estimateHeight={{37}}
              @staticHeight={{true}}
              @bufferSize={{10}}
              as |data index|
            >
              {{yield
                (component
                  InspectorTableRow
                  data=data
                  columns=this.columns
                  isSelectable=(if @onSelect true false)
                  isSelected=(this.isSelected data)
                  onSelect=this.select
                )
                index
              }}
            </VerticalCollection>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  /**
   * The column keys in display order, after a header drop.
   * Until the first drop, the order of `@columns` is used.
   */
  @tracked order;

  /**
   * Column widths in px, by key.
   * Until the first resize, the browser shares the width between the columns.
   */
  @tracked widths;

  get columns() {
    let columns = this.args.columns.map(({ valuePath, name }) => ({
      key: valuePath,
      name,
    }));

    if (!this.order) return columns;

    let byKey = new Map(columns.map((column) => [column.key, column]));
    let ordered = [];

    for (let key of this.order) {
      let column = byKey.get(key);

      if (column) {
        ordered.push(column);
        byKey.delete(key);
      }
    }

    /**
     * A column that `@columns` adds after a drop goes at the end.
     */
    for (let column of byKey.values()) ordered.push(column);

    return ordered;
  }

  get isSortable() {
    return Boolean(this.args.onUpdateSorts);
  }

  get sortedRows() {
    let rows = this.args.rows ?? [];
    let sorts = this.isSortable ? (this.args.sorts ?? []) : [];

    if (sorts.length === 0) return rows;

    return rows.slice().sort((a, b) => {
      for (let { property, direction } of sorts) {
        let result = compare(get(a, property), get(b, property));

        if (result) return direction === 'descending' ? -result : result;
      }

      return 0;
    });
  }

  sortDirection = (column) =>
    (this.args.sorts ?? []).find((sort) => sort.property === column.key)
      ?.direction ?? 'none';

  isAscending = (column) => this.sortDirection(column) === 'ascending';

  isUnsorted = (column) => this.sortDirection(column) === 'none';

  /**
   * Each click moves the column to the next state:
   * none, then descending, then ascending, then none again.
   */
  sort = (column) => {
    let direction = this.sortDirection(column);

    if (direction === 'ascending') {
      this.args.onUpdateSorts([]);
    } else {
      this.args.onUpdateSorts([
        {
          property: column.key,
          direction: direction === 'descending' ? 'ascending' : 'descending',
        },
      ]);
    }
  };

  isSelected = (data) =>
    this.args.selection !== undefined && this.args.selection === data;

  select = (data) => this.args.onSelect?.(data);

  widthStyle = (column) => {
    let width = this.widths?.[column.key];

    return width === undefined ? undefined : htmlSafe(`width: ${width}px;`);
  };

  /**
   * The handle sits on the right edge of a column, and moves the border
   * between that column and the next one. So the last column has no handle.
   */
  hasResizeHandle = (index) => index < this.columns.length - 1;

  /**
   * Set while a resize handle has the pointer.
   */
  resizing;

  startResize = (index, event) => {
    event.preventDefault();
    event.target.setPointerCapture(event.pointerId);

    let headers = event.target.closest('tr').children;
    let columns = this.columns;
    let widths = {};

    for (let i = 0; i < columns.length; i++) {
      widths[columns[i].key] = headers[i].getBoundingClientRect().width;
    }

    this.widths = widths;
    this.resizing = {
      left: columns[index].key,
      right: columns[index + 1].key,
      startX: event.clientX,
      startLeft: widths[columns[index].key],
      startRight: widths[columns[index + 1].key],
    };
  };

  /**
   * One column grows by the amount that the other one shrinks,
   * so the table keeps its width.
   */
  resize = (event) => {
    let resizing = this.resizing;

    if (!resizing) return;

    let delta = event.clientX - resizing.startX;
    let min = MIN_WIDTH - resizing.startLeft;
    let max = resizing.startRight - MIN_WIDTH;

    delta = Math.max(Math.min(delta, max), min);

    this.widths = Object.assign({}, this.widths, {
      [resizing.left]: resizing.startLeft + delta,
      [resizing.right]: resizing.startRight - delta,
    });
  };

  stopResize = (event) => {
    if (!this.resizing) return;

    event.target.releasePointerCapture(event.pointerId);
    this.resizing = undefined;
  };

  /**
   * Drag and drop of the headers.
   * The dragged column takes the place of the column that it drops on.
   */
  dragging;

  /**
   * The header is the drag source, so a drag on its resize handle
   * starts a column drag too, unless the drag is cancelled.
   */
  pointerTarget;

  onPointerDown = (event) => {
    this.pointerTarget = event.target;
  };

  onDragStart = (column, event) => {
    if (this.pointerTarget?.closest('.resize-handle')) {
      event.preventDefault();
      return;
    }

    this.dragging = column;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', column.key);
  };

  onDragOver = (event) => {
    if (this.dragging) event.preventDefault();
  };

  onDrop = (target, event) => {
    let column = this.dragging;

    this.dragging = undefined;

    if (!column || column.key === target.key) return;

    event.preventDefault();

    let keys = this.columns.map((column) => column.key);
    let from = keys.indexOf(column.key);
    let to = keys.indexOf(target.key);

    keys.splice(from, 1);
    keys.splice(to, 0, column.key);

    this.order = keys;
  };

  onDragEnd = () => {
    this.dragging = undefined;
  };
}
