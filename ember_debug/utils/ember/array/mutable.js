import Ember from '../../ember';

let MutableArray;

try {
  MutableArray = requireModule('@ember/array/mutable')['default'];
} catch {
  MutableArray = Ember.MutableArray;
}

export default MutableArray;
