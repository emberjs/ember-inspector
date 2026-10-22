import Component from '@glimmer/component';
import { RenderItem } from 'ember-inspector/controllers/component-tree';

class RenderItemNoParent extends RenderItem {
  get level() {
    return 0;
  }

  get hasChildren() {
    return false;
  }
}

export default class ComponentParents extends Component {
  get accordionMixin() {
    return {
      name: 'rendered by',
      expand: true,
      properties: {
        length: 1,
      },
    };
  }
  get parents() {
    const parents = [];
    let item = this.args.item?.parentItem;
    while (item) {
      parents.push(
        new RenderItemNoParent(
          item.controller,
          item.parentItem,
          item.renderNode,
        ),
      );
      item = item.parentItem;
    }
    return parents;
  }

  selectComponent = (item) => {
    this.args.select(item);
  };
}
