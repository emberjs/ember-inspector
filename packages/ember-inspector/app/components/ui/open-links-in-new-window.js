import Component from '@glimmer/component';

export default class OpenLinksInNewWindow extends Component {
  linkClicked(e) {
    if (e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault();
      window.open(e.target.href);
    }
  }
}
