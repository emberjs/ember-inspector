'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  rules: {
    'color-hex-length': false,
    'no-invalid-position-at-import-rule': false,
    'number-max-precision': false,
    'property-no-vendor-prefix': false,
  },
};
