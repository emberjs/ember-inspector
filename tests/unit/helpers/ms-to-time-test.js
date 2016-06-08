import { msToTime } from '../../../helpers/ms-to-time';
import { module, test } from 'qunit';

module('Unit | Helper | ms to time');

test('it should format time to milliseconds', function(assert) {
  assert.equal(msToTime([0.42]), '0.42ms');
});
