/* eslint-disable */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-global' },
    { handler: 'silence', matchId: 'ember.built-in-components.import' },
    { handler: 'silence', matchId: 'ember.globals-resolver' },
    {
      handler: 'silence',
      matchId: 'deprecated-run-loop-and-computed-dot-access',
    },
    { handler: 'silence', matchId: 'implicit-injections' },
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' },
    { handler: 'silence', matchId: 'route-render-template' },
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'globals-resolver' },
  ],
};
