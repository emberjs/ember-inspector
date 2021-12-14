import Ember from '../ember';

let Component;

try {
  Component = requireModule('@ember/component')['default'];
} catch {
  Component = Ember.Component;
}

export default Component;
