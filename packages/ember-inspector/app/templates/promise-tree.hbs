{{#if this.toolbarContainer}}
  {{#in-element this.toolbarContainer}}
    <PromiseTreeToolbar
      @clear={{this.clear}}
      @filter={{this.filter}}
      @instrumentWithStack={{this.instrumentWithStack}}
      @refreshPage={{this.adapter.refreshPage}}
      @searchValue={{this.searchValue}}
      @setFilter={{this.setFilter}}
      @updateInstrumentWithStack={{this.updateInstrumentWithStack}}
    />
  {{/in-element}}
{{/if}}

{{#if this.shouldRefresh}}
  <Ui::EmptyMessage class="js-page-refresh">
    <p>
      Reload the page to see promises created before you opened the inspector.
    </p>
    <button
      class="js-page-refresh-btn"
      type="button"
      {{on "click" this.adapter.refreshPage}}
    >
      Reload
    </button>
  </Ui::EmptyMessage>
{{else}}
  <List class="js-promise-tree" @schema={{schema-for "promise-tree"}} as |list|>
    <list.vertical-collection @items={{this.filtered}} as |content index|>
      <tr class="list-row js-promise-tree-item {{if (mod index 2) "striped"}}">
        <PromiseItem
          @model={{content}}
          @filter={{this.filter}}
          @effectiveSearch={{this.effectiveSearch}}
          @toggleExpand={{this.toggleExpand}}
          @tracePromise={{this.tracePromise}}
          @inspectObject={{this.inspectObject}}
          @sendValueToConsole={{this.sendValueToConsole}}
          @list={{list}}
        />
      </tr>
    </list.vertical-collection>
  </List>
{{/if}}