import WebExtension from './web-extension';
import { tracked } from '@glimmer/tracking';

export default class Chrome extends WebExtension {
  name = 'chrome';
  @tracked canOpenResource = true;

  openResource(file: string, line: number) {
    // For some reason it opens the line after the one specified
    chrome.devtools.panels.openResource(file, line - 1);
  }
}
