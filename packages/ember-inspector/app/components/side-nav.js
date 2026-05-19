import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SideNav extends Component {
  @service layout;
  @service router;

  @tracked displayCount = 100;

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
        icon: 'nav-components',
        label: 'Components',
        title: 'Components',
        pillCount: '',
      },
      {
        route: 'route-tree',
        icon: 'nav-route-tree',
        label: 'Routes',
        title: 'Routes',
        pillCount: '',
      },
      {
        route: 'data',
        icon: 'nav-data',
        label: 'Data',
        title: 'Data',
        pillCount: '',
      },
      {
        route: 'deprecations',
        icon: 'nav-deprecations',
        label: 'Deprecations',
        title: `${this.args.deprecationCount} Deprecations`,
        pillCount: `${this.args.deprecationCount}`,
      },
      {
        route: 'info',
        icon: 'nav-info',
        label: 'Info',
        title: 'Info',
        pillCount: '',
      },
      {
        route: 'promise-tree',
        icon: 'nav-promises',
        label: 'Promises',
        title: 'Promises',
        pillCount: '',
      },
      {
        route: 'container-types',
        icon: 'nav-container',
        label: 'Container',
        title: 'Container',
        pillCount: '',
      },
      {
        route: 'render-tree',
        icon: 'nav-render-performance',
        label: 'Render Performance',
        title: 'Render Performance',
        pillCount: '',
      },
    ];
  }

  handleResize() {
    const containerHeight = this.element.clientHeight;
    const item = this.element.querySelector('.nav-item');
    const itemHeight = item.clientHeight;

    this.displayCount = Math.floor(containerHeight / itemHeight) - 1;
  }

  @action
  setupListeners(element) {
    this.element = element;
    this.layout.on('resize', this, this.handleResize);
    this.handleResize();
  }

  @action
  destroyListeners() {
    this.layout.off('resize', this, this.handleResize);
  }

  @action
  handleOverflowSelect(event) {
    if (event.target.value) {
      this.router.transitionTo(event.target.value);
    }
  }
}
