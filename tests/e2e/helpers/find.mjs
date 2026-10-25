/**
 * These functions run in the browser, so each one can only use
 * its own arguments and the browser globals.
 *
 * WebDriver sends an `undefined` argument as `null`.
 */

/**
 * Returns the first element that matches `selector` and contains `text`,
 * scrolled into view.
 */
export function findElement(selector, text) {
  for (let element of document.querySelectorAll(selector)) {
    if (text == null || element.textContent.includes(text)) {
      element.scrollIntoView({ block: 'center' });
      return element;
    }
  }

  return null;
}

/**
 * Like `findElement`, but returns the center of the element
 * in viewport coordinates.
 */
export function centerOf(selector, text) {
  for (let element of document.querySelectorAll(selector)) {
    if (text == null || element.textContent.includes(text)) {
      element.scrollIntoView({ block: 'center' });
      let rect = element.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }
  }

  return null;
}
