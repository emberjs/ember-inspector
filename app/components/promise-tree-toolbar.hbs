<div class="toolbar">
  <Ui::ToolbarClearButton @action={{@clear}} class="js-clear-promises-btn" />

  {{! if should refresh the refresh button will be in the middle of the of the tab }}
  {{#unless this.shouldRefresh}}
    <Ui::ToolbarDivider />
    <Ui::ToolbarReloadButton
      @action={{@refreshPage}}
      class="js-toolbar-page-refresh-btn"
    />
  {{/unless}}

  <Ui::ToolbarDivider />

  <Ui::ToolbarSearchField
    @clear={{fn (mut @searchValue)}}
    @value={{@searchValue}}
    class="js-promise-search"
  />

  <Ui::ToolbarDivider />

  <button
    class="{{
      if (eq @filter "all") "active"
    }} toolbar-radio toolbar-radio-first js-filter"
    type="button"
    {{on "click" (fn @setFilter "all")}}
  >
    All
  </button>

  <button
    class="{{if (eq @filter "rejected") "active"}} toolbar-radio js-filter"
    type="button"
    {{on "click" (fn @setFilter "rejected")}}
  >
    Rejected
  </button>
  <button
    class="{{if (eq @filter "pending") "active"}} toolbar-radio js-filter"
    type="button"
    {{on "click" (fn @setFilter "pending")}}
  >
    Pending
  </button>
  <button
    class="{{
      if (eq @filter "fulfilled") "active"
    }} toolbar-radio toolbar-radio-last js-filter"
    type="button"
    {{on "click" (fn @setFilter "fullfilled")}}
  >
    Fulfilled
  </button>

  <Ui::ToolbarDivider />

  <div class="toolbar-checkbox js-with-stack">
    <label>
      <Input
        @type="checkbox"
        @checked={{@instrumentWithStack}}
        {{on "change" (fn @updateInstrumentWithStack (not @instrumentWithStack))
        }}
      />
      Trace promises
    </label>
  </div>
</div>