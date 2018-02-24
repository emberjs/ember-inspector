import Ember from 'ember';
const { computed } = Ember;
let supportsSetterGetter;

try {
  computed({
    set() { },
    get() { }
  });
  supportsSetterGetter = true;
} catch (e) {
  supportsSetterGetter = false;
}

export default supportsSetterGetter;
