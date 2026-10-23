import DraggableColumn from 'ember-inspector/components/ui/draggable-column';
import { LinkTo } from '@ember/routing';
<template>
  <div class="split">
    <DraggableColumn
      @classes="split-panel split-panel-sidebar-2 nav"
      @side="left"
      @width={{@controller.navWidth}}
    >
      <div class="split-panel-bd">
        <ul>
          <li>
            <LinkTo @route="libraries" class="nav-item">
              <span class="nav-item-label">Libraries</span>
            </LinkTo>
          </li>
          <li>
            <LinkTo @route="app-config" class="nav-item">
              <span class="nav-item-label">App Config</span>
            </LinkTo>
          </li>
          <li>
            <LinkTo @route="changelog" class="nav-item">
              <span class="nav-item-label">Changelog</span>
            </LinkTo>
          </li>
        </ul>
      </div>
    </DraggableColumn>

    <div class="split-panel">
      <div class="split-panel-bd">
        {{outlet}}
      </div>
    </div>
  </div>
</template>
