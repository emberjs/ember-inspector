/**
 * Helper that returns the schema based on the name passed.
 * Looks in the `app/schemas` folder. Schemas are used to
 * define columns in lists.
 *
 * @method schemaFor
 * @param {Array} [name] First element is the name of the schema
 * @return {Object} The schema
 */
import Helper from '@ember/component/helper';

import { getOwner } from '@ember/application';
export default class SchemaFor extends Helper {
  compute([name]) {
    return getOwner(this).resolveRegistration(`schema:${name}`);
  }
}
