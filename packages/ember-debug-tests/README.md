# ember-debug-tests

This app runs the ember-debug tests against many versions of ember-source.
The inspector UI (`packages/ember-inspector`) is not part of this app, so the
UI only needs to build with its own version of ember-source.

```bash
pnpm build:ember-debug   # from the repository root
pnpm --filter ember-debug-tests test
```

To test with a different version of ember-source, use a scenario from
`config/ember-try.js`:

```bash
cd packages/ember-debug-tests
pnpm exec ember try:one ember-lts-4.12 --- ember test
```
