import Ember from '../../ember';

let Observable;

try {
  Observable = requireModule('@ember/object/observable')['default'];
} catch {
  Observable = Ember.Observable;
}

export default Observable;
