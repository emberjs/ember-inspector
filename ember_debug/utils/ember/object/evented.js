import Ember from '..';

let Evented;

try {
  Evented = requireModule('@ember/object/evented')['default'];
} catch {
  Evented = Ember.Evented;
}

export default Evented;
