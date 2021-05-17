import classic from 'ember-classic-decorator';
import WebExtension from './web-extension';

@classic
export default class Firefox extends WebExtension {
  name = 'firefox';
}
