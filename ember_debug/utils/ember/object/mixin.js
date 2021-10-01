import Ember from '..';

let Mixin;

try {
  Mixin = requireModule('@ember/object/mixin')['default'];
} catch {
  Mixin = Ember.Mixin;
}

export default Mixin;
