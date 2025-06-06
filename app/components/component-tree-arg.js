import Component from '@glimmer/component';
import truncate from 'ember-inspector/utils/truncate';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ComponentTreeArg extends Component {
  @service port;

  get isObject() {
    return typeof this.args.value === 'object' && this.args.value !== null;
  }

  get displayValue() {
    if (this.isObject) {
      if (this.args.value.inspect) {
        if (this.args.value.type === 'function') {
          return this.args.value.inspect
            .replace(/"/g, '\\"')
            .replace('bound ', '')
            .replace('{ ... }', '');
        }
        return truncate(this.args.value.inspect.replace(/"/g, '\\"'));
      }
      return '...';
    } else if (typeof this.args.value === 'string') {
      // Escape any interior quotes – we will add the surrounding quotes in the template
      return truncate(this.args.value.replace(/"/g, '\\"'));
    }

    return String(this.args.value);
  }

  @action inspect(event) {
    event.stopPropagation();
    this.port.send('objectInspector:inspectById', {
      objectId: this.args.value.id,
    });
  }
}
