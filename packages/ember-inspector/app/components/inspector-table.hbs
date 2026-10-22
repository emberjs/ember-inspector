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
