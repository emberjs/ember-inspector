<div
  class="list"
  ...attributes
  {{did-insert this.elementInserted}}
  {{did-update this.schemaUpdated this.schema}}
>
  {{#if this.schema.columns.length}}
    <div class="list-header">
      <div class="list-table-container">
        <table>
          <colgroup>
            {{#each this.columns key="id" as |column|}}
              <col style={{build-style width=(concat column.width "px")}} />
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
    @headerHeight={{this.headerHeight}} as |content|
  >
    {{yield
      (hash
        cell=(component "list-cell" tagName="td")
        rowEvents=content.rowEvents
        vertical-collection=(component
          "vertical-collection"
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
        (not-eq column (get this.columns (sub this.columns.length 1)))
      )
    }}
      <Ui::DragHandle
        @faded={{true}}
        @left={{column.left}}
        @minWidth={{this.minWidth}}
        @maxWidth={{column.maxWidth}}
        @on-drag={{fn this.didResize column.id}}
        @position={{one-way column.width}}
        @side="left"
      />
    {{/if}}
  {{/each}}
</div>