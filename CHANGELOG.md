# Ember Inspector Changelog


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
