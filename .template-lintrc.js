'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-at-ember-render-modifiers': false,
    'no-down-event-binding': false,
    'no-negated-condition': false,

    // TODO: enable these rules
    'no-builtin-form-components': false,
    'no-positive-tabindex': false,
  },
};
