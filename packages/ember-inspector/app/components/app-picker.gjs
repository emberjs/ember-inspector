import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AppPickerComponent extends Component {
  @service port;

  get apps() {
    return this.port.detectedApplications;
  }

  get selectedAppId() {
    return this.port.applicationId;
  }

  constructor() {
    super(...arguments);
    this.port.send('app-picker-loaded');
  }

  @action
  selectApp(event) {
    let applicationId = event.target.value;
    this.port.selectApplication(applicationId);
  }
}

<div class="app-picker">
  <div class="h-7 text-base13">
    <select
      aria-label="Select app"
      class="{{if @collapsed "opacity-0"}} box-border block w-full h-full m-0 border-0 pr-4 pl-2 text-base text-base13 bg-transparent appearance-none outline-none"
      {{on 'change' this.selectApp}}
    >
      {{#each-in this.apps as |id name|}}
        <option
          value={{id}}
          selected={{eq id this.selectedAppId}}
        >
          {{name}}
        </option>
      {{/each-in}}
    </select>

    {{#if @collapsed}}
      {{svg-jar "e-logo" width="15" height="13" class="dropdown-collapsed-icon fill-current absolute pointer-events-none"}}
    {{/if}}

    {{svg-jar "dropdown-arrow" class="dropdown-arrow fill-current absolute opacity-75 pointer-events-none"}}
  </div>
</div>
