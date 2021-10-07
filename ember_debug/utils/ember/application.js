import Ember from '.';

let Application;

try {
  Application = requireModule('@ember/application')['default'];
} catch {
  Application = Ember.Application;
}

export default Application;
