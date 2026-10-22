import Component from '@glimmer/component';
import { get } from '@ember/object';
import { compare } from '@ember/utils';
import { headlessTable } from '@universal-ember/table';
import { meta } from '@universal-ember/table/plugins';
import {
  ColumnReordering,
  orderedColumnsFor,
} from '@universal-ember/table/plugins/column-reordering';
import {
  ColumnResizing,
  hasResizeHandle,
  resizeHandle,
} from '@universal-ember/table/plugins/column-resizing';
import {
  DataSorting,
  isAscending,
  isSortable,
  isUnsorted,
  sort,
} from '@universal-ember/table/plugins/data-sorting';

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
  table = headlessTable(this, {
    columns: () =>
      this.args.columns.map(({ valuePath, name }) => ({
        key: valuePath,
        name,
      })),
    data: () => this.sortedRows,
    plugins: [
      ColumnResizing.with(() => ({ handlePosition: 'right' })),
      ColumnReordering,
      DataSorting.with(() =>
        this.args.onUpdateSorts
          ? { sorts: this.args.sorts ?? [], onSort: this.args.onUpdateSorts }
          : {},
      ),
    ],
  });

  get columns() {
    return orderedColumnsFor(this.table);
  }

  get rows() {
    return this.table.rows.values();
  }

  get sortedRows() {
    let rows = this.args.rows ?? [];
    let sorts = this.args.onUpdateSorts ? (this.args.sorts ?? []) : [];

    if (sorts.length === 0) return rows;

    return rows.slice().sort((a, b) => {
      for (let { property, direction } of sorts) {
        let result = compare(get(a, property), get(b, property));

        if (result) return direction === 'descending' ? -result : result;
      }

      return 0;
    });
  }

  hasResizeHandle = hasResizeHandle;
  isAscending = isAscending;
  isSortable = isSortable;
  isUnsorted = isUnsorted;
  resizeHandle = resizeHandle;
  sort = sort;

  isSelected = (data) =>
    this.args.selection !== undefined && this.args.selection === data;

  select = (data) => this.args.onSelect?.(data);

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

    if (!column || column === target) return;

    event.preventDefault();

    let dragged = meta.forColumn(column, ColumnReordering);
    let to = meta.forColumn(target, ColumnReordering).position;

    while (dragged.position > to) dragged.moveLeft();
    while (dragged.position < to) dragged.moveRight();
  };

  onDragEnd = () => {
    this.dragging = undefined;
  };
}

{{!-- Headers move by drag and drop, with the mouse only. --}}
{{!-- A drag starts after pointer down, so pointer up is too late to see the resize handle. --}}
{{!-- template-lint-disable no-invalid-interactive no-pointer-down-event-binding --}}
<div class="inspector-table" ...attributes>
  <div class="inspector-table-overflow" {{this.table.modifiers.container}}>
    <table>
      <thead>
        <tr>
          {{#each this.columns as |column|}}
            <th
              class="{{if (this.isSortable column) 'is-sortable'}}
                {{if @reorderable 'is-reorderable'}}"
              draggable={{if @reorderable "true"}}
              data-test-table-header-column
              {{this.table.modifiers.columnHeader column}}
              {{on "pointerdown" this.onPointerDown capture=true}}
              {{on "dragstart" (fn this.onDragStart column)}}
              {{on "dragover" this.onDragOver}}
              {{on "drop" (fn this.onDrop column)}}
              {{on "dragend" this.onDragEnd}}
            >
              {{#if (this.isSortable column)}}
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
                        {{if (this.isAscending column) 'is-ascending' 'is-descending'}}"
                    ></span>
                  {{/unless}}
                </button>
              {{else}}
                {{column.name}}
              {{/if}}

              {{#if (this.hasResizeHandle column)}}
                <button
                  type="button"
                  aria-label="Resize {{column.name}}"
                  class="resize-handle"
                  {{this.resizeHandle column}}
                ></button>
              {{/if}}
            </th>
          {{/each}}
        </tr>
      </thead>
      <tbody>
        <VerticalCollection
          @items={{this.rows}}
          @containerSelector=".inspector-table-overflow"
          @estimateHeight={{37}}
          @staticHeight={{true}}
          @bufferSize={{10}}
          as |row index|
        >
          {{yield
            (component
              "inspector-table/row"
              data=row.data
              columns=this.columns
              isSelectable=(if @onSelect true false)
              isSelected=(this.isSelected row.data)
              onSelect=this.select
            )
            index
          }}
        </VerticalCollection>
      </tbody>
    </table>
  </div>
</div>
