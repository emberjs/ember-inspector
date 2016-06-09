import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('list-view', 'Integration | Component | list view', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{list-view}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:" + EOL +
  /*this.render(hbs`
    {{#list-view}}
      template block text
    {{/list-view}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');*/
});
