import Helper from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export default Helper.extend({
  compute(params) {
    const [hasChildren, parentCount] = params;
    const triangleOffset = hasChildren ? 12 : 0;
    const padding = parentCount * 20 - triangleOffset + 25;

    return htmlSafe(`padding-left: ${padding}px;`);
  }
});
