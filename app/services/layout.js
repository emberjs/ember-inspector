/**
 * Layout service used to broadcast changes to the application's
 * layout due to resizing of the main nav or the object inspector toggling.
 *
 * Whenever something resizes it triggers an event on this service. For example
 * when the main nav is resized.
 * Elements dependant on the app's layout listen to events on this service. For
 * example the `x-list` component.
 *
 * @class Layout
 * @extends Service
 */
import Ember from 'ember';
const { Service, Evented } = Ember;
export default Service.extend(Evented);
