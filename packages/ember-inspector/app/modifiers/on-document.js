import { modifier } from 'ember-modifier';

/**
 * Listens to an event on `document` for as long as the element renders.
 *
 *   <div {{onDocument "keydown" this.handleKeyDown}}></div>
 */
export default modifier((element, [eventName, handler]) => {
  document.addEventListener(eventName, handler);

  return () => document.removeEventListener(eventName, handler);
});
