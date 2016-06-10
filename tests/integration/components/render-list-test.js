import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('render-list', 'Integration | Component | render list', {
  integration: true
});

test('it renders', function(assert) {
  
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{render-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:" + EOL +
  this.render(hbs`
    {{#render-list}}
      template block text
    {{/render-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
