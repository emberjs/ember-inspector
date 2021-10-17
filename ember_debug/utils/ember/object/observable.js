import Ember from '..';

let Observable;

try {
  Observable = requireModule('@ember/object/observable')['default'];
} catch {
  Observable = Ember.Observable;
}

export default Observable;
