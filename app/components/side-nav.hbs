<div
  ...attributes
  {{did-insert this.setupListeners}}
  {{will-destroy this.destroyListeners}}
>
  <nav class="absolute inset-0 nav nav-main {{if @collapsed "nav-collapsed overflow-hidden"}}">
    <ul>
      {{#each this.itemsToDisplay as |item|}}
        <li>
          <LinkTo @route={{item.route}} class="nav-item" title={{item.title}}>
            {{svg-jar item.icon width="20px" height="20px" class="nav-item-icon"}}
            <span class="nav-item-label">{{item.label}}</span>
            {{#if item.pillCount}}
              <span class="pill">{{item.pillCount}}</span>
            {{/if}}
          </LinkTo>
        </li>
      {{/each}}
      {{#if (and @collapsed this.overflowItems.length)}}
        <li
          class="{{if this.overflowItemIsActive "nav-overflow-active"}} nav-overflow relative flex items-center justify-center cursor-pointer"
          title="More options"
        >
          <select
            aria-label="More options"
            class="w-full border-0 bg-transparent py-2 appearance-none opacity-0"
            {{on "change" this.handleOverflowSelect}}
          >
            <option value="">More options…</option>
            {{#each this.overflowItems as |item|}}
              <option value={{item.route}} selected={{match this.currentRouteName item.route}}>
                {{item.label}}
              </option>
            {{/each}}
          </select>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            {{svg-jar "ellipsis" width="22px" height="22px"}}
          </div>
        </li>
      {{/if}}
    </ul>
  </nav>
</div>
