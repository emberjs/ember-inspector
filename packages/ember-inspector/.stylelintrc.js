'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  rules: {
    'color-hex-length': null,
    'no-descending-specificity': null,
    'no-invalid-position-at-import-rule': null,
    'number-max-precision': null,
    'property-no-vendor-prefix': null,
  },
};
