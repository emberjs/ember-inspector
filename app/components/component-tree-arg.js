import Component from '@glimmer/component';
import truncate from 'ember-inspector/utils/truncate';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ComponentTreeArgs extends Component {
  @service port;

  get valueIsObject() {
    return typeof this.args.componentArgValue === 'object' && this.args.componentArgValue !== null;
  }

  get componentArgumentDisplay() {
    if (this.valueIsObject) {
      return '...';
    } else if (typeof this.args.componentArgValue === 'string') {
      // Escape any interior quotes – we will add the surrounding quotes in the template
      return `"${truncate(this.args.componentArgValue.replace(/"/g, '\\"'))}"`;
    }

    return String(this.args.componentArgValue);
  }

  @action inspectArgumentValue(event) {
    event.stopPropagation();
    this.port.send('objectInspector:inspectById', {
      objectId: this.args.componentArgValue.id
    });
  }
}
