import Ember from '..';

let ArrayProxy;

try {
  ArrayProxy = requireModule('@ember/array/proxy')['default'];
} catch {
  ArrayProxy = Ember.ArrayProxy;
}

export default ArrayProxy;
