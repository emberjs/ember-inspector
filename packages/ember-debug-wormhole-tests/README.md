# ember-debug-wormhole-tests

This app runs the ember-debug tests that need the `ember-wormhole` addon.
`ember-wormhole` does not support Ember 7, so these tests are not part of
`packages/ember-debug-tests`, and they run with one version of ember-source.

```bash
pnpm build:ember-debug   # from the repository root
pnpm --filter ember-debug-wormhole-tests test
```
