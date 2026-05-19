import Component from '@glimmer/component';

export default class OpenLinksInNewWindow extends Component {
  linkClicked(e) {
    const link = e.target.closest?.('a');

    if (!link || !link.href) {
      return;
    }

    e.preventDefault();

    try {
      const url = new URL(link.href);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
      }

      window.open(url.href, '_blank', 'noopener,noreferrer');
    } catch {
      return;
    }
  }
}
