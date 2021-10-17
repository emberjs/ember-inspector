let Ember;

try {
  Ember = requireModule('ember')['default'];
} catch {
  Ember = window.Ember;
}

export default Ember;
