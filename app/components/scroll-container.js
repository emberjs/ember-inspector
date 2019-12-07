import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { tracked } from '@glimmer/tracking';

export default class ScrollIntoViewIfNeededComponent extends Component {
  attributeBindings = ['style'];

  @tracked collection;
  @tracked currentItem;
  @tracked itemHeight;

  lastIndex = -1;
  lastItem = undefined;

  get style() {
    return htmlSafe(`
      position: relative;
      height: 100%;
    `);
  }

  get scrollTargetStyle() {
    let { index, itemHeight } = this;

    if (index === -1) {
      return htmlSafe('display: none;');
    } else {
      return htmlSafe(`
        position: absolute;
        width: 100%;
        height: ${itemHeight || 0}px;
        margin: 0px;
        padding: 0px;
        top: ${index * itemHeight || 0}px;
        left: 0px;
        z-index: -9999;
        pointer-events: none;
      `);
    }
  }

  get index() {
    return this.collection.indexOf(this.currentItem);
  }

  didRender() {
    let { index, lastIndex, currentItem, lastItem, element } = this;

    if (index !== lastIndex || currentItem !== lastItem) {
      this.lastIndex = index;
      this.lastItem = currentItem;

      let scrollTraget = element.querySelector('.scroll-target');

      if (needsScroll(element, scrollTraget)) {
        scrollTraget.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })
      }
    }
  }
}

function needsScroll(container, target) {
  let { top: containerTop, bottom: containerBottom } = container.getBoundingClientRect();
  let { top: targetTop, bottom: targetBottom } = target.getBoundingClientRect();
  return targetTop < containerTop || targetBottom > containerBottom;
}
