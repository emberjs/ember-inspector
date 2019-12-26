import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ToolbarToggleButton extends Component {
	@service('object-inspector') objectInspectorService;
}