import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('deprecation-item', 'Integration | Component | deprecation item', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{deprecation-item}}`);

  assert.equal(this.$().text().trim(), 'Trace in the console');
});
