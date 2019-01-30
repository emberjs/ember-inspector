## [v3.6.0](https://github.com/emberjs/ember-inspector/tree/v3.6.0) (2019-01-29)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.5.0...v3.6.0)

**Implemented enhancements:**

- Default to Components Route [\#924](https://github.com/emberjs/ember-inspector/pull/924) ([nummi](https://github.com/nummi))

**Closed issues:**

- getApplications\(...\).mapBy is not a function [\#926](https://github.com/emberjs/ember-inspector/issues/926)

**Merged pull requests:**

- Revert the things [\#932](https://github.com/emberjs/ember-inspector/pull/932) ([rwwagner90](https://github.com/rwwagner90))
- use map for broader compatibility [\#928](https://github.com/emberjs/ember-inspector/pull/928) ([efx](https://github.com/efx))
- Bump minor version to 3.6.0 [\#922](https://github.com/emberjs/ember-inspector/pull/922) ([rwwagner90](https://github.com/rwwagner90))
- Update CHANGELOG.md [\#921](https://github.com/emberjs/ember-inspector/pull/921) ([rwwagner90](https://github.com/rwwagner90))

## [v3.5.0](https://github.com/emberjs/ember-inspector/tree/v3.5.0) (2019-01-25)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.4.0...v3.5.0)

**Implemented enhancements:**

- Chrome Store Extension page refers to old repo. [\#893](https://github.com/emberjs/ember-inspector/issues/893)
- Button to view element in browser Elements panel [\#917](https://github.com/emberjs/ember-inspector/pull/917) ([nummi](https://github.com/nummi))
- Ember 3.7 beta, bump other deps [\#911](https://github.com/emberjs/ember-inspector/pull/911) ([rwwagner90](https://github.com/rwwagner90))
- Use ember-table for Container [\#910](https://github.com/emberjs/ember-inspector/pull/910) ([nummi](https://github.com/nummi))
- Use ember-table for Libraries Tab [\#907](https://github.com/emberjs/ember-inspector/pull/907) ([nummi](https://github.com/nummi))
- Use ember-table for Routes Tab [\#906](https://github.com/emberjs/ember-inspector/pull/906) ([nummi](https://github.com/nummi))
- Data Table Colors Fixens [\#904](https://github.com/emberjs/ember-inspector/pull/904) ([nummi](https://github.com/nummi))
- Fix dropdown arrow in dark mode [\#902](https://github.com/emberjs/ember-inspector/pull/902) ([nummi](https://github.com/nummi))
- \[multiple apps\] Support multiple apps on the same page and toggling between them [\#898](https://github.com/emberjs/ember-inspector/pull/898) ([alexhancock](https://github.com/alexhancock))
- Remove Orange from Dark Theme [\#894](https://github.com/emberjs/ember-inspector/pull/894) ([nummi](https://github.com/nummi))

**Fixed bugs:**

- Components in view tree test failing Ember 3.8+ [\#915](https://github.com/emberjs/ember-inspector/issues/915)
- Error retrieving/parsing sourcemaps with absolute sourcemap URLs [\#908](https://github.com/emberjs/ember-inspector/issues/908)
- Table's area sizing issue [\#892](https://github.com/emberjs/ember-inspector/issues/892)

**Closed issues:**

- Data Table Heading Colors [\#900](https://github.com/emberjs/ember-inspector/issues/900)

**Merged pull requests:**

- Remove 2 uses of sendAction [\#920](https://github.com/emberjs/ember-inspector/pull/920) ([nlfurniss](https://github.com/nlfurniss))
- Use `\_target`, remove some duplication [\#919](https://github.com/emberjs/ember-inspector/pull/919) ([rwwagner90](https://github.com/rwwagner90))
- Fix SVG viewBox warning for ember-icon [\#913](https://github.com/emberjs/ember-inspector/pull/913) ([nummi](https://github.com/nummi))
- Fix x-list height and column width on window resize [\#912](https://github.com/emberjs/ember-inspector/pull/912) ([nummi](https://github.com/nummi))
- When forming the URL to retrieve a source map, if it is already an absolute URL then use it as is [\#909](https://github.com/emberjs/ember-inspector/pull/909) ([fusion2004](https://github.com/fusion2004))
- Bump minor version to 3.5.0 [\#905](https://github.com/emberjs/ember-inspector/pull/905) ([rwwagner90](https://github.com/rwwagner90))
- Clean up unused manifest property + prevent error in storage lookup [\#899](https://github.com/emberjs/ember-inspector/pull/899) ([22a](https://github.com/22a))
- Ember 3.5.1, lots of template lint fixes [\#896](https://github.com/emberjs/ember-inspector/pull/896) ([rwwagner90](https://github.com/rwwagner90))
- Update changelog for 3.4.0 [\#891](https://github.com/emberjs/ember-inspector/pull/891) ([rwwagner90](https://github.com/rwwagner90))

## [v3.4.0](https://github.com/emberjs/ember-inspector/tree/v3.4.0) (2018-12-03)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.3.2...v3.4.0)

**Implemented enhancements:**

- Replace Inspect Ember Component Icon with Ember "e" [\#871](https://github.com/emberjs/ember-inspector/issues/871)
- What's New [\#821](https://github.com/emberjs/ember-inspector/issues/821)
- add a refresh button for Data tab like you do for Container [\#672](https://github.com/emberjs/ember-inspector/issues/672)
- Alphabetically sort data view [\#562](https://github.com/emberjs/ember-inspector/issues/562)
- Routes tab, hide substates checkbox [\#502](https://github.com/emberjs/ember-inspector/issues/502)
- Collapse deprecations by default [\#454](https://github.com/emberjs/ember-inspector/issues/454)
- Is it possible use ember-extension to dev chrome extension with emberjs [\#115](https://github.com/emberjs/ember-inspector/issues/115)
- Enforce stylelint [\#889](https://github.com/emberjs/ember-inspector/pull/889) ([rwwagner90](https://github.com/rwwagner90))
- Add a Refresh button to the Data Tab [\#886](https://github.com/emberjs/ember-inspector/pull/886) ([pbishop16](https://github.com/pbishop16))
- Send container to console \(\#311\) [\#882](https://github.com/emberjs/ember-inspector/pull/882) ([thorsteinsson](https://github.com/thorsteinsson))
- Flat Display of Object Properties [\#877](https://github.com/emberjs/ember-inspector/pull/877) ([nummi](https://github.com/nummi))
- Replace small Tomster icons with Ember's 'e' icon [\#876](https://github.com/emberjs/ember-inspector/pull/876) ([dipil-saud](https://github.com/dipil-saud))
- Use ember-table for the Ember Data inspector [\#873](https://github.com/emberjs/ember-inspector/pull/873) ([thorsteinsson](https://github.com/thorsteinsson))
- Expose storage type to use via LocalStorage service [\#869](https://github.com/emberjs/ember-inspector/pull/869) ([nlfurniss](https://github.com/nlfurniss))
- Components view scrolling [\#867](https://github.com/emberjs/ember-inspector/pull/867) ([thorsteinsson](https://github.com/thorsteinsson))
- Route Tree: Hide Substates Checkbox [\#860](https://github.com/emberjs/ember-inspector/pull/860) ([nummi](https://github.com/nummi))
- What’s New screen [\#858](https://github.com/emberjs/ember-inspector/pull/858) ([nummi](https://github.com/nummi))
- Remove jQuery, use flatpickr instead of pikaday [\#842](https://github.com/emberjs/ember-inspector/pull/842) ([rwwagner90](https://github.com/rwwagner90))

**Fixed bugs:**

- Uncaught TypeError: Cannot read property 'send' of undefined [\#864](https://github.com/emberjs/ember-inspector/issues/864)
- Route Display Errors [\#861](https://github.com/emberjs/ember-inspector/issues/861)
- current route is not displayed if `resetNamespace:true` [\#832](https://github.com/emberjs/ember-inspector/issues/832)
- Ember Inspector has errored with ember-feature-flags [\#814](https://github.com/emberjs/ember-inspector/issues/814)
- Only application present in View Tree [\#419](https://github.com/emberjs/ember-inspector/issues/419)
- Don't send count if the object is destroyed [\#884](https://github.com/emberjs/ember-inspector/pull/884) ([thorsteinsson](https://github.com/thorsteinsson))
- Use \[class='ember-view'\] selector to exclude anything with extra classes [\#874](https://github.com/emberjs/ember-inspector/pull/874) ([rwwagner90](https://github.com/rwwagner90))
- Fix issue with Proxy services [\#859](https://github.com/emberjs/ember-inspector/pull/859) ([vladucu](https://github.com/vladucu))
- Fix Ember Inspector during tests for Ember \>= 3 [\#855](https://github.com/emberjs/ember-inspector/pull/855) ([teddyzeenny](https://github.com/teddyzeenny))

**Closed issues:**

- Add comment blocks to classes/methods/properties [\#378](https://github.com/emberjs/ember-inspector/issues/378)
- Allow flat display of object attributes  [\#364](https://github.com/emberjs/ember-inspector/issues/364)
- Should expose container itself for easier debugging [\#311](https://github.com/emberjs/ember-inspector/issues/311)
- Use model's `primaryKey` value on data tab [\#57](https://github.com/emberjs/ember-inspector/issues/57)

**Merged pull requests:**

- Apply classes to get back record colors [\#888](https://github.com/emberjs/ember-inspector/pull/888) ([rwwagner90](https://github.com/rwwagner90))
- Skip promise debug test that fails [\#887](https://github.com/emberjs/ember-inspector/pull/887) ([rwwagner90](https://github.com/rwwagner90))
- Collapse deprecations by default [\#885](https://github.com/emberjs/ember-inspector/pull/885) ([thorsteinsson](https://github.com/thorsteinsson))
- Fix test failures by passing function references to `off` [\#883](https://github.com/emberjs/ember-inspector/pull/883) ([rwwagner90](https://github.com/rwwagner90))
- Add ability to sort models by record count [\#866](https://github.com/emberjs/ember-inspector/pull/866) ([nlfurniss](https://github.com/nlfurniss))
- Add test for hideEmptyModelTypes [\#865](https://github.com/emberjs/ember-inspector/pull/865) ([nlfurniss](https://github.com/nlfurniss))
- Fix routes reset namespace display [\#863](https://github.com/emberjs/ember-inspector/pull/863) ([pbishop16](https://github.com/pbishop16))
- Bind to object to fix debugInfo [\#853](https://github.com/emberjs/ember-inspector/pull/853) ([rwwagner90](https://github.com/rwwagner90))
- Update changelog for 3.3.0 [\#850](https://github.com/emberjs/ember-inspector/pull/850) ([rwwagner90](https://github.com/rwwagner90))
- Bump minor version to 3.4.0 [\#849](https://github.com/emberjs/ember-inspector/pull/849) ([teddyzeenny](https://github.com/teddyzeenny))

## [v3.3.2](https://github.com/emberjs/ember-inspector/tree/v3.3.2) (2018-08-13)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.3.1...v3.3.2)

**Implemented enhancements:**

- Remove jQuery [\#590](https://github.com/emberjs/ember-inspector/issues/590)
- Filter Models \[enhancement\] [\#455](https://github.com/emberjs/ember-inspector/issues/455)

**Fixed bugs:**

- Failing in Ember 3.1 [\#818](https://github.com/emberjs/ember-inspector/issues/818)
- Seeing failing tests on `/tests` route with Ember Inspector open [\#816](https://github.com/emberjs/ember-inspector/issues/816)
- \[FEATURE REQUEST\] Find component by ID in Tree View [\#490](https://github.com/emberjs/ember-inspector/issues/490)

## [v3.3.1](https://github.com/emberjs/ember-inspector/tree/v3.3.1) (2018-08-03)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.3.0...v3.3.1)

**Closed issues:**

-  Cannot read property 'eachAttribute' of undefined [\#851](https://github.com/emberjs/ember-inspector/issues/851)

## [v3.3.0](https://github.com/emberjs/ember-inspector/tree/v3.3.0) (2018-08-02)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.2.0...v3.3.0)

**Implemented enhancements:**

- explore removing sync XHR [\#820](https://github.com/emberjs/ember-inspector/issues/820)
- Implement "Inspect component" contextual menu [\#689](https://github.com/emberjs/ember-inspector/issues/689)
- Context menu item for inspecting components [\#843](https://github.com/emberjs/ember-inspector/pull/843) ([Bestra](https://github.com/Bestra))
- Fix vertical-collection background colors [\#841](https://github.com/emberjs/ember-inspector/pull/841) ([rwwagner90](https://github.com/rwwagner90))

**Fixed bugs:**

- Ember.copy deprecation warnings [\#834](https://github.com/emberjs/ember-inspector/issues/834)
- Inspector is not detecting Ember deprecations [\#833](https://github.com/emberjs/ember-inspector/issues/833)
- Inspector triggers targetObject deprecation [\#829](https://github.com/emberjs/ember-inspector/issues/829)
- Unable to traverse some ember data relationships in the Inspector [\#791](https://github.com/emberjs/ember-inspector/issues/791)

**Closed issues:**

- Can't select the Ember inspector tab in Firefox [\#819](https://github.com/emberjs/ember-inspector/issues/819)
- Deprecation Overload And UI Thread Locking [\#422](https://github.com/emberjs/ember-inspector/issues/422)

**Merged pull requests:**

- Use Ember.get to get \_debugInfo [\#847](https://github.com/emberjs/ember-inspector/pull/847) ([rwwagner90](https://github.com/rwwagner90))
- Handle deprecations with registerDeprecationHandler [\#845](https://github.com/emberjs/ember-inspector/pull/845) ([rwwagner90](https://github.com/rwwagner90))
- Add targetObject to skipProperties [\#844](https://github.com/emberjs/ember-inspector/pull/844) ([rwwagner90](https://github.com/rwwagner90))
- Bump some deps [\#840](https://github.com/emberjs/ember-inspector/pull/840) ([rwwagner90](https://github.com/rwwagner90))
- Convert to async xhr [\#839](https://github.com/emberjs/ember-inspector/pull/839) ([rwwagner90](https://github.com/rwwagner90))
- Bump ember-svg-jar to silence deprecations, fix tests [\#838](https://github.com/emberjs/ember-inspector/pull/838) ([rwwagner90](https://github.com/rwwagner90))
- Bump Ember, fix inspect issues [\#837](https://github.com/emberjs/ember-inspector/pull/837) ([rwwagner90](https://github.com/rwwagner90))
- replace all uses of Ember.copy, Ember.merge w/ Object.assign [\#835](https://github.com/emberjs/ember-inspector/pull/835) ([bgentry](https://github.com/bgentry))
- Avoid publishing secrets file to npm [\#830](https://github.com/emberjs/ember-inspector/pull/830) ([teddyzeenny](https://github.com/teddyzeenny))
- Bump minor version to 3.3.0 [\#824](https://github.com/emberjs/ember-inspector/pull/824) ([teddyzeenny](https://github.com/teddyzeenny))
- Send to Console Buttons to SVG [\#822](https://github.com/emberjs/ember-inspector/pull/822) ([nummi](https://github.com/nummi))

## [v3.2.0](https://github.com/emberjs/ember-inspector/tree/v3.2.0) (2018-07-03)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.1.3...v3.2.0)

**Fixed bugs:**

- Data - column Model Types is not resizable [\#813](https://github.com/emberjs/ember-inspector/issues/813)
- Data tab - change visible columns not working [\#803](https://github.com/emberjs/ember-inspector/issues/803)
- \[Error\] - `rootElement.getAttribute is not a function` when using 3.1.0-beta [\#775](https://github.com/emberjs/ember-inspector/issues/775)
- Fix toggling and resizing table columns [\#815](https://github.com/emberjs/ember-inspector/pull/815) ([teddyzeenny](https://github.com/teddyzeenny))
- Fix rootElement.getAttribute error [\#812](https://github.com/emberjs/ember-inspector/pull/812) ([rwwagner90](https://github.com/rwwagner90))

**Closed issues:**

- CPU spiking [\#817](https://github.com/emberjs/ember-inspector/issues/817)

**Merged pull requests:**

- \[BUGFIX\] remove usage of `Ember.EXTEND\_PROTOTYPES` [\#810](https://github.com/emberjs/ember-inspector/pull/810) ([bekzod](https://github.com/bekzod))
- Remove application key from manifest [\#809](https://github.com/emberjs/ember-inspector/pull/809) ([teddyzeenny](https://github.com/teddyzeenny))
- Bump minor version to 3.2.0 [\#807](https://github.com/emberjs/ember-inspector/pull/807) ([teddyzeenny](https://github.com/teddyzeenny))
- Color Variables Cleanup [\#806](https://github.com/emberjs/ember-inspector/pull/806) ([nummi](https://github.com/nummi))
- Fix Inspector tab display in Firefox Developer Edition [\#804](https://github.com/emberjs/ember-inspector/pull/804) ([pbishop16](https://github.com/pbishop16))
- Object Inspector Large Key Name Fix [\#801](https://github.com/emberjs/ember-inspector/pull/801) ([nummi](https://github.com/nummi))
- Search Routes [\#799](https://github.com/emberjs/ember-inspector/pull/799) ([nummi](https://github.com/nummi))
- Update changelog and add instructions [\#796](https://github.com/emberjs/ember-inspector/pull/796) ([rwwagner90](https://github.com/rwwagner90))
- Refactor duplication [\#792](https://github.com/emberjs/ember-inspector/pull/792) ([rwwagner90](https://github.com/rwwagner90))

## [v3.1.3](https://github.com/emberjs/ember-inspector/tree/v3.1.3) (2018-05-26)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.1.2...v3.1.3)

## [v3.1.2](https://github.com/emberjs/ember-inspector/tree/v3.1.2) (2018-05-25)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.1.1...v3.1.2)

## [v3.1.1](https://github.com/emberjs/ember-inspector/tree/v3.1.1) (2018-05-25)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.1.0...v3.1.1)

**Fixed bugs:**

- Tab does not display in Firefox Developer Edition [\#802](https://github.com/emberjs/ember-inspector/issues/802)

**Closed issues:**

- Property icon floating issue [\#800](https://github.com/emberjs/ember-inspector/issues/800)
- Feature request: route search  [\#129](https://github.com/emberjs/ember-inspector/issues/129)

## [v3.1.0](https://github.com/emberjs/ember-inspector/tree/v3.1.0) (2018-05-01)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.0.0...v3.1.0)

**Implemented enhancements:**

- Implement dark theme [\#771](https://github.com/emberjs/ember-inspector/issues/771)
- Remove bower deps [\#786](https://github.com/emberjs/ember-inspector/pull/786) ([rwwagner90](https://github.com/rwwagner90))
- UI Tweaks April 2018 [\#780](https://github.com/emberjs/ember-inspector/pull/780) ([nummi](https://github.com/nummi))

**Fixed bugs:**

- ember inspector error in Chrome Version 65.0.3325.181 [\#783](https://github.com/emberjs/ember-inspector/issues/783)
- "Cannot read property 'outlets' of undefined" On Ember 3.1-beta.1 [\#770](https://github.com/emberjs/ember-inspector/issues/770)
- Data tab not working [\#739](https://github.com/emberjs/ember-inspector/issues/739)

**Closed issues:**

- Show computed property dependent keys [\#779](https://github.com/emberjs/ember-inspector/issues/779)
- UI Tweaks April 2018 [\#778](https://github.com/emberjs/ember-inspector/issues/778)
- \[Quest\] - Implement Component Tree [\#774](https://github.com/emberjs/ember-inspector/issues/774)
- Cannot read property 'getAttribute' of undefined [\#727](https://github.com/emberjs/ember-inspector/issues/727)
- Stack trace: TypeError: definedControllerClass.proto is not a function [\#629](https://github.com/emberjs/ember-inspector/issues/629)
- Error: You must use Ember.set\(\) to set the `scheduledRevalidation` property [\#559](https://github.com/emberjs/ember-inspector/issues/559)
- Erro when i click ViewTree and any Controller. [\#523](https://github.com/emberjs/ember-inspector/issues/523)
- \[IDEA\] Component Hierarchy Tab [\#465](https://github.com/emberjs/ember-inspector/issues/465)
- Can't fetch Ember deprecations [\#429](https://github.com/emberjs/ember-inspector/issues/429)

**Merged pull requests:**

- Adjust toolbar radio colors [\#794](https://github.com/emberjs/ember-inspector/pull/794) ([nummi](https://github.com/nummi))
- Remove references to bower in README [\#793](https://github.com/emberjs/ember-inspector/pull/793) ([josemarluedke](https://github.com/josemarluedke))
- Use `qunit-dom` for DOM assertions [\#790](https://github.com/emberjs/ember-inspector/pull/790) ([Turbo87](https://github.com/Turbo87))
- Sticky Mixin Headers [\#789](https://github.com/emberjs/ember-inspector/pull/789) ([nummi](https://github.com/nummi))
- \[WIP\] Trying to fix beta and canary [\#787](https://github.com/emberjs/ember-inspector/pull/787) ([rwwagner90](https://github.com/rwwagner90))
- Initial component tree implementation [\#785](https://github.com/emberjs/ember-inspector/pull/785) ([Bestra](https://github.com/Bestra))
- search-field  Component Bug Fix and Acceptance Tests [\#784](https://github.com/emberjs/ember-inspector/pull/784) ([nummi](https://github.com/nummi))
- Implement dark theme [\#782](https://github.com/emberjs/ember-inspector/pull/782) ([pbishop16](https://github.com/pbishop16))
- Feature: ComputedProperty Dependent keys in debugger & services highlighting [\#781](https://github.com/emberjs/ember-inspector/pull/781) ([lifeart](https://github.com/lifeart))
- Link directly to issues url [\#776](https://github.com/emberjs/ember-inspector/pull/776) ([sivakumar-kailasam](https://github.com/sivakumar-kailasam))
- Start auto generating changelogs [\#773](https://github.com/emberjs/ember-inspector/pull/773) ([rwwagner90](https://github.com/rwwagner90))
- Bump minor version to 3.1.0 [\#769](https://github.com/emberjs/ember-inspector/pull/769) ([teddyzeenny](https://github.com/teddyzeenny))
- Remove jQuery from app [\#768](https://github.com/emberjs/ember-inspector/pull/768) ([rwwagner90](https://github.com/rwwagner90))

## [v3.0.0](https://github.com/emberjs/ember-inspector/tree/v3.0.0) (2018-03-08)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v2.3.1...v3.0.0)

**Implemented enhancements:**

- Test against all supported Ember versions with ember-try [\#763](https://github.com/emberjs/ember-inspector/issues/763)

**Fixed bugs:**

- Empty mixins break component selector [\#752](https://github.com/emberjs/ember-inspector/issues/752)
- Make View Tree support Glimmer components [\#750](https://github.com/emberjs/ember-inspector/issues/750)
- Not visible in Chromium 62 or Vivaldi 1.12 [\#734](https://github.com/emberjs/ember-inspector/issues/734)

**Closed issues:**

- Remove ember\_debug/addons/ember-new-computed [\#758](https://github.com/emberjs/ember-inspector/issues/758)
- Consider dropping Ember 1.x support / `ember-new-computed` [\#745](https://github.com/emberjs/ember-inspector/issues/745)
- \[feature discussion\] ability to configure value for "Hide Empty Model Types" [\#741](https://github.com/emberjs/ember-inspector/issues/741)
- Can not build current master [\#736](https://github.com/emberjs/ember-inspector/issues/736)
- Support Firefox 57.0 \("Quantum"\) [\#735](https://github.com/emberjs/ember-inspector/issues/735)
- Illegal invocation when using View tree. [\#718](https://github.com/emberjs/ember-inspector/issues/718)
- Compatibility with new modules API \(Ember 2.16\) [\#707](https://github.com/emberjs/ember-inspector/issues/707)

**Merged pull requests:**

- Fix text field assertion [\#767](https://github.com/emberjs/ember-inspector/pull/767) ([rwwagner90](https://github.com/rwwagner90))
- Add branches to build in Travis CI [\#766](https://github.com/emberjs/ember-inspector/pull/766) ([teddyzeenny](https://github.com/teddyzeenny))
- Fix inspector reset on client app's reset and destroy [\#765](https://github.com/emberjs/ember-inspector/pull/765) ([teddyzeenny](https://github.com/teddyzeenny))
- Bump version to 3.0.0 [\#764](https://github.com/emberjs/ember-inspector/pull/764) ([teddyzeenny](https://github.com/teddyzeenny))
- Ember 3.0, dep updates, testing updates, and codemods [\#762](https://github.com/emberjs/ember-inspector/pull/762) ([rwwagner90](https://github.com/rwwagner90))
- Remove computedPolyfill [\#761](https://github.com/emberjs/ember-inspector/pull/761) ([rwwagner90](https://github.com/rwwagner90))
- Remove getTemplate stuff [\#760](https://github.com/emberjs/ember-inspector/pull/760) ([rwwagner90](https://github.com/rwwagner90))
- Fix file paths displayed in the Routes tab [\#757](https://github.com/emberjs/ember-inspector/pull/757) ([omarhamdan](https://github.com/omarhamdan))
- Add Documentation + Minor Cleanup [\#755](https://github.com/emberjs/ember-inspector/pull/755) ([omarhamdan](https://github.com/omarhamdan))
- Allow for empty mixins [\#753](https://github.com/emberjs/ember-inspector/pull/753) ([XuluWarrior](https://github.com/XuluWarrior))
- ember-qunit-codemod [\#751](https://github.com/emberjs/ember-inspector/pull/751) ([rwwagner90](https://github.com/rwwagner90))
- Start converting to module imports [\#749](https://github.com/emberjs/ember-inspector/pull/749) ([rwwagner90](https://github.com/rwwagner90))
- Fix loading main outlet [\#748](https://github.com/emberjs/ember-inspector/pull/748) ([rwwagner90](https://github.com/rwwagner90))
- Drop ember-new-computed [\#746](https://github.com/emberjs/ember-inspector/pull/746) ([jacobq](https://github.com/jacobq))
- UI Tweaks to Match Latest Inspectors [\#744](https://github.com/emberjs/ember-inspector/pull/744) ([nummi](https://github.com/nummi))
- Update Inspect Views Icon [\#743](https://github.com/emberjs/ember-inspector/pull/743) ([nummi](https://github.com/nummi))
- preserve model type hiding [\#742](https://github.com/emberjs/ember-inspector/pull/742) ([efx](https://github.com/efx))
- Bump patch version to 2.3.1 [\#738](https://github.com/emberjs/ember-inspector/pull/738) ([teddyzeenny](https://github.com/teddyzeenny))
- Remove unsafe-eval from the csp [\#737](https://github.com/emberjs/ember-inspector/pull/737) ([teddyzeenny](https://github.com/teddyzeenny))
- prevent undefined options error [\#732](https://github.com/emberjs/ember-inspector/pull/732) ([lifeart](https://github.com/lifeart))
- Avoid error in some environments [\#638](https://github.com/emberjs/ember-inspector/pull/638) ([pablobm](https://github.com/pablobm))

# Ember Inspector Changelog

## Ember Inspector 2.3.0

* [FEATURE] View tree filter support [#720](https://github.com/emberjs/ember-inspector/pull/720)
* [IMPROVEMENT] Sort object inspector properties [#622](https://github.com/emberjs/ember-inspector/pull/622)
* [BUGFIX] Fix the Ember Application's query selector [#730](https://github.com/emberjs/ember-inspector/pull/730)
* [BUGFIX] Fix late Iframe detection in Chrome [#729](https://github.com/emberjs/ember-inspector/pull/729)
* [INTERNAL] Update README and `package.json` to match recent updates [#724](https://github.com/emberjs/ember-inspector/pull/724)
* [INTERNAL] Fix compressed `dist` directory [#722](https://github.com/emberjs/ember-inspector/pull/722)

## Ember Inspector 2.2.0

* [IMPROVEMENT] Rewrite the FF addon as a FF WebExtension [#715](https://github.com/emberjs/ember-inspector/pull/715)
* [BUGFIX] Fix `event` variable name [#714](https://github.com/emberjs/ember-inspector/pull/714)

## Ember Inspector 2.1.1

* [BUGFIX] Only call Mixin#toString on Ember > 2.11 [#708](https://github.com/emberjs/ember-inspector/pull/708)
* [BUGFIX] Fix unloading a record in the data tab [#709](https://github.com/emberjs/ember-inspector/pull/709)

## Ember Inspector 2.0.4

* [BUGFIX] Account for components that are appended manually [#610](https://github.com/emberjs/ember-inspector/pull/610)
* [BUGFIX] Only list sub-routes if they are defined [#612](https://github.com/emberjs/ember-inspector/pull/612)

## Ember Inspector 2.0.3

* [BUGFIX] Fall back to memory caching if local storage is inaccessible [#592](https://github.com/emberjs/ember-inspector/pull/592)
* [BUGFIX] Update outlet and template Glimmer code to match 2.9.beta-3  [#607](https://github.com/emberjs/ember-inspector/pull/607)

## Ember Inspector 2.0.2

* [BUGFIX] Rebuild columns when schema changes [#589](https://github.com/emberjs/ember-inspector/pull/589)
* [BUGFIX] Update to new way to get the root element in Glimmer [#588](https://github.com/emberjs/ember-inspector/pull/588)

## Ember Inspector 2.0.1

* [BUGFIX] Disable source map for ember_debug.js [#583](https://github.com/emberjs/ember-inspector/pull/583)

## Ember Inspector 2.0.0

* [FEATURE] Added the ability to resize and toggle columns [#574](https://github.com/emberjs/ember-inspector/pull/574)
* [IMPROVEMENT] Added Glimmer 2 support [#579](https://github.com/emberjs/ember-inspector/pull/579)
* [IMPROVEMENT] Current route only checkbox persists between refreshes now [#568](https://github.com/emberjs/ember-inspector/pull/568)
* [DOC] Fix typo in install instructions [#576](https://github.com/emberjs/ember-inspector/pull/576)
* [DOC] Remove `grunt version` command from README [#540](https://github.com/emberjs/ember-inspector/pull/540)
* [BUGFIX] The bookmarklet's `load_inspector.js` should not include ES6 [#546](https://github.com/emberjs/ember-inspector/pull/546)
* [BUGFIX] Fix deprecated `window.postMessage` usage [#555](https://github.com/emberjs/ember-inspector/pull/555)
* [INTERNAL] Upgrade Ember 1.12 -> Ember and Ember CLI 2.6 [#563](https://github.com/emberjs/ember-inspector/pull/563)
* [INTERNAL] Use smoke-and-mirrors for lazy rendering [#563](https://github.com/emberjs/ember-inspector/pull/563)
* [INTERNAL] Replace obsolete Broccoli plugins with "broccoli-funnel" [#571](https://github.com/emberjs/ember-inspector/pull/571)
* [INTERNAL] Update ESLint and enable more rules [#572](https://github.com/emberjs/ember-inspector/pull/572)
* [INTERNAL] Update build dependencies [#573](https://github.com/emberjs/ember-inspector/pull/573) [#578](https://github.com/emberjs/ember-inspector/pull/578)
* [INTERNAL] Remove `list-view` in order to upgrade Ember [#543](https://github.com/emberjs/ember-inspector/pull/543)
* [INTERNAL] Remove `dist-config.js` from index files [#542](https://github.com/emberjs/ember-inspector/pull/542)
* [INTERNAL] Lock down jQuery version [#512](https://github.com/emberjs/ember-inspector/pull/512)
* [INTERNAL] Upgrade babel-eslint [#515](https://github.com/emberjs/ember-inspector/pull/515)
* [INTERNAL] remove duplicate key from eslintrc [#517](https://github.com/emberjs/ember-inspector/pull/517)
* [INTERNAL] Port Gruntfile tasks to `grunt-jpm` to build a valid xpi for Firefox [#519](https://github.com/emberjs/ember-inspector/pull/519)

## Ember Inspector 1.10.0

* [IMPROVEMENT] Add [DEV] to the tab name for the inspector development version [#527](https://github.com/emberjs/ember-inspector/pull/527)
* [BUGFIX] Fix PDF documents not opening on latest Chrome [#533](https://github.com/emberjs/ember-inspector/pull/533)
* [INTERNAL] Publish multiple versions of the inspector to support all Ember versions [#535](https://github.com/emberjs/ember-inspector/pull/535)
* [INTERNAL] Lock Ember version at 0.0.0 -> 2.6.0 and start supporting a new version at 2.7.0

## Ember Inspector 1.9.5

* [BUGFIX] filter out null/undefined nodes [#510](https://github.com/emberjs/ember-inspector/pull/510)
* [BUGFIX] Fix websocket adapter ES6 conversion [#505](https://github.com/emberjs/ember-inspector/pull/505)

## Ember Inspector 1.9.4

* [BUGFIX] Launch inspector if document ready state is `interactive` [#500](https://github.com/emberjs/ember-inspector/pull/500)
* [BUGFIX] [Ember 2.2] Use the new `resolveRegistration` to remove the deprecation warning [#499](https://github.com/emberjs/ember-inspector/pull/499) [#497](https://github.com/emberjs/ember-inspector/pull/497)
* [BUGFIX] [Ember 2.2] Fix the view tree: use `scope.getSelf` when available to get the controller [#496](https://github.com/emberjs/ember-inspector/pull/496)
* [INTERNAL] Tweak Firefox skeleton again for 44 and later [#491](https://github.com/emberjs/ember-inspector/pull/491)

## Ember Inspector 1.9.3

* [BUGFIX] Make sure we only reopen the app once [#482](https://github.com/emberjs/ember-inspector/pull/482)
* [BUGFIX] Save `_super` before reopening [#481](https://github.com/emberjs/ember-inspector/pull/481)
* [BUGFIX] Prevent errors when document.documentElement.dataset is not present [#475](https://github.com/emberjs/ember-inspector/pull/475)
* [BUGFIX] [Ember 2.1] Prevent deprecation for initializer arguments [#476](https://github.com/emberjs/ember-inspector/pull/476)
* [BUGFIX] [Ember 2.1] Update getState and getLocals for compatibility with canary [#467](https://github.com/emberjs/ember-inspector/pull/467)

## Ember Inspector 1.9.2

* [BUGFIX] Don't assume Ember.View exists (for Ember 2.0+) [#469](https://github.com/emberjs/ember-inspector/pull/469)
* [IMPROVEMENT] Update Firefox skeleton for path change in Firefox 44+ [#470](https://github.com/emberjs/ember-inspector/pull/470)

## Ember Inspector 1.9.1

* [BUGFIX] Fix value of this after ES6 refactor [#450](https://github.com/emberjs/ember-inspector/pull/450)

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
