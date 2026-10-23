import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { onResize } from 'ember-primitives/on-resize';
import { LinkTo } from '@ember/routing';
import NavComponentsIcon from 'ember-inspector/svg/nav-components.svg?unsafe-inline';
import NavRouteTreeIcon from 'ember-inspector/svg/nav-route-tree.svg?unsafe-inline';
import NavDataIcon from 'ember-inspector/svg/nav-data.svg?unsafe-inline';
import NavDeprecationsIcon from 'ember-inspector/svg/nav-deprecations.svg?unsafe-inline';
import NavInfoIcon from 'ember-inspector/svg/nav-info.svg?unsafe-inline';
import NavPromisesIcon from 'ember-inspector/svg/nav-promises.svg?unsafe-inline';
import NavContainerIcon from 'ember-inspector/svg/nav-container.svg?unsafe-inline';
import NavRenderPerformanceIcon from 'ember-inspector/svg/nav-render-performance.svg?unsafe-inline';
import EllipsisIcon from 'ember-inspector/svg/ellipsis.svg?unsafe-inline';
import match from 'ember-inspector/helpers/match';

export default class SideNav extends Component {
  <template>
    <div ...attributes {{onResize this.containerDidResize}}>
      <nav
        class="absolute inset-0 nav nav-main
          {{if @collapsed 'nav-collapsed overflow-hidden'}}"
      >
        <ul>
          {{#each this.itemsToDisplay as |item|}}
            <li>
              <LinkTo
                @route={{item.route}}
                class="nav-item"
                title={{item.title}}
              >
                <item.icon
                  width="20px"
                  height="20px"
                  class="nav-item-icon"
                  aria-hidden="true"
                />
                <span class="nav-item-label">{{item.label}}</span>
                {{#if item.pillCount}}
                  <span class="pill">{{item.pillCount}}</span>
                {{/if}}
              </LinkTo>
            </li>
          {{/each}}
          {{#if (and @collapsed this.overflowItems.length)}}
            <li
              class="{{if this.overflowItemIsActive 'nav-overflow-active'}}
                nav-overflow relative flex items-center justify-center cursor-pointer"
              title="More options"
            >
              <select
                aria-label="More options"
                class="w-full border-0 bg-transparent py-2 appearance-none opacity-0"
                {{on "change" this.handleOverflowSelect}}
              >
                <option value>More options…</option>
                {{#each this.overflowItems as |item|}}
                  <option
                    value={{item.route}}
                    selected={{match this.currentRouteName item.route}}
                  >
                    {{item.label}}
                  </option>
                {{/each}}
              </select>
              <div
                class="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <EllipsisIcon width="22px" height="22px" aria-hidden="true" />
              </div>
            </li>
          {{/if}}
        </ul>
      </nav>
    </div>
  </template>
  @service router;

  @tracked containerHeight = null;
  @tracked itemHeight = null;

  /**
   * How many items fit in the collapsed nav. The rest go in the overflow menu.
   * Until the nav reports its size, every item shows.
   */
  get displayCount() {
    if (!this.containerHeight || !this.itemHeight) {
      return this.items.length;
    }

    return Math.floor(this.containerHeight / this.itemHeight) - 1;
  }

  get itemsToDisplay() {
    return this.args.collapsed
      ? this.items.slice(0, this.displayCount)
      : this.items;
  }

  get overflowItems() {
    return this.args.collapsed ? this.items.slice(this.displayCount, 1000) : [];
  }

  get currentRouteName() {
    return this.router.currentRouteName;
  }

  get overflowItemIsActive() {
    return this.overflowItems.find((item) => {
      return this.currentRouteName.match(item.route);
    });
  }

  get items() {
    return [
      {
        route: 'component-tree',
        icon: NavComponentsIcon,
        label: 'Components',
        title: 'Components',
        pillCount: '',
      },
      {
        route: 'route-tree',
        icon: NavRouteTreeIcon,
        label: 'Routes',
        title: 'Routes',
        pillCount: '',
      },
      {
        route: 'data',
        icon: NavDataIcon,
        label: 'Data',
        title: 'Data',
        pillCount: '',
      },
      {
        route: 'deprecations',
        icon: NavDeprecationsIcon,
        label: 'Deprecations',
        title: `${this.args.deprecationCount} Deprecations`,
        pillCount: `${this.args.deprecationCount}`,
      },
      {
        route: 'info',
        icon: NavInfoIcon,
        label: 'Info',
        title: 'Info',
        pillCount: '',
      },
      {
        route: 'promise-tree',
        icon: NavPromisesIcon,
        label: 'Promises',
        title: 'Promises',
        pillCount: '',
      },
      {
        route: 'container-types',
        icon: NavContainerIcon,
        label: 'Container',
        title: 'Container',
        pillCount: '',
      },
      {
        route: 'render-tree',
        icon: NavRenderPerformanceIcon,
        label: 'Render Performance',
        title: 'Render Performance',
        pillCount: '',
      },
    ];
  }

  @action
  containerDidResize(entry) {
    let element = entry.target;

    this.containerHeight = element.clientHeight;
    this.itemHeight = element.querySelector('.nav-item')?.clientHeight;
  }

  @action
  handleOverflowSelect(event) {
    if (event.target.value) {
      this.router.transitionTo(event.target.value);
    }
  }
}
