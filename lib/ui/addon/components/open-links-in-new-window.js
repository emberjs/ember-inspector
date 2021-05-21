import Component from '@ember/component';

export default class OpenLinksInNewWindow extends Component {
  click(e) {
    if (e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault();
      window.open(e.target.href);
    }
  }
}
