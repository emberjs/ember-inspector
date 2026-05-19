/* eslint-disable */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember.built-in-components.import' },
    { handler: 'silence', matchId: 'implicit-injections' },
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }
  ],
};
