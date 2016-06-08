import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('render-item', 'Integration | Component | render item', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.set('item', Ember.Object.create({
    name: 'First View Rendering'
  }));

  this.render(hbs`{{render-item item}}`);

  assert.equal(this.$('[data-label="render-profile-name"]').text().trim(), "First View Rendering");
});
