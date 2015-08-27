# Ember Inspector Changelog

## Ember Inspector 1.9.1

* [BUGFIX] Fix value of this after ES6 refactor

## Ember Inspector 1.9.0

* [IMPROVEMENT] Speed up source map computation in deprecations pane [#439](https://github.com/emberjs/ember-inspector/pull/439)
* [BUGFIX] Fix resolver and Ember.View errors in Ember 2.0 canary [#440](https://github.com/emberjs/ember-inspector/pull/440)
* [BUGFIX] Fix components not being detected inside {{each}} helper [#428](https://github.com/emberjs/ember-inspector/pull/428)
* [BUGFIX] Fix "object could not be cloned" error when prototype extensions are disabled [#435](https://github.com/emberjs/ember-inspector/pull/435)
* [BUGFIX] Tomster should be not hidden if the Ember app contains an iframe [#436](https://github.com/emberjs/ember-inspector/pull/436)
* [BUGFIX] Guard against renderNode.lastResult being null
[#437](https://github.com/emberjs/ember-inspector/pull/437)
* [BUGFIX] Fix object inspector toggle button being hidden when the object inspector is expanded.
[#438](https://github.com/emberjs/ember-inspector/pull/438)
* [BUGFIX] Prevent deprecations for Ember.keys on Ember 2.0.0 [#426](https://github.com/emberjs/ember-inspector/pull/426)
* [INTERNAL] Rewrite the entire build process to targets all platforms in the same build [#374](https://github.com/emberjs/ember-inspector/pull/374)
* [INTERNAL] Refactor all the code to use ES6 [#368](https://github.com/emberjs/ember-inspector/pull/368), [#370](https://github.com/emberjs/ember-inspector/pull/370), [#372](https://github.com/emberjs/ember-inspector/pull/372),
[#376](https://github.com/emberjs/ember-inspector/pull/376)
,
[#387](https://github.com/emberjs/ember-inspector/pull/387)
* [INTERNAL] Update the README deployment steps [#442](https://github.com/emberjs/ember-inspector/pull/442)
* [INTERNAL] Use a new eslint config (eslint-config-ember) [#371](https://github.com/emberjs/ember-inspector/pull/371)
* [INTERNAL] Fix the build commands in README [#385](https://github.com/emberjs/ember-inspector/pull/385)
* [INTERNAL] Add CODE_OF_CONDUCT.md

## Ember Inspector 1.8.3

* [BUGFIX] Fix routes pane for Ember >= 1.13 [#399](https://github.com/emberjs/ember-inspector/pull/399)
* [BUGFIX] Fix sending view model to console [#412](https://github.com/emberjs/ember-inspector/pull/412)
* [BUGFIX] Guard against renderNode not being rendered yet [#417](https://github.com/emberjs/ember-inspector/pull/417)

## Ember Inspector 1.8.2

* [IMPROVEMENT] Add support for Ember Data >= 1.0.0-beta.19 [#383](https://github.com/emberjs/ember-inspector/pull/383)
* [IMPROVEMENT] Add support for Ember >= 1.13.0 [#393](https://github.com/emberjs/ember-inspector/pull/393)
  - Rename `Ember.Debug` to `Ember.EmberInspectorDebugger`
  - Remove calls to `Ember.View.addMutationListener`
  - Use the container's view registry instead of `Ember.View.views`

## Ember Inspector 1.8.1

* [IMPROVEMENT] Remove new CP syntax deprecation warning [#362](https://github.com/emberjs/ember-inspector/pull/362)

## Ember Inspector 1.8.0

* [IMPROVEMENT] The view tree now supports glimmer [#357](https://github.com/emberjs/ember-inspector/pull/357)
* [IMPROVEMENT] Catch errors triggered by the inspector and show them as warnings [#343](https://github.com/emberjs/ember-inspector/pull/343)
* [IMPROVEMENT] Handle and display errors caused by CP calculation in the object inspector [#342](https://github.com/emberjs/ember-inspector/pull/342)
* [IMPROVEMENT] Stop deprecation logging in console and add one warning [#347](https://github.com/emberjs/ember-inspector/pull/347)
* [IMPROVEMENT] Speed up the deprecations tab and source map computation [#358](https://github.com/emberjs/ember-inspector/pull/358)
* [BUGFIX] Include ember-new-computed in ember-debug to remove CP syntax deprecations [#352](https://github.com/emberjs/ember-inspector/pull/352)
* [INTERNAL] Tests now use async/await instead of async test helpers [#340](https://github.com/emberjs/ember-inspector/pull/340)
* [INTERNAL] Use new CP syntax [#337](https://github.com/emberjs/ember-inspector/pull/337)
* [INTERNAL] Add eslint [#340](https://github.com/emberjs/ember-inspector/pull/340)
* [INTERNAL] Use broccoli-es6modules (esperanto) to transpile ember-debug [#328](https://github.com/emberjs/ember-inspector/pull/328)
* [INTERNAL] Upgrade to ember-cli 0.2 and qunit 2.0 syntax [#330](https://github.com/emberjs/ember-inspector/pull/330) [#332](https://github.com/emberjs/ember-inspector/pull/332) [#293](https://github.com/emberjs/ember-inspector/pull/293)
* [INTERNAL] Upgrade to Ember 1.10 [#329](https://github.com/emberjs/ember-inspector/pull/329)

## Ember Inspector 1.7.3

* [BUGFIX] Don't assume prototype extensions are enabled
* [BUGFIX] Descriptor is no longer exposed on the Ember global
* [BUGFIX] Handle case where container type no longer exists after reload

## Ember Inspector 1.7.2

* [BUGFIX] Fixed error when `define` is defined but `requireModule` is not
* [BUGFIX] Fixed Ember 1.11 resolver bug that broke the routes tab
* [BUGFIX] Only destroy the promise assembler if it exists
* [BUGFIX] Use the new Ember load hook if available
* [BUGFIX] Fixed issue with deferred apps getting mistakenly detected
* [BUGFIX] ObjectInspector is not destroyed last on app reset
* [BUGFIX] Use registry.resolve for latest Ember
* Add grunt-cli to package.json
* Do not minify code for FF addon

## Ember Inspector 1.7.1

* [BUGFIX] Fix the inspector for Ember < 1.4

## Ember Inspector 1.7.0

* [FEATURE] Added a new deprecations tab
* [FEATURE] The inspector now works in tests
* [FEATURE] Inspector state is now preserved across reloads
* [IMPROVEMENT] Fixed object naming to account for module based names
* [IMPROVEMENT] Moved the project to ember-cli
* [IMPROVEMENT] Added a date picker to the object inspector
* [IMPROVEMENT] Migrated to the new chrome extension options dialog
* [BUGFIX] The data tab now detects models using pod structure
* [BUGFIX] Prevent duplicate model types in the data tab
* [BUGFIX] Improved startup so the inspector launches before the app
* [BUGFIX] We now store `instrumentWithStack` in session storage for reloads
* [BUGFIX] Ember.Debug as a namespace was changing inspected object names
* [BUGFIX] The render performance tab now fails silently on render errors
* [BUGFIX] Nested components no longer cause wrong views to be listed
* [BUGFIX] Guarded against `event.data`in window messages being null
* Use Ember's `ViewUtils` to get the `BoundingClientRect`
* Ensured last Firefox addon-sdk is used
* Added warning to the README about the use of window messages

## Ember Inspector 1.6.4

* [BUGFIX] Check type of EMBER_INSPECTOR_CONFIG

## Ember Inspector 1.6.3

* Use the new `Ember.libraries` api for newer Ember versions

## Ember Inspector 1.6.2

* Add dist directories to npm

## Ember Inspector 1.6.1

* [BUGFIX] Used general dot replacement in regex expressions to support nested routes
* Used `document.defaultView.eval` to support FF >= 34
* Added npm `prepublish` hook

## Ember Inspector 1.6.0

* [FEATURE] Added new "Container" tab
* [FEATURE] Added `EmberInspector.inspect(obj)` to send objects to the inspector
* [FEATURE] Views generated by `each` helper are now shown by default
* [FEATURE] Added a link to Github issues
* [FEATURE] Object inspector can now drill into arrays
* [FEATURE] Added support for dates in the object inspector
* [IMPROVEMENT] Main nav is now resizable
* [IMPROVEMENT] Performance improvement by making promise tracing opt-in
* [IMPROVEMENT] Model types are now sorted alphabetically
* [IMPROVEMENT] Separated regular tabs from advanced tabs
* [IMPROVEMENT] Detecting the application view no longer depends on `ember-application` class
* [BUGFIX] `null` values now show up as "null" in the object inspector
* [BUGFIX] Empty values in the object inspector should be editable
* [BUGFIX] Support views without a controller
* [BUGFIX] Firefox Tomster script no longer conflicts with WYSIWYGs
* [BUGFIX] Fixed issue with toolbar and expanding the object inspector
* [BUGFIX] Removed 404 image errors from tests

## Ember Inspector 1.5.0

* [IMPROVEMENT] Redesigned the UI to be more consistent with Chrome dev tools
* [IMPROVEMENT] Improved "appeared" performance by instrumenting out of band
* [BUGFIX] Fixed compatibility issue between promise inspection and Ember >= 1.7
* [BUGFIX] Fixed view highlighting after metal-views upgrade
* [BUGFIX] Fixed conflict between injecting Tomster script and file upload libraries

## Ember Inspector 1.4.0

* [FEATURE] Added bookmark option to support all browsers
* [FEATURE] Added support for multiple iframes
* [FEATURE] Added optional Tomster to Firefox
* [FEATURE] Added "display current route" option to the routes tab
* [IMPROVEMENT] Removed redundant prefixes from class names in the view tree
* [IMPROVEMENT] Added search field to the render performance tab
* [BUGFIX] Fixed current route match when resource same as route name
* [BUGFIX] Fixed bug where a maximum of one namespace was assumed
* [BUGFIX] Fixed render perf tab for apps with prototype extensions disabled
* [BUGFIX] Routes tab no longer instantiates controllers
* `data-ember-extension` is now only added to the HTML tag (instead of the body).

## Ember Inspector 1.3.1

* [IMPROVEMENT] Better view names in the render performance tab
* [IMPROVEMENT] Object inspector now skips properties ending with `Binding`
* [IMPROVEMENT] Removed several `Ember.View` private props from the Object Inspector
* [BUGFIX] Fixed hierarchy issue in render perf tree causing duplication of views
* [BUGFIX] Fixed scrollbar in render performance tab on OS X
* [BUGFIX] Object inspector should not assume all `_debugInfo` props exist

## Ember Inspector 1.3.0

* [FEATURE] Added new "Render Performance" tab
* [FEATURE] Added new column "Duration" to the view tree
* [BUGFIX] Fixed bug with editing json strings in the object inspector
* [BUGFIX] Fixed permission denied exception on Firefox >= 30
* Removed dummy URLs created by Ember for error and loading routes
* Removed methods from the object inspector

## Ember Inspector 1.2.0

* [FEATURE] Add info tab that shows a list of libraries used and their versions
* [FEATURE] Add a Tomster icon to Chrome bar on any page with an Ember app (opt-in in chrome://extensions -> Ember Inspector -> options)
* [FEATURE] Promise chains can now be collapsed / expanded. Fulfilled promises are collapsed by default. Rejected and pending are expanded.
* Replaced $E button with "Stack trace" when the promise rejects with an instance of `Error`.
* Added support for async loading of Ember (such as requirejs)
* Added a hint to refresh the page when the Inspector is open after a few promises were created and uncaught.
* [BUGFIX] Error message about file:// protocol should only be shown on Chrome
* [BUGFIX] Add missing ember.prod.js file in vendors
