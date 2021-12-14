import Ember from '../../ember';

let ArrayProxy;

try {
  ArrayProxy = requireModule('@ember/array/proxy')['default'];
} catch {
  ArrayProxy = Ember.ArrayProxy;
}

export default ArrayProxy;
