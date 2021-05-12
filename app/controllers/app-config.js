import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default class AppConfigController extends Controller {
  get columns() {
    return [
      { name: 'Key', valuePath: 'key' },
      { name: 'Value', valuePath: 'value' },
    ];
  }

  @computed('model')
  get rows() {
    return Object.entries(this.get('model')).map(([key, value]) => {
      const obj = { key, value };
      if (typeof obj.value === 'object') {
        obj.value = JSON.stringify(obj.value, null, 2);
      }
      return obj;
    });
  }
}
