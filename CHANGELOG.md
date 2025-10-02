# Changelog

## Release (2025-10-02)

* ember-inspector 4.14.0 (minor)

#### :rocket: Enhancement
* `ember-inspector`
  * [#2625](https://github.com/emberjs/ember-inspector/pull/2625) Add support for Vite ([@mansona](https://github.com/mansona))
  * [#2676](https://github.com/emberjs/ember-inspector/pull/2676) Replace Inter font with `system-ui` keyword ([@pichfl](https://github.com/pichfl))
  * [#2680](https://github.com/emberjs/ember-inspector/pull/2680) Add owner to the list of properties of an object ([@pichfl](https://github.com/pichfl))
  * [#2667](https://github.com/emberjs/ember-inspector/pull/2667) show parents in sidebar ([@patricklx](https://github.com/patricklx))
  * [#2672](https://github.com/emberjs/ember-inspector/pull/2672) Convert ember-debug to ESM and simplify wrapper ([@mansona](https://github.com/mansona))
  * [#2655](https://github.com/emberjs/ember-inspector/pull/2655) implement show parents only (focus mode) ([@patricklx](https://github.com/patricklx))
  * [#2658](https://github.com/emberjs/ember-inspector/pull/2658) perf: do not re-render positionals ([@patricklx](https://github.com/patricklx))
  * [#2659](https://github.com/emberjs/ember-inspector/pull/2659) support shadow dom for click to select & inspect component ([@patricklx](https://github.com/patricklx))

#### :bug: Bug Fix
* `ember-inspector`
  * [#2678](https://github.com/emberjs/ember-inspector/pull/2678) Move Object Inspector toggle so it remains visible in edge cases ([@pichfl](https://github.com/pichfl))
  * [#2677](https://github.com/emberjs/ember-inspector/pull/2677) Enable CORS for locally served bookmarklet ([@pichfl](https://github.com/pichfl))
  * [#2664](https://github.com/emberjs/ember-inspector/pull/2664) fix service detection ([@patricklx](https://github.com/patricklx))
  * [#2657](https://github.com/emberjs/ember-inspector/pull/2657) fix html element tree when not a direct child ([@patricklx](https://github.com/patricklx))
  * [#2639](https://github.com/emberjs/ember-inspector/pull/2639) fix `whats new` not showing latest changes ([@patricklx](https://github.com/patricklx))
  * [#2640](https://github.com/emberjs/ember-inspector/pull/2640) fix for chrome bfcache ([@patricklx](https://github.com/patricklx))
  * [#2646](https://github.com/emberjs/ember-inspector/pull/2646) Fix ember 6 ([@mansona](https://github.com/mansona))
  * [#2627](https://github.com/emberjs/ember-inspector/pull/2627) fix: Cannot convert a Symbol value to a string ([@lifeart](https://github.com/lifeart))

#### :memo: Documentation
* `ember-inspector`
  * [#2626](https://github.com/emberjs/ember-inspector/pull/2626) docs: add precisions about running for development with bookmarklet ([@BlueCutOfficial](https://github.com/BlueCutOfficial))

#### :house: Internal
* `ember-inspector`
  * [#2685](https://github.com/emberjs/ember-inspector/pull/2685) Fix release ([@mansona](https://github.com/mansona))
  * [#2684](https://github.com/emberjs/ember-inspector/pull/2684) add client secret to the build and upload script ([@mansona](https://github.com/mansona))
  * [#2683](https://github.com/emberjs/ember-inspector/pull/2683) Create PRIVACY.md ([@mansona](https://github.com/mansona))
  * [#2675](https://github.com/emberjs/ember-inspector/pull/2675) Fix theme colors no rendering in tests and bookmarklet ([@pichfl](https://github.com/pichfl))
  * [#2674](https://github.com/emberjs/ember-inspector/pull/2674) Remove the "ui" in-repo-addon ([@pichfl](https://github.com/pichfl))
  * [#2671](https://github.com/emberjs/ember-inspector/pull/2671) use relative imports inside ember-debug ([@mansona](https://github.com/mansona))
  * [#2670](https://github.com/emberjs/ember-inspector/pull/2670) remove overkill use of env to simplify new build process ([@mansona](https://github.com/mansona))
  * [#2669](https://github.com/emberjs/ember-inspector/pull/2669) Achieve centralizing imports from Ember ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2668](https://github.com/emberjs/ember-inspector/pull/2668) Cleanup import ember ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2662](https://github.com/emberjs/ember-inspector/pull/2662) fix watch test script ([@patricklx](https://github.com/patricklx))
  * [#2656](https://github.com/emberjs/ember-inspector/pull/2656) fix local dev ([@patricklx](https://github.com/patricklx))
  * [#2660](https://github.com/emberjs/ember-inspector/pull/2660) Centralize interactions with ember-source: wormhole ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2653](https://github.com/emberjs/ember-inspector/pull/2653) Refactor: Centralize calls to `emberSafeRequire` ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2654](https://github.com/emberjs/ember-inspector/pull/2654) Remove loader ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2645](https://github.com/emberjs/ember-inspector/pull/2645) move build of ember-debug to rollup ([@mansona](https://github.com/mansona))
  * [#2628](https://github.com/emberjs/ember-inspector/pull/2628) require all ember modules in one place ([@mansona](https://github.com/mansona))
  * [#2648](https://github.com/emberjs/ember-inspector/pull/2648) fix ember 3.x-lts ([@patricklx](https://github.com/patricklx))
  * [#2652](https://github.com/emberjs/ember-inspector/pull/2652) prepare profile manager tests for ember 6 ([@patricklx](https://github.com/patricklx))
  * [#2650](https://github.com/emberjs/ember-inspector/pull/2650) Prepare ember 6+ support/ view-debug ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2649](https://github.com/emberjs/ember-inspector/pull/2649) update release-plan ([@mansona](https://github.com/mansona))
  * [#2647](https://github.com/emberjs/ember-inspector/pull/2647) Remove unused file `trigger-port.js` ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
  * [#2644](https://github.com/emberjs/ember-inspector/pull/2644) add packageManager for people not using volta ([@mansona](https://github.com/mansona))
  * [#2643](https://github.com/emberjs/ember-inspector/pull/2643) test ember 5.8 and 5.12 ([@mansona](https://github.com/mansona))
  * [#2624](https://github.com/emberjs/ember-inspector/pull/2624) ember-cli-update to latest blueprints ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2623](https://github.com/emberjs/ember-inspector/pull/2623) Remove gets and access props directly ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2620](https://github.com/emberjs/ember-inspector/pull/2620) Remove pushObjects from RenderTree ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2621](https://github.com/emberjs/ember-inspector/pull/2621) Remove unused evented from ListContent ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2619](https://github.com/emberjs/ember-inspector/pull/2619) Remove Evented from ListContent ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2618](https://github.com/emberjs/ember-inspector/pull/2618) Remove Evented from PromiseAssembler ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2617](https://github.com/emberjs/ember-inspector/pull/2617) Convert adapters and port to TS, remove Evented from port ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2601](https://github.com/emberjs/ember-inspector/pull/2601) More progress removing prototype extensions ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2602](https://github.com/emberjs/ember-inspector/pull/2602) cleanup filterBy & mapBy prototype extensions ([@patricklx](https://github.com/patricklx))
  * [#2600](https://github.com/emberjs/ember-inspector/pull/2600) Remove mapBy and filterBy ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
  * [#2598](https://github.com/emberjs/ember-inspector/pull/2598) Update to Ember 5.12 ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

#### Committers: 6
- Alex Kanunnikov ([@lifeart](https://github.com/lifeart))
- Chris Manson ([@mansona](https://github.com/mansona))
- Florian Pichler ([@pichfl](https://github.com/pichfl))
- Marine Dunstetter ([@BlueCutOfficial](https://github.com/BlueCutOfficial))
- Patrick Pircher ([@patricklx](https://github.com/patricklx))
- Robbie Wagner ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

## Release (2024-07-30)

ember-inspector 4.13.1 (patch)

#### :bug: Bug Fix
* `ember-inspector`
  * [#2595](https://github.com/emberjs/ember-inspector/pull/2595) fix boolean edit ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## Release (2024-07-26)

ember-inspector 4.13.0 (minor)

#### :rocket: Enhancement
* `ember-inspector`
  * [#2581](https://github.com/emberjs/ember-inspector/pull/2581) provide name for hbs template only components ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* `ember-inspector`
  * [#2585](https://github.com/emberjs/ember-inspector/pull/2585) Use GH_PAT token to hopefully fix releases ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## Release (2024-07-25)

ember-inspector 4.12.2 (patch)

#### :bug: Bug Fix
* `ember-inspector`
  * [#2587](https://github.com/emberjs/ember-inspector/pull/2587) do not use prototype extension ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* `ember-inspector`
  * [#2591](https://github.com/emberjs/ember-inspector/pull/2591) Use Personal Access Token ([@kategengler](https://github.com/kategengler))

#### Committers: 2
- Katie Gengler ([@kategengler](https://github.com/kategengler))
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## Release (2024-07-10)

ember-inspector 4.12.1 (patch)

#### :house: Internal
* `ember-inspector`
  * [#2582](https://github.com/emberjs/ember-inspector/pull/2582) skip failing test ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## Release (2024-05-06)

ember-inspector 4.12.0 (minor)

#### :rocket: Enhancement
* `ember-inspector`
  * [#2553](https://github.com/emberjs/ember-inspector/pull/2553) Mark dependent keys that updated ([@patricklx](https://github.com/patricklx))
  * [#2548](https://github.com/emberjs/ember-inspector/pull/2548) add modifiers to render tree ([@patricklx](https://github.com/patricklx))
  * [#2443](https://github.com/emberjs/ember-inspector/pull/2443) Add ability to jump to source for functions and classes ([@patricklx](https://github.com/patricklx))
  * [#2536](https://github.com/emberjs/ember-inspector/pull/2536) improve route debug ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* `ember-inspector`
  * [#2571](https://github.com/emberjs/ember-inspector/pull/2571) fix beta & canary tests ([@patricklx](https://github.com/patricklx))
  * [#2567](https://github.com/emberjs/ember-inspector/pull/2567) add internal to dependabot prs ([@patricklx](https://github.com/patricklx))
  * [#2563](https://github.com/emberjs/ember-inspector/pull/2563) add release plan ([@patricklx](https://github.com/patricklx))
  * [#2565](https://github.com/emberjs/ember-inspector/pull/2565) build(deps-dev): bump express from 4.18.2 to 4.19.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#2564](https://github.com/emberjs/ember-inspector/pull/2564) build(deps-dev): bump follow-redirects from 1.15.4 to 1.15.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#2560](https://github.com/emberjs/ember-inspector/pull/2560) build(deps-dev): bump ip from 1.1.8 to 1.1.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#2498](https://github.com/emberjs/ember-inspector/pull/2498) Remove outdated code and unnecessary captureRenderTree patching ([@patricklx](https://github.com/patricklx))
  * [#2511](https://github.com/emberjs/ember-inspector/pull/2511) chore(deps): remove unused AWS SDK for JavaScript ([@trivikr](https://github.com/trivikr))
  * [#2556](https://github.com/emberjs/ember-inspector/pull/2556) build(deps-dev): bump @types/ember__routing from 4.0.12 to 4.0.21 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 2
- Patrick Pircher ([@patricklx](https://github.com/patricklx))
- Trivikram Kamat ([@trivikr](https://github.com/trivikr))










## v4.11.0 (2024-02-07)

#### :rocket: Enhancement
* [#2546](https://github.com/emberjs/ember-inspector/pull/2546) add 🔸 to tracked dependencies that caused the last invalidation ([@patricklx](https://github.com/patricklx))
* [#2549](https://github.com/emberjs/ember-inspector/pull/2549) improve in element support ([@patricklx](https://github.com/patricklx))

#### :bug: Bug Fix
* [#2547](https://github.com/emberjs/ember-inspector/pull/2547) fix render tree triggering when already destroyed ([@patricklx](https://github.com/patricklx))
* [#2533](https://github.com/emberjs/ember-inspector/pull/2533) ensure port is connected ([@patricklx](https://github.com/patricklx))
* [#2531](https://github.com/emberjs/ember-inspector/pull/2531) fix cannot access array values ([@patricklx](https://github.com/patricklx))
* [#2527](https://github.com/emberjs/ember-inspector/pull/2527) exclude remotes from serialization ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* [#2534](https://github.com/emberjs/ember-inspector/pull/2534) fix ci artifact upload & download ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## v4.10.4 (2023-11-27)

#### :bug: Bug Fix
* [#2505](https://github.com/emberjs/ember-inspector/pull/2505) fix lazy routes debug ([@patricklx](https://github.com/patricklx))
* [#2517](https://github.com/emberjs/ember-inspector/pull/2517) [firefox] set access permissions for all websites  ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## v4.10.3 (2023-11-14)

#### :house: Internal
* [#2510](https://github.com/emberjs/ember-inspector/pull/2510) Remove custom id setting since it is in manifest ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

#### Committers: 1
- Robbie Wagner ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

## v4.10.2 (2023-11-14)

#### :house: Internal
* [#2509](https://github.com/emberjs/ember-inspector/pull/2509) fix publish - remove volta ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## v4.10.1 (2023-11-12)

#### :bug: Bug Fix
* [#2501](https://github.com/emberjs/ember-inspector/pull/2501) correctly load scripts in chrome & firefox ([@patricklx](https://github.com/patricklx))
* [#2503](https://github.com/emberjs/ember-inspector/pull/2503) fix inspecting ember data records ([@patricklx](https://github.com/patricklx))
* [#2499](https://github.com/emberjs/ember-inspector/pull/2499) fix inspector not showing up in certain cases ([@patricklx](https://github.com/patricklx))
* [#2497](https://github.com/emberjs/ember-inspector/pull/2497) make amd safe ([@patricklx](https://github.com/patricklx))
* [#2495](https://github.com/emberjs/ember-inspector/pull/2495) switch to source-map-js ([@patricklx](https://github.com/patricklx))
* [#2489](https://github.com/emberjs/ember-inspector/pull/2489) Add id for manifest v3 support in Firefox ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
* [#2490](https://github.com/emberjs/ember-inspector/pull/2490) fix some ember names detection ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* [#2494](https://github.com/emberjs/ember-inspector/pull/2494) Update node and pnpm versions ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

#### Committers: 2
- Patrick Pircher ([@patricklx](https://github.com/patricklx))
- Robbie Wagner ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

## v4.10.0 (2023-11-03)

#### :rocket: Enhancement
* [#2460](https://github.com/emberjs/ember-inspector/pull/2460) use word-wrap and add line break controls ([@patricklx](https://github.com/patricklx))
* [#2459](https://github.com/emberjs/ember-inspector/pull/2459) remove title ([@patricklx](https://github.com/patricklx))
* [#2426](https://github.com/emberjs/ember-inspector/pull/2426) limit max width of tooltips ([@patricklx](https://github.com/patricklx))
* [#2402](https://github.com/emberjs/ember-inspector/pull/2402) support in-element & wormhole ([@patricklx](https://github.com/patricklx))
* [#2444](https://github.com/emberjs/ember-inspector/pull/2444) show icons in whats-new page ([@patricklx](https://github.com/patricklx))
* [#2241](https://github.com/emberjs/ember-inspector/pull/2241) allow setting custom object display value ([@patricklx](https://github.com/patricklx))
* [#2315](https://github.com/emberjs/ember-inspector/pull/2315) Start adding TypeScript ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

#### :bug: Bug Fix
* [#2487](https://github.com/emberjs/ember-inspector/pull/2487) [container debug] fix missing message handling ([@patricklx](https://github.com/patricklx))
* [#2488](https://github.com/emberjs/ember-inspector/pull/2488) [app-info] fix missing app config ([@patricklx](https://github.com/patricklx))
* [#2484](https://github.com/emberjs/ember-inspector/pull/2484) fix .get is not defined ([@patricklx](https://github.com/patricklx))
* [#2476](https://github.com/emberjs/ember-inspector/pull/2476) fix manifest ([@patricklx](https://github.com/patricklx))
* [#2477](https://github.com/emberjs/ember-inspector/pull/2477) fix missing errors when digging into props ([@patricklx](https://github.com/patricklx))
* [#2432](https://github.com/emberjs/ember-inspector/pull/2432) do not fail on bad toString call ([@patricklx](https://github.com/patricklx))
* [#2270](https://github.com/emberjs/ember-inspector/pull/2270) fix: Use correct value path in object inspector (#2237) ([@rossketron](https://github.com/rossketron))
* [#2244](https://github.com/emberjs/ember-inspector/pull/2244) add script tag to the head instead ([@patricklx](https://github.com/patricklx))

#### :memo: Documentation
* [#2471](https://github.com/emberjs/ember-inspector/pull/2471) Update README.md with pnpm usage ([@CvX](https://github.com/CvX))

#### :house: Internal
* [#2475](https://github.com/emberjs/ember-inspector/pull/2475) modernize ember debug ([@patricklx](https://github.com/patricklx))
* [#2111](https://github.com/emberjs/ember-inspector/pull/2111) Convert to manifest v3 ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
* [#2433](https://github.com/emberjs/ember-inspector/pull/2433) Bump some deps ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
* [#2411](https://github.com/emberjs/ember-inspector/pull/2411) use pnpm ([@patricklx](https://github.com/patricklx))
* [#2403](https://github.com/emberjs/ember-inspector/pull/2403) use requireModule instead of require ([@patricklx](https://github.com/patricklx))
* [#2316](https://github.com/emberjs/ember-inspector/pull/2316) Various lint fixes ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
* [#2284](https://github.com/emberjs/ember-inspector/pull/2284) ember-cli-update to 4.9.2 ([@RobbieTheWagner](https://github.com/RobbieTheWagner))

#### Committers: 4
- Jarek Radosz ([@CvX](https://github.com/CvX))
- Patrick Pircher ([@patricklx](https://github.com/patricklx))
- Robbie Wagner ([@RobbieTheWagner](https://github.com/RobbieTheWagner))
- Ross Ketron ([@rossketron](https://github.com/rossketron))

## v4.9.1 (2022-11-04)

#### :bug: Bug Fix
* [#2227](https://github.com/emberjs/ember-inspector/pull/2227) check if ember is loaded via registry ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* [#2215](https://github.com/emberjs/ember-inspector/pull/2215) add context menu test ([@patricklx](https://github.com/patricklx))
* [#2214](https://github.com/emberjs/ember-inspector/pull/2214) test auto scrolling to previewing/pinned ([@patricklx](https://github.com/patricklx))
* [#2219](https://github.com/emberjs/ember-inspector/pull/2219) update vertical-collection & ember-table ([@patricklx](https://github.com/patricklx))
* [#2216](https://github.com/emberjs/ember-inspector/pull/2216) add minimal data debug test ([@patricklx](https://github.com/patricklx))
* [#2213](https://github.com/emberjs/ember-inspector/pull/2213) test injection with content&background script ([@patricklx](https://github.com/patricklx))
* [#2203](https://github.com/emberjs/ember-inspector/pull/2203) fix publishing firefox ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## v4.9.0 (2022-10-23)

#### :rocket: Enhancement
* [#2201](https://github.com/emberjs/ember-inspector/pull/2201) bring back tracked dependencies ([@patricklx](https://github.com/patricklx))

#### :bug: Bug Fix
* [#1086](https://github.com/emberjs/ember-inspector/pull/1086) Fix more items indicator sometimes not appearing ([@patricklx](https://github.com/patricklx))
* [#2202](https://github.com/emberjs/ember-inspector/pull/2202) [bug] component tree sometimes does not update ([@patricklx](https://github.com/patricklx))
* [#2199](https://github.com/emberjs/ember-inspector/pull/2199) [bug] tree view sometimes not updating children ([@patricklx](https://github.com/patricklx))
* [#2192](https://github.com/emberjs/ember-inspector/pull/2192) fix evented off  ([@patricklx](https://github.com/patricklx))
* [#2189](https://github.com/emberjs/ember-inspector/pull/2189) fix post message for testem ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* [#2191](https://github.com/emberjs/ember-inspector/pull/2191) use internal messaging to setup iframes ([@patricklx](https://github.com/patricklx))
* [#2190](https://github.com/emberjs/ember-inspector/pull/2190) fix publishing  ([@patricklx](https://github.com/patricklx))
* [#2187](https://github.com/emberjs/ember-inspector/pull/2187) Bump Github actions ([@ctjhoa](https://github.com/ctjhoa))

#### Committers: 2
- Camille TJHOA ([@ctjhoa](https://github.com/ctjhoa))
- Patrick Pircher ([@patricklx](https://github.com/patricklx))

## v4.8.0 (2022-10-12)

#### :rocket: Enhancement
* [#2161](https://github.com/emberjs/ember-inspector/pull/2161) fix app switching ([@patricklx](https://github.com/patricklx))
* [#2147](https://github.com/emberjs/ember-inspector/pull/2147) show args for template only components ([@patricklx](https://github.com/patricklx))
* [#2158](https://github.com/emberjs/ember-inspector/pull/2158) scroll into view while previewing or selecting from page ([@patricklx](https://github.com/patricklx))
* [#2156](https://github.com/emberjs/ember-inspector/pull/2156) correctly serialize args for internal components like Input ([@patricklx](https://github.com/patricklx))

#### :bug: Bug Fix
* [#2186](https://github.com/emberjs/ember-inspector/pull/2186) [bug] data tab does not load if there are no models ([@patricklx](https://github.com/patricklx))
* [#2178](https://github.com/emberjs/ember-inspector/pull/2178) fix some pages not loading ([@patricklx](https://github.com/patricklx))
* [#2177](https://github.com/emberjs/ember-inspector/pull/2177) getRange might return null ([@patricklx](https://github.com/patricklx))
* [#2176](https://github.com/emberjs/ember-inspector/pull/2176) iterate check over retained objects if they are destroyed ([@patricklx](https://github.com/patricklx))
* [#2169](https://github.com/emberjs/ember-inspector/pull/2169) fix some more app switching issues ([@patricklx](https://github.com/patricklx))
* [#2162](https://github.com/emberjs/ember-inspector/pull/2162) fix args of template only components ([@patricklx](https://github.com/patricklx))
* [#2157](https://github.com/emberjs/ember-inspector/pull/2157) fix iframes without src, e.g. twiddle ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* [#2168](https://github.com/emberjs/ember-inspector/pull/2168) cleanup iframes & firefox skeleton ([@patricklx](https://github.com/patricklx))
* [#2133](https://github.com/emberjs/ember-inspector/pull/2133) Update all master refs to main ([@rwwagner90](https://github.com/rwwagner90))
* [#2126](https://github.com/emberjs/ember-inspector/pull/2126) Refactor List to glimmer, remove lifecycle hooks ([@rwwagner90](https://github.com/rwwagner90))
* [#2128](https://github.com/emberjs/ember-inspector/pull/2128) Target Ember 3.16+ for main branch ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 2
- Patrick Pircher ([@patricklx](https://github.com/patricklx))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.7.1 (2022-08-31)

#### :house: Internal
* [#2127](https://github.com/emberjs/ember-inspector/pull/2127) Add back del ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.7.0 (2022-08-31)

#### :house: Internal
* [#2124](https://github.com/emberjs/ember-inspector/pull/2124) Update to ember 4 ([@rwwagner90](https://github.com/rwwagner90))
* [#2122](https://github.com/emberjs/ember-inspector/pull/2122) Convert some components to glimmer ([@rwwagner90](https://github.com/rwwagner90))
* [#2123](https://github.com/emberjs/ember-inspector/pull/2123) Update ember cli ([@rwwagner90](https://github.com/rwwagner90))
* [#2121](https://github.com/emberjs/ember-inspector/pull/2121) Remove unused dep `del` ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 2
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- [@patricklx](https://github.com/patricklx)

## v4.6.3 (2022-08-19)

#### :bug: Bug Fix
* [#2108](https://github.com/emberjs/ember-inspector/pull/2108) fix ember inspector not loading ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- [@patricklx](https://github.com/patricklx)

## v4.6.2 (2022-08-18)

#### :bug: Bug Fix
* [#2105](https://github.com/emberjs/ember-inspector/pull/2105) fix ember inspector not loading ([@patricklx](https://github.com/patricklx))

#### Committers: 1
- [@patricklx](https://github.com/patricklx)

## v4.6.1 (2022-08-17)

#### :bug: Bug Fix
* [#2100](https://github.com/emberjs/ember-inspector/pull/2100) Silence Ember.global deprecation messages when consumers use 3.28 with `throwOnUnhandled: true` ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## v4.6.0 (2022-08-17)

#### :rocket: Enhancement
* [#2040](https://github.com/emberjs/ember-inspector/pull/2040) do not close the object inspector ([@patricklx](https://github.com/patricklx))
* [#1905](https://github.com/emberjs/ember-inspector/pull/1905) enhancement(view-inspection): increased z-index for highlight and tooltip ([@andrewmnlv](https://github.com/andrewmnlv))
* [#1959](https://github.com/emberjs/ember-inspector/pull/1959) component-tree: make left/right arrow nav in certain conditions (Closes [#1537](https://github.com/emberjs/ember-inspector/issues/1537)) ([@geneukum](https://github.com/geneukum))

#### :bug: Bug Fix
* [#2051](https://github.com/emberjs/ember-inspector/pull/2051) fix loading ember-inspector after reload ([@patricklx](https://github.com/patricklx))
* [#2052](https://github.com/emberjs/ember-inspector/pull/2052) fix component tree item show ([@patricklx](https://github.com/patricklx))
* [#2043](https://github.com/emberjs/ember-inspector/pull/2043) bring back the inspect component context menu functionality ([@patricklx](https://github.com/patricklx))
* [#2008](https://github.com/emberjs/ember-inspector/pull/2008) Deprecation toolbar clear btn does not clear deprecations ([@geneukum](https://github.com/geneukum))
* [#1940](https://github.com/emberjs/ember-inspector/pull/1940) Remove support for the TargetActionSupport mixin ([@Windvis](https://github.com/Windvis))

#### :house: Internal
* [#2103](https://github.com/emberjs/ember-inspector/pull/2103) Remove automated uploads ([@rwwagner90](https://github.com/rwwagner90))
* [#2101](https://github.com/emberjs/ember-inspector/pull/2101) Download panes from GitHub instead of S3 ([@rwwagner90](https://github.com/rwwagner90))
* [#2054](https://github.com/emberjs/ember-inspector/pull/2054) Convert controllers to native classes ([@rwwagner90](https://github.com/rwwagner90))
* [#2053](https://github.com/emberjs/ember-inspector/pull/2053) Convert ToolbarSearchField to glimmer ([@rwwagner90](https://github.com/rwwagner90))
* [#2041](https://github.com/emberjs/ember-inspector/pull/2041) ember-cli 4.4.0, fix some lint ([@rwwagner90](https://github.com/rwwagner90))
* [#1998](https://github.com/emberjs/ember-inspector/pull/1998) list-cell: convert to glimmer ([@geneukum](https://github.com/geneukum))
* [#1990](https://github.com/emberjs/ember-inspector/pull/1990) resizable-column: convert to glimmer ([@geneukum](https://github.com/geneukum))
* [#1991](https://github.com/emberjs/ember-inspector/pull/1991) object-inspector-test: fix legacy-attribute-arguments issue ([@geneukum](https://github.com/geneukum))
* [#1987](https://github.com/emberjs/ember-inspector/pull/1987) render-item: fixup no-curly-component-invocation ([@geneukum](https://github.com/geneukum))
* [#1988](https://github.com/emberjs/ember-inspector/pull/1988) eslintrc: enable 'no-actions-hash' lint rule ([@geneukum](https://github.com/geneukum))
* [#1989](https://github.com/emberjs/ember-inspector/pull/1989) eslintrc: enable no-test-import-export rule ([@geneukum](https://github.com/geneukum))
* [#1973](https://github.com/emberjs/ember-inspector/pull/1973) deprecations: resolve instances of this-property-fallback ([@geneukum](https://github.com/geneukum))
* [#1976](https://github.com/emberjs/ember-inspector/pull/1976) deprecations: fixup instances of no-inline-styles ([@geneukum](https://github.com/geneukum))
* [#1974](https://github.com/emberjs/ember-inspector/pull/1974) deprecations: fix instances of routing-transition-methods ([@geneukum](https://github.com/geneukum))
* [#1975](https://github.com/emberjs/ember-inspector/pull/1975) list: fixup dot access for run.bind deprecation ([@geneukum](https://github.com/geneukum))
* [#1972](https://github.com/emberjs/ember-inspector/pull/1972) properties-base, properties-grouped, properties-all: octane/glimmer upgrade  ([@geneukum](https://github.com/geneukum))
* [#1961](https://github.com/emberjs/ember-inspector/pull/1961) object-inspector: migrate to glimmer component ([@geneukum](https://github.com/geneukum))
* [#1906](https://github.com/emberjs/ember-inspector/pull/1906) octane migration - deprecation-item-source ([@michaelbdai](https://github.com/michaelbdai))

#### Committers: 6
- Bing Dai ([@michaelbdai](https://github.com/michaelbdai))
- Geordan Neukum ([@geneukum](https://github.com/geneukum))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))
- [@andrewmnlv](https://github.com/andrewmnlv)
- [@patricklx](https://github.com/patricklx)

## v4.5.11 (2021-12-27)

#### :bug: Bug Fix
* [#1848](https://github.com/emberjs/ember-inspector/pull/1848) Force startup-wrapper logic to run less times ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#1858](https://github.com/emberjs/ember-inspector/pull/1858) Node 14.18.2 ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.5.10 (2021-12-15)

## v4.5.9 (2021-12-15)

#### :bug: Bug Fix
* [#1845](https://github.com/emberjs/ember-inspector/pull/1845) Fix setting _lastPromise computed deprecation ([@rwwagner90](https://github.com/rwwagner90))
* [#1844](https://github.com/emberjs/ember-inspector/pull/1844) Fix ember-debug imports ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#1847](https://github.com/emberjs/ember-inspector/pull/1847) Fix chrome publishing again ([@chancancode](https://github.com/chancancode))
* [#1846](https://github.com/emberjs/ember-inspector/pull/1846) Enable ember/require-tagless-components ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 2
- Godfrey Chan ([@chancancode](https://github.com/chancancode))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.5.8 (2021-12-14)

#### :house: Internal
* [#1843](https://github.com/emberjs/ember-inspector/pull/1843) Fix firefox publishing ([@chancancode](https://github.com/chancancode))
* [#1842](https://github.com/emberjs/ember-inspector/pull/1842) Fix chrome publishing ([@chancancode](https://github.com/chancancode))

#### Committers: 1
- Godfrey Chan ([@chancancode](https://github.com/chancancode))

## v4.5.7 (2021-12-13)

#### :house: Internal
* [#1840](https://github.com/emberjs/ember-inspector/pull/1840) Disable more flaky tests ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.5.6 (2021-12-13)

#### :house: Internal
* [#1839](https://github.com/emberjs/ember-inspector/pull/1839) Skip flaky container:types test ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.5.5 (2021-12-13)

#### :bug: Bug Fix
* [#1807](https://github.com/emberjs/ember-inspector/pull/1807) bug: Find the latest entry created by lerna-changelog ([@mdeanjones](https://github.com/mdeanjones))

#### :memo: Documentation
* [#1821](https://github.com/emberjs/ember-inspector/pull/1821) docs(readme): change order of installation hints ([@derrabauke](https://github.com/derrabauke))

#### :house: Internal
* [#1833](https://github.com/emberjs/ember-inspector/pull/1833) fix issue, test destroyed the component before EmberDebugger is destr… ([@michaelbdai](https://github.com/michaelbdai))
* [#1829](https://github.com/emberjs/ember-inspector/pull/1829) Use new VC and ember-table betas ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 4
- Bing Dai ([@michaelbdai](https://github.com/michaelbdai))
- Falk Neumann ([@derrabauke](https://github.com/derrabauke))
- Michael Jones ([@mdeanjones](https://github.com/mdeanjones))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.5.4 (2021-11-23)

#### :bug: Bug Fix
* [#1814](https://github.com/emberjs/ember-inspector/pull/1814) replace `[].any` with `[].some` ([@Windvis](https://github.com/Windvis))

#### :house: Internal
* [#1804](https://github.com/emberjs/ember-inspector/pull/1804) Try to fix owner errors ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 2
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## v4.5.3 (2021-11-18)

#### :bug: Bug Fix
* [#1803](https://github.com/emberjs/ember-inspector/pull/1803) Replace ember-did-resize-modifier with ember-on-resize-modifier ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#1802](https://github.com/emberjs/ember-inspector/pull/1802) ESLint 8 support ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))

## v4.5.2 (2021-11-17)

#### :bug: Bug Fix
* [#1780](https://github.com/emberjs/ember-inspector/pull/1780) fix startup bug in Firefox (Closes [#1770](https://github.com/emberjs/ember-inspector/issues/1770)) ([@luxferresum](https://github.com/luxferresum))

#### :house: Internal
* [#1793](https://github.com/emberjs/ember-inspector/pull/1793) Remove ember-did-resize-modifier dep (for now?) ([@chancancode](https://github.com/chancancode))
* [#1783](https://github.com/emberjs/ember-inspector/pull/1783) Update publish-chrome action to use node 14.X ([@kdagnan](https://github.com/kdagnan))
* [#1782](https://github.com/emberjs/ember-inspector/pull/1782) Update Chrome Publish Action to Use New Command ([@kdagnan](https://github.com/kdagnan))
* [#1771](https://github.com/emberjs/ember-inspector/pull/1771) remove port mixin ([@michaelbdai](https://github.com/michaelbdai))

#### Committers: 5
- Bing Dai ([@michaelbdai](https://github.com/michaelbdai))
- Godfrey Chan ([@chancancode](https://github.com/chancancode))
- Igor Kvasnička ([@IgorKvasn](https://github.com/IgorKvasn))
- Kyle D. ([@kdagnan](https://github.com/kdagnan))
- Lukas Kohler ([@luxferresum](https://github.com/luxferresum))


## v4.5.1 (2021-11-02)

## v4.5.0 (2021-11-02)

#### :rocket: Enhancement
* [#1730](https://github.com/emberjs/ember-inspector/pull/1730) Update ember-flatpickr ([@rwwagner90](https://github.com/rwwagner90))
* [#1685](https://github.com/emberjs/ember-inspector/pull/1685) add highlight render option to Render Performance tab ([@michaelbdai](https://github.com/michaelbdai))

#### :bug: Bug Fix
* [#1760](https://github.com/emberjs/ember-inspector/pull/1760) Don't rely on Ember.EmberInspectorDebugger ([@sandstrom](https://github.com/sandstrom))

#### :house: Internal
* [#1759](https://github.com/emberjs/ember-inspector/pull/1759) Fix release-it-lerna-changelog ([@rwwagner90](https://github.com/rwwagner90))
* [#1750](https://github.com/emberjs/ember-inspector/pull/1750) fixed all the beta build test failures ([@michaelbdai](https://github.com/michaelbdai))
* [#1733](https://github.com/emberjs/ember-inspector/pull/1733) Recreate yarn.lock ([@rwwagner90](https://github.com/rwwagner90))
* [#1741](https://github.com/emberjs/ember-inspector/pull/1741) Fix build ([@chancancode](https://github.com/chancancode))
* [#1731](https://github.com/emberjs/ember-inspector/pull/1731) Fix deprecated use of `run.debounce` ([@chancancode](https://github.com/chancancode))
* [#1714](https://github.com/emberjs/ember-inspector/pull/1714) Use forks of packages ([@rwwagner90](https://github.com/rwwagner90))
* [#1727](https://github.com/emberjs/ember-inspector/pull/1727) Refactor legacy/bespoke injection patterns into services ([@chancancode](https://github.com/chancancode))
* [#1695](https://github.com/emberjs/ember-inspector/pull/1695) Update ember-test-selectors ([@rwwagner90](https://github.com/rwwagner90))
* [#1683](https://github.com/emberjs/ember-inspector/pull/1683) Remove toolbar outlet, remove more global Ember ([@rwwagner90](https://github.com/rwwagner90))
* [#1680](https://github.com/emberjs/ember-inspector/pull/1680) ember-cli 3.27, fix some lint ([@rwwagner90](https://github.com/rwwagner90))
* [#1619](https://github.com/emberjs/ember-inspector/pull/1619) Move changelog heading to top ([@sandstrom](https://github.com/sandstrom))

#### Committers: 4
- Bing Dai ([@michaelbdai](https://github.com/michaelbdai))
- Godfrey Chan ([@chancancode](https://github.com/chancancode))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- [@sandstrom](https://github.com/sandstrom)

## v4.4.1 (2021-05-25)

#### :bug: Bug Fix
* [#1601](https://github.com/emberjs/ember-inspector/pull/1601) Ensure vendored loader does not cache missing modules. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v4.4.0 (2021-05-21)

#### :rocket: Enhancement
* [#1577](https://github.com/emberjs/ember-inspector/pull/1577) Add app config tab ([@hannakim91](https://github.com/hannakim91))

#### :bug: Bug Fix
* [#1493](https://github.com/emberjs/ember-inspector/pull/1493) Change message type to switch to components route ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#1592](https://github.com/emberjs/ember-inspector/pull/1592) Start on eslint-plugin-ember 10 updates ([@rwwagner90](https://github.com/rwwagner90))
* [#1591](https://github.com/emberjs/ember-inspector/pull/1591) Fix some template lint issues ([@rwwagner90](https://github.com/rwwagner90))
* [#1590](https://github.com/emberjs/ember-inspector/pull/1590) Fix no-invalid-interactive ([@rwwagner90](https://github.com/rwwagner90))
* [#1559](https://github.com/emberjs/ember-inspector/pull/1559) ember lookup util ([@lifeart](https://github.com/lifeart))
* [#1535](https://github.com/emberjs/ember-inspector/pull/1535) Use `requireModule('ember')` instead of `window.Ember` ([@rwwagner90](https://github.com/rwwagner90))
* [#1528](https://github.com/emberjs/ember-inspector/pull/1528) Run dependabot less often ([@sandstrom](https://github.com/sandstrom))

#### Committers: 5
- Alex Kanunnikov ([@lifeart](https://github.com/lifeart))
- Hanna (she/her) ([@hannakim91](https://github.com/hannakim91))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)
- [@sandstrom](https://github.com/sandstrom)

## v4.3.5 (2021-03-10)

#### :bug: Bug Fix
* [#1445](https://github.com/emberjs/ember-inspector/pull/1445) Bypass unresolved route promises in route-debug ([@steventsao](https://github.com/steventsao))

#### :house: Internal
* [#1509](https://github.com/emberjs/ember-inspector/pull/1509) Migrate to volta-cli/action ([@steventsao](https://github.com/steventsao))

#### Committers: 4
- Ricardo Mendes ([@locks](https://github.com/locks))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- Steven Tsao ([@steventsao](https://github.com/steventsao))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v4.3.2 (2020-08-17)

## v4.3.1 (2020-08-16)

## v4.3.0 (2020-08-16)

#### :rocket: Enhancement
* [#1273](https://github.com/emberjs/ember-inspector/pull/1273) Collapsible Navigation ([@nummi](https://github.com/nummi))

#### :bug: Bug Fix
* [#1299](https://github.com/emberjs/ember-inspector/pull/1299) Ensure `valueForTag` is passed an actual `Tag` ([@rwjblue](https://github.com/rwjblue))
* [#1227](https://github.com/emberjs/ember-inspector/pull/1227) fix get class name ([@patricklx](https://github.com/patricklx))

#### :house: Internal
* [#1311](https://github.com/emberjs/ember-inspector/pull/1311) Add rwjblue release-it config ([@rwwagner90](https://github.com/rwwagner90))
* [#1309](https://github.com/emberjs/ember-inspector/pull/1309) Fix some tests ([@rwwagner90](https://github.com/rwwagner90))
* [#1247](https://github.com/emberjs/ember-inspector/pull/1247) Update eslint-plugin-ember, fix lint ([@rwwagner90](https://github.com/rwwagner90))
* [#1185](https://github.com/emberjs/ember-inspector/pull/1185) Start converting some things to octane ([@rwwagner90](https://github.com/rwwagner90))
* [#1219](https://github.com/emberjs/ember-inspector/pull/1219) Prevent future ember/no-mixins eslint error ([@ansmonjol](https://github.com/ansmonjol))
* [#1215](https://github.com/emberjs/ember-inspector/pull/1215) Refactor `scripts/` to use more modern Node idioms. ([@rwjblue](https://github.com/rwjblue))
* [#1206](https://github.com/emberjs/ember-inspector/pull/1206) Add Prettier to ESLint configuration. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 7
- Alexandre Monjol ([@ansmonjol](https://github.com/ansmonjol))
- Godfrey Chan ([@chancancode](https://github.com/chancancode))
- Jerry Nummi ([@nummi](https://github.com/nummi))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)
- [@patricklx](https://github.com/patricklx)

## [v4.1.0](https://github.com/emberjs/ember-inspector/tree/v4.1.0) (2020-05-12)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v4.0.1...v4.1.0)

**Implemented enhancements:**

- Add ability to sort container instances alphabetically [\#1198](https://github.com/emberjs/ember-inspector/pull/1198) ([lukemelia](https://github.com/lukemelia))

**Fixed bugs:**

- Rendering tests unusable in ember-inspectors test suite [\#1201](https://github.com/emberjs/ember-inspector/issues/1201)
- Can't see full list of components in `Components` tab after 4.0.0 [\#1200](https://github.com/emberjs/ember-inspector/issues/1200)
- Component Tree - dissapears if modal-dialog used and focused using component explorer [\#1195](https://github.com/emberjs/ember-inspector/issues/1195)
- Component tree: incorrect string component arguments serialization [\#1190](https://github.com/emberjs/ember-inspector/issues/1190)
- Ensure renderDebug is properly unregistered. [\#1202](https://github.com/emberjs/ember-inspector/pull/1202) ([rwjblue](https://github.com/rwjblue))
- Upgrade to Ember 3.18 to fix list rendering issue [\#1196](https://github.com/emberjs/ember-inspector/pull/1196) ([chancancode](https://github.com/chancancode))
- Fix string arguments in component tree to render only one pair of double quotes fixes \#1190 [\#1193](https://github.com/emberjs/ember-inspector/pull/1193) ([SYU15](https://github.com/SYU15))
- fix attrs/args - toString is undefined [\#1189](https://github.com/emberjs/ember-inspector/pull/1189) ([patricklx](https://github.com/patricklx))

**Merged pull requests:**

- Bump jquery from 3.4.1 to 3.5.1 [\#1207](https://github.com/emberjs/ember-inspector/pull/1207) ([dependabot[bot]](https://github.com/apps/dependabot))
- Remove private API usage to set moduleName in view debug tests. [\#1205](https://github.com/emberjs/ember-inspector/pull/1205) ([rwjblue](https://github.com/rwjblue))
- Introduce `setupEmberDebugTest` test helper. [\#1204](https://github.com/emberjs/ember-inspector/pull/1204) ([rwjblue](https://github.com/rwjblue))
- Reset internal test helper state for EmberDebug tests. [\#1203](https://github.com/emberjs/ember-inspector/pull/1203) ([rwjblue](https://github.com/rwjblue))
- Add 4.0.0 changelog, bump minor version [\#1188](https://github.com/emberjs/ember-inspector/pull/1188) ([rwwagner90](https://github.com/rwwagner90))
- No observers lint rule [\#1181](https://github.com/emberjs/ember-inspector/pull/1181) ([ansmonjol](https://github.com/ansmonjol))

## [v4.0.1](https://github.com/emberjs/ember-inspector/tree/v4.0.1) (2020-05-06)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v4.0.0...v4.0.1)

## [v4.0.0](https://github.com/emberjs/ember-inspector/tree/v4.0.0) (2020-05-06)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.13.2...v4.0.0)

**Implemented enhancements:**

- Filter out object properties by property name filter/search [\#1171](https://github.com/emberjs/ember-inspector/issues/1171)
- Implement Keyboard Navigation in the Component Tree [\#1142](https://github.com/emberjs/ember-inspector/issues/1142)
- feat: allow object arguments in component tree to be inspected [\#1175](https://github.com/emberjs/ember-inspector/pull/1175) ([SYU15](https://github.com/SYU15))
- Filter out object properties by property name filter/search [\#1172](https://github.com/emberjs/ember-inspector/pull/1172) ([ansmonjol](https://github.com/ansmonjol))
- More functional classes and data-test selectors [\#1168](https://github.com/emberjs/ember-inspector/pull/1168) ([nummi](https://github.com/nummi))
- \[FEAT\] Add inspect store button to data pane in Ember Inspector [\#1163](https://github.com/emberjs/ember-inspector/pull/1163) ([SYU15](https://github.com/SYU15))
- Component Tree Arrow Key Navigation [\#1153](https://github.com/emberjs/ember-inspector/pull/1153) ([nummi](https://github.com/nummi))
- `lib/ui` utility classes [\#1147](https://github.com/emberjs/ember-inspector/pull/1147) ([nummi](https://github.com/nummi))
- Add args to tree [\#1112](https://github.com/emberjs/ember-inspector/pull/1112) ([rwwagner90](https://github.com/rwwagner90))

**Fixed bugs:**

- fix component attrs inspect [\#1150](https://github.com/emberjs/ember-inspector/pull/1150) ([patricklx](https://github.com/patricklx))
- fix component args inspect [\#1149](https://github.com/emberjs/ember-inspector/pull/1149) ([patricklx](https://github.com/patricklx))

**Closed issues:**

- Upgrade to latest ember-{source,cli,data} [\#1148](https://github.com/emberjs/ember-inspector/issues/1148)
- Inspector breaks filestack.com account dashboard [\#1145](https://github.com/emberjs/ember-inspector/issues/1145)
- Privacy Policy [\#1139](https://github.com/emberjs/ember-inspector/issues/1139)
- Inspector breaks geocaching.com [\#1133](https://github.com/emberjs/ember-inspector/issues/1133)

**Merged pull requests:**

- Update to major version 4.0.0 [\#1187](https://github.com/emberjs/ember-inspector/pull/1187) ([rwwagner90](https://github.com/rwwagner90))
- Disable `fail-fast` for `ember-try` [\#1186](https://github.com/emberjs/ember-inspector/pull/1186) ([chancancode](https://github.com/chancancode))
- Remove moment, bump deps [\#1184](https://github.com/emberjs/ember-inspector/pull/1184) ([rwwagner90](https://github.com/rwwagner90))
- No duplicate imports lint rule [\#1182](https://github.com/emberjs/ember-inspector/pull/1182) ([ansmonjol](https://github.com/ansmonjol))
- Use brace expansion lint rule [\#1180](https://github.com/emberjs/ember-inspector/pull/1180) ([ansmonjol](https://github.com/ansmonjol))
- fix: pin artifact-download to v1 [\#1179](https://github.com/emberjs/ember-inspector/pull/1179) ([SYU15](https://github.com/SYU15))
- attrs does not have constructor [\#1176](https://github.com/emberjs/ember-inspector/pull/1176) ([patricklx](https://github.com/patricklx))
- Ember 3.17 [\#1174](https://github.com/emberjs/ember-inspector/pull/1174) ([rwwagner90](https://github.com/rwwagner90))
- \[BUGFIX\] Updates autotracking APIs [\#1170](https://github.com/emberjs/ember-inspector/pull/1170) ([pzuraq](https://github.com/pzuraq))
- Fix code coverage report [\#1167](https://github.com/emberjs/ember-inspector/pull/1167) ([chancancode](https://github.com/chancancode))
- Co-locate component templates [\#1166](https://github.com/emberjs/ember-inspector/pull/1166) ([chancancode](https://github.com/chancancode))
- Introduce `setupTestAdapter` hook [\#1165](https://github.com/emberjs/ember-inspector/pull/1165) ([chancancode](https://github.com/chancancode))
- \[FEAT\] Add inspect store button to data pane in Ember Inspector [\#1163](https://github.com/emberjs/ember-inspector/pull/1163) ([SYU15](https://github.com/SYU15))
- Inter Font [\#1161](https://github.com/emberjs/ember-inspector/pull/1161) ([nummi](https://github.com/nummi))
- Bump acorn from 5.7.3 to 5.7.4 [\#1160](https://github.com/emberjs/ember-inspector/pull/1160) ([dependabot[bot]](https://github.com/apps/dependabot))
- Base font size and utility classes [\#1157](https://github.com/emberjs/ember-inspector/pull/1157) ([nummi](https://github.com/nummi))
- Update issue templates [\#1155](https://github.com/emberjs/ember-inspector/pull/1155) ([rwwagner90](https://github.com/rwwagner90))
- Update to ember 3.16 [\#1151](https://github.com/emberjs/ember-inspector/pull/1151) ([Windvis](https://github.com/Windvis))
- Bump handlebars from 4.2.1 to 4.5.3 [\#1122](https://github.com/emberjs/ember-inspector/pull/1122) ([dependabot[bot]](https://github.com/apps/dependabot))
- v3.13.1 CHANGELOG [\#1119](https://github.com/emberjs/ember-inspector/pull/1119) ([chancancode](https://github.com/chancancode))
- Bump minor on master after 3.13 release [\#1118](https://github.com/emberjs/ember-inspector/pull/1118) ([chancancode](https://github.com/chancancode))

## [v3.13.2](https://github.com/emberjs/ember-inspector/tree/v3.13.2) (2020-02-19)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.13.1...v3.13.2)

**Fixed bugs:**

- fix recursion of getTagTrackedProps [\#1144](https://github.com/emberjs/ember-inspector/pull/1144) ([patricklx](https://github.com/patricklx))
- Fix fallback to old inspectors [\#1141](https://github.com/emberjs/ember-inspector/pull/1141) ([wycats](https://github.com/wycats))
- \[BUGFIX\] Updates "import" paths for autotracking APIs [\#1138](https://github.com/emberjs/ember-inspector/pull/1138) ([pzuraq](https://github.com/pzuraq))
- only boot inspector on HTML pages [\#1137](https://github.com/emberjs/ember-inspector/pull/1137) ([efx](https://github.com/efx))

**Closed issues:**

- Route Tab not displaying anything - 3.15 [\#1140](https://github.com/emberjs/ember-inspector/issues/1140)
- injected script breaks browser default XML presentation [\#1136](https://github.com/emberjs/ember-inspector/issues/1136)
- Investigate canary failures [\#1134](https://github.com/emberjs/ember-inspector/issues/1134)
- Error message: Ember.meta\(...\).peekDescriptors is not a function - Object are not shown for any ember component [\#1120](https://github.com/emberjs/ember-inspector/issues/1120)

**Merged pull requests:**

- Bump Ember Table to 2.2.2 [\#1131](https://github.com/emberjs/ember-inspector/pull/1131) ([mixonic](https://github.com/mixonic))
- Fix canary test failure [\#1130](https://github.com/emberjs/ember-inspector/pull/1130) ([chancancode](https://github.com/chancancode))
- Bump handlebars from 4.2.1 to 4.5.3 [\#1122](https://github.com/emberjs/ember-inspector/pull/1122) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v3.13.1](https://github.com/emberjs/ember-inspector/tree/v3.13.1) (2019-12-20)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.13.0...v3.13.1)

**Fixed bugs:**

- Inspector does not recognize app if Ember.ENV.EXTEND\_PROTOTYPES does not exist [\#1114](https://github.com/emberjs/ember-inspector/issues/1114)
- Fix prototype extensions detection [\#1117](https://github.com/emberjs/ember-inspector/pull/1117) ([chancancode](https://github.com/chancancode))
- Bring back Node 8 support \(for now\) [\#1116](https://github.com/emberjs/ember-inspector/pull/1116) ([chancancode](https://github.com/chancancode))
- Render the CHANGELOG for the current version [\#1115](https://github.com/emberjs/ember-inspector/pull/1115) ([chancancode](https://github.com/chancancode))

**Merged pull requests:**

- v3.13.0 CHANGELOGs [\#1113](https://github.com/emberjs/ember-inspector/pull/1113) ([chancancode](https://github.com/chancancode))

## [v3.13.0](https://github.com/emberjs/ember-inspector/tree/v3.13.0) (2019-12-19)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.12.5...v3.13.0)

**Implemented enhancements:**

- Don't abuse timers [\#1108](https://github.com/emberjs/ember-inspector/pull/1108) ([chancancode](https://github.com/chancancode))
- Only deepClone when without prototype extensions [\#1107](https://github.com/emberjs/ember-inspector/pull/1107) ([chancancode](https://github.com/chancancode))
- Revamp components inspection \(Octane support and improved UX\) [\#1088](https://github.com/emberjs/ember-inspector/pull/1088) ([chancancode](https://github.com/chancancode))
- Fix tracked detection [\#1087](https://github.com/emberjs/ember-inspector/pull/1087) ([patricklx](https://github.com/patricklx))
- Name Known Ember Mixins [\#1055](https://github.com/emberjs/ember-inspector/pull/1055) ([patricklx](https://github.com/patricklx))
- Improve proxies [\#1053](https://github.com/emberjs/ember-inspector/pull/1053) ([patricklx](https://github.com/patricklx))
- Fix Ember.typeof replace with custom typeof [\#1052](https://github.com/emberjs/ember-inspector/pull/1052) ([patricklx](https://github.com/patricklx))

**Fixed bugs:**

- inspector breaks for Glimmer Components containing {{link-to}} [\#961](https://github.com/emberjs/ember-inspector/issues/961)
- Fix inspecting Glimmer components w/ obj inspector [\#1106](https://github.com/emberjs/ember-inspector/pull/1106) ([chancancode](https://github.com/chancancode))
- Avoid errors when using older Ember versions. [\#1102](https://github.com/emberjs/ember-inspector/pull/1102) ([chancancode](https://github.com/chancancode))
- fix issue with ember tracking reentry assert [\#1094](https://github.com/emberjs/ember-inspector/pull/1094) ([patricklx](https://github.com/patricklx))
- fix accessing properties of Object Proxy [\#1092](https://github.com/emberjs/ember-inspector/pull/1092) ([patricklx](https://github.com/patricklx))
- Fix template name [\#1085](https://github.com/emberjs/ember-inspector/pull/1085) ([chancancode](https://github.com/chancancode))

**Closed issues:**

- component.get is not a function errors [\#1049](https://github.com/emberjs/ember-inspector/issues/1049)
- Integrate debug render tree [\#1031](https://github.com/emberjs/ember-inspector/issues/1031)
- Figure out an API to get the component from the DOM [\#1001](https://github.com/emberjs/ember-inspector/issues/1001)
- Custom Component Support [\#870](https://github.com/emberjs/ember-inspector/issues/870)

**Merged pull requests:**

- Update `inspectNode` implementation [\#1105](https://github.com/emberjs/ember-inspector/pull/1105) ([chancancode](https://github.com/chancancode))
- Upload PR artifacts [\#1104](https://github.com/emberjs/ember-inspector/pull/1104) ([chancancode](https://github.com/chancancode))
- Refactor acceptance tests [\#1103](https://github.com/emberjs/ember-inspector/pull/1103) ([chancancode](https://github.com/chancancode))
- Fix no-new-mixins [\#1099](https://github.com/emberjs/ember-inspector/pull/1099) ([chancancode](https://github.com/chancancode))
- Bump dependencies [\#1096](https://github.com/emberjs/ember-inspector/pull/1096) ([chancancode](https://github.com/chancancode))
- Refactor `StorageService` [\#1095](https://github.com/emberjs/ember-inspector/pull/1095) ([chancancode](https://github.com/chancancode))
- Do not include leading zeros when calculating version number [\#1091](https://github.com/emberjs/ember-inspector/pull/1091) ([locks](https://github.com/locks))
- Refactor app `port` into a regular service [\#1090](https://github.com/emberjs/ember-inspector/pull/1090) ([chancancode](https://github.com/chancancode))
- Fix inspector in Electron [\#1084](https://github.com/emberjs/ember-inspector/pull/1084) ([bendemboski](https://github.com/bendemboski))
- Sync CHANGELOG [\#1083](https://github.com/emberjs/ember-inspector/pull/1083) ([chancancode](https://github.com/chancancode))
- Use babel-plugin-module-resolver [\#998](https://github.com/emberjs/ember-inspector/pull/998) ([rwwagner90](https://github.com/rwwagner90))

## [v3.12.5](https://github.com/emberjs/ember-inspector/tree/v3.12.5) (2019-11-13)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.12.4...v3.12.5)

**Merged pull requests:**

- Fix Chrome publishing [\#1082](https://github.com/emberjs/ember-inspector/pull/1082) ([chancancode](https://github.com/chancancode))

## [v3.12.4](https://github.com/emberjs/ember-inspector/tree/v3.12.4) (2019-11-13)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.12.3...v3.12.4)

**Fixed bugs:**

- Fixed issue with automatic publishing

## [v3.12.3](https://github.com/emberjs/ember-inspector/tree/v3.12.3) (2019-11-13)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.12.2...v3.12.3)

**Fixed bugs:**

- Today's Update Broke the Extension [\#1066](https://github.com/emberjs/ember-inspector/issues/1066)
- full angle bracket name should be searchable [\#1059](https://github.com/emberjs/ember-inspector/issues/1059)
- Fix glimmer.value [\#1072](https://github.com/emberjs/ember-inspector/pull/1072) ([patricklx](https://github.com/patricklx))

**Closed issues:**

- Mystery: why do we publish to NPM? [\#1079](https://github.com/emberjs/ember-inspector/issues/1079)
- Using Inspector \(3.12.2\) to view a particular Component or Data Model record fails with the following error: [\#1068](https://github.com/emberjs/ember-inspector/issues/1068)

**Merged pull requests:**

- Add missing npm artifact [\#1081](https://github.com/emberjs/ember-inspector/pull/1081) ([chancancode](https://github.com/chancancode))
- Auto publish [\#1080](https://github.com/emberjs/ember-inspector/pull/1080) ([chancancode](https://github.com/chancancode))
- Don't publish Firefox ZIP file to NPM [\#1078](https://github.com/emberjs/ember-inspector/pull/1078) ([chancancode](https://github.com/chancancode))
- Always run the "Build extensions" step [\#1077](https://github.com/emberjs/ember-inspector/pull/1077) ([chancancode](https://github.com/chancancode))
- Update CI badge [\#1076](https://github.com/emberjs/ember-inspector/pull/1076) ([chancancode](https://github.com/chancancode))
- Build with Node 12 [\#1075](https://github.com/emberjs/ember-inspector/pull/1075) ([chancancode](https://github.com/chancancode))
- Test of 3.12 LTS [\#1074](https://github.com/emberjs/ember-inspector/pull/1074) ([chancancode](https://github.com/chancancode))
- Migrate CI to GitHub Actions [\#1069](https://github.com/emberjs/ember-inspector/pull/1069) ([chancancode](https://github.com/chancancode))
- Changelogs [\#1067](https://github.com/emberjs/ember-inspector/pull/1067) ([chancancode](https://github.com/chancancode))
- Remove ember-cli-sri [\#1065](https://github.com/emberjs/ember-inspector/pull/1065) ([rwwagner90](https://github.com/rwwagner90))
- 3.12 Changelog [\#1062](https://github.com/emberjs/ember-inspector/pull/1062) ([rwwagner90](https://github.com/rwwagner90))

## [v3.12.2](https://github.com/emberjs/ember-inspector/tree/v3.12.2) (2019-11-08)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.12.1...v3.12.2)

**Fixed bugs:**

- Fixed issue with NPM publishing

## [v3.12.1](https://github.com/emberjs/ember-inspector/tree/v3.12.1) (2019-11-08)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.12.0...v3.12.1)

**Fixed bugs:**

- There's an empty void where the inspector should be [\#1064](https://github.com/emberjs/ember-inspector/issues/1064)

## [v3.12.0](https://github.com/emberjs/ember-inspector/tree/v3.12.0) (2019-11-08)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.11.0...v3.12.0)

**Implemented enhancements:**

- Component Tree Search [\#1021](https://github.com/emberjs/ember-inspector/issues/1021)
- Use XPath to select elements [\#1056](https://github.com/emberjs/ember-inspector/pull/1056) ([chancancode](https://github.com/chancancode))
- \<EmberTable\> [\#1046](https://github.com/emberjs/ember-inspector/pull/1046) ([nummi](https://github.com/nummi))
- Misc Component Cleanup [\#1044](https://github.com/emberjs/ember-inspector/pull/1044) ([nummi](https://github.com/nummi))
- Ember 3.13 [\#1040](https://github.com/emberjs/ember-inspector/pull/1040) ([nummi](https://github.com/nummi))
- Tidy up Promise tab [\#1038](https://github.com/emberjs/ember-inspector/pull/1038) ([nummi](https://github.com/nummi))
- Run octane blueprint, bump deps [\#1036](https://github.com/emberjs/ember-inspector/pull/1036) ([rwwagner90](https://github.com/rwwagner90))
- Support tracked and other improvements [\#1035](https://github.com/emberjs/ember-inspector/pull/1035) ([patricklx](https://github.com/patricklx))
- Tidy up data tab [\#1034](https://github.com/emberjs/ember-inspector/pull/1034) ([nummi](https://github.com/nummi))
- Tidy up container tab [\#1032](https://github.com/emberjs/ember-inspector/pull/1032) ([nummi](https://github.com/nummi))
- Tidy up deprecations tab [\#1030](https://github.com/emberjs/ember-inspector/pull/1030) ([nummi](https://github.com/nummi))
- Tidy up render-tree tab [\#1025](https://github.com/emberjs/ember-inspector/pull/1025) ([nummi](https://github.com/nummi))
- Tidy up object inspector [\#1024](https://github.com/emberjs/ember-inspector/pull/1024) ([nummi](https://github.com/nummi))

**Merged pull requests:**

- Remove unused code [\#1061](https://github.com/emberjs/ember-inspector/pull/1061) ([chancancode](https://github.com/chancancode))
- More dependencies upgrade [\#1058](https://github.com/emberjs/ember-inspector/pull/1058) ([chancancode](https://github.com/chancancode))
- Bump dependencies [\#1057](https://github.com/emberjs/ember-inspector/pull/1057) ([chancancode](https://github.com/chancancode))
- Performance improvements [\#1051](https://github.com/emberjs/ember-inspector/pull/1051) ([patricklx](https://github.com/patricklx))
- fix glimmer tree [\#1050](https://github.com/emberjs/ember-inspector/pull/1050) ([patricklx](https://github.com/patricklx))
- Use "::" instead of  "/" when displaying component names [\#1048](https://github.com/emberjs/ember-inspector/pull/1048) ([camerondubas](https://github.com/camerondubas))
- \<LinkTo\> [\#1045](https://github.com/emberjs/ember-inspector/pull/1045) ([nummi](https://github.com/nummi))
- Github Issue Template [\#1042](https://github.com/emberjs/ember-inspector/pull/1042) ([nummi](https://github.com/nummi))
- Update deps and travis dist to hopefully fix build [\#1029](https://github.com/emberjs/ember-inspector/pull/1029) ([rwwagner90](https://github.com/rwwagner90))
- Ignore dashes in search [\#1023](https://github.com/emberjs/ember-inspector/pull/1023) ([nummi](https://github.com/nummi))
- Modernize UI Components [\#1022](https://github.com/emberjs/ember-inspector/pull/1022) ([nummi](https://github.com/nummi))
- Bump minor version to 3.12.0 [\#1018](https://github.com/emberjs/ember-inspector/pull/1018) ([rwwagner90](https://github.com/rwwagner90))
- 3.11 Changelog [\#1017](https://github.com/emberjs/ember-inspector/pull/1017) ([rwwagner90](https://github.com/rwwagner90))

## [v3.11.0](https://github.com/emberjs/ember-inspector/tree/v3.11.0) (2019-08-30)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.10.0...v3.11.0)

**Implemented enhancements:**

- Use Travis for S3 Uploads [\#965](https://github.com/emberjs/ember-inspector/issues/965)
- Modernize Info Tab [\#1014](https://github.com/emberjs/ember-inspector/pull/1014) ([nummi](https://github.com/nummi))
- Bump some deps [\#1010](https://github.com/emberjs/ember-inspector/pull/1010) ([rwwagner90](https://github.com/rwwagner90))
- Ember 3.12 [\#1008](https://github.com/emberjs/ember-inspector/pull/1008) ([nummi](https://github.com/nummi))
- Add ES6 Class support [\#1006](https://github.com/emberjs/ember-inspector/pull/1006) ([patricklx](https://github.com/patricklx))
- Upgrade to Ember Table 2.1.0 [\#1003](https://github.com/emberjs/ember-inspector/pull/1003) ([mixonic](https://github.com/mixonic))
- Move queue to ProfileManager [\#997](https://github.com/emberjs/ember-inspector/pull/997) ([rwwagner90](https://github.com/rwwagner90))
- Component Tree: Angle Brackets and Classified Names [\#992](https://github.com/emberjs/ember-inspector/pull/992) ([nummi](https://github.com/nummi))
- Remove glimmer 2 checks [\#990](https://github.com/emberjs/ember-inspector/pull/990) ([rwwagner90](https://github.com/rwwagner90))
- Add CodeClimate code coverage reporting [\#989](https://github.com/emberjs/ember-inspector/pull/989) ([rwwagner90](https://github.com/rwwagner90))
- Start removing Ember \< 3.4 cruft [\#987](https://github.com/emberjs/ember-inspector/pull/987) ([rwwagner90](https://github.com/rwwagner90))
- Highlight children of selected component [\#984](https://github.com/emberjs/ember-inspector/pull/984) ([nummi](https://github.com/nummi))
- Drop support for Ember versions \< 3.4.0 in master [\#983](https://github.com/emberjs/ember-inspector/pull/983) ([teddyzeenny](https://github.com/teddyzeenny))
- Remove View Tree [\#941](https://github.com/emberjs/ember-inspector/pull/941) ([nummi](https://github.com/nummi))
- x-list -\> list angle bracket component [\#918](https://github.com/emberjs/ember-inspector/pull/918) ([rwwagner90](https://github.com/rwwagner90))

**Fixed bugs:**

- ember inspector fails to inspect certain components [\#999](https://github.com/emberjs/ember-inspector/issues/999)
- Ember-data 3.7 + Pure Class models \(properties inspector issue\) [\#943](https://github.com/emberjs/ember-inspector/issues/943)
- Decorated model properties don't show in object-inspector column [\#903](https://github.com/emberjs/ember-inspector/issues/903)
- Use descriptorForDecorator || descriptorForProperty [\#1002](https://github.com/emberjs/ember-inspector/pull/1002) ([AbhinavVishak](https://github.com/AbhinavVishak))

**Closed issues:**

- Cannot read property 'reopen' of undefined [\#1004](https://github.com/emberjs/ember-inspector/issues/1004)

**Merged pull requests:**

- Modernize Route Tab [\#1016](https://github.com/emberjs/ember-inspector/pull/1016) ([nummi](https://github.com/nummi))
- Fix lint, bump deps [\#1015](https://github.com/emberjs/ember-inspector/pull/1015) ([rwwagner90](https://github.com/rwwagner90))
- Fix beta and canary [\#1013](https://github.com/emberjs/ember-inspector/pull/1013) ([rwwagner90](https://github.com/rwwagner90))
- Modernize Syntax: Component Tree [\#1011](https://github.com/emberjs/ember-inspector/pull/1011) ([nummi](https://github.com/nummi))
- Guard against reading a property on undefined, fixes \#1004 [\#1005](https://github.com/emberjs/ember-inspector/pull/1005) ([lolmaus](https://github.com/lolmaus))
- 3.11 [\#1000](https://github.com/emberjs/ember-inspector/pull/1000) ([nummi](https://github.com/nummi))
- Refactor render debug [\#996](https://github.com/emberjs/ember-inspector/pull/996) ([rwwagner90](https://github.com/rwwagner90))
- Convert ProfileManager to class, cleanup [\#994](https://github.com/emberjs/ember-inspector/pull/994) ([rwwagner90](https://github.com/rwwagner90))
- Update a bunch of deps [\#993](https://github.com/emberjs/ember-inspector/pull/993) ([rwwagner90](https://github.com/rwwagner90))
- Enable 3 template lint rules and fix templates [\#991](https://github.com/emberjs/ember-inspector/pull/991) ([rwwagner90](https://github.com/rwwagner90))
- Remove custom linting rules [\#986](https://github.com/emberjs/ember-inspector/pull/986) ([rwwagner90](https://github.com/rwwagner90))
- Only test 3.4+ in travis [\#985](https://github.com/emberjs/ember-inspector/pull/985) ([rwwagner90](https://github.com/rwwagner90))

## [v3.10.0](https://github.com/emberjs/ember-inspector/tree/v3.10.0) (2019-06-06)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.9.0...v3.10.0)

**Implemented enhancements:**

- Increase size of click area of component tree disclosure triangle [\#981](https://github.com/emberjs/ember-inspector/pull/981) ([nummi](https://github.com/nummi))

**Fixed bugs:**

- accessing currentPath from application controller has been deprecated [\#973](https://github.com/emberjs/ember-inspector/issues/973)
- Fix hover colors of selected component [\#980](https://github.com/emberjs/ember-inspector/pull/980) ([nummi](https://github.com/nummi))

**Merged pull requests:**

- Update README instructions to lock an Ember version range [\#982](https://github.com/emberjs/ember-inspector/pull/982) ([teddyzeenny](https://github.com/teddyzeenny))
- 3.9 Changelog [\#978](https://github.com/emberjs/ember-inspector/pull/978) ([rwwagner90](https://github.com/rwwagner90))
- Bump minor version to 3.10 [\#977](https://github.com/emberjs/ember-inspector/pull/977) ([rwwagner90](https://github.com/rwwagner90))

## [v3.9.0](https://github.com/emberjs/ember-inspector/tree/v3.9.0) (2019-05-26)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.8.0...v3.9.0)

**Implemented enhancements:**

- Ember 3.10 [\#974](https://github.com/emberjs/ember-inspector/pull/974) ([rwwagner90](https://github.com/rwwagner90))

**Fixed bugs:**

- access -\> acl [\#976](https://github.com/emberjs/ember-inspector/pull/976) ([rwwagner90](https://github.com/rwwagner90))
- Use router.currentPath instead of applicationController [\#975](https://github.com/emberjs/ember-inspector/pull/975) ([rwwagner90](https://github.com/rwwagner90))

**Merged pull requests:**

- Bump version to 3.9.0 [\#971](https://github.com/emberjs/ember-inspector/pull/971) ([rwwagner90](https://github.com/rwwagner90))
- Update CHANGELOG.md [\#970](https://github.com/emberjs/ember-inspector/pull/970) ([rwwagner90](https://github.com/rwwagner90))

## [v3.8.0](https://github.com/emberjs/ember-inspector/tree/v3.8.0) (2019-05-09)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.7.0...v3.8.0)

**Implemented enhancements:**

- Remove grunt for compress tasks [\#958](https://github.com/emberjs/ember-inspector/issues/958)
- Add encrypted S3 keys in Travis [\#968](https://github.com/emberjs/ember-inspector/pull/968) ([rwwagner90](https://github.com/rwwagner90))
- Use isComputed when available [\#966](https://github.com/emberjs/ember-inspector/pull/966) ([rwwagner90](https://github.com/rwwagner90))
- Replace grunt with gulp [\#964](https://github.com/emberjs/ember-inspector/pull/964) ([KamiKillertO](https://github.com/KamiKillertO))
- Add back support for multiple apps [\#930](https://github.com/emberjs/ember-inspector/pull/930) ([rwwagner90](https://github.com/rwwagner90))

**Merged pull requests:**

- Use Travis for S3 Uploads [\#967](https://github.com/emberjs/ember-inspector/pull/967) ([KamiKillertO](https://github.com/KamiKillertO))
- Update minor version to 3.8.0 [\#963](https://github.com/emberjs/ember-inspector/pull/963) ([rwwagner90](https://github.com/rwwagner90))

## [v3.7.0](https://github.com/emberjs/ember-inspector/tree/v3.7.0) (2019-04-23)

[Full Changelog](https://github.com/emberjs/ember-inspector/compare/v3.6.0...v3.7.0)

**Implemented enhancements:**

- Bump some deps, fix stylelint issues [\#960](https://github.com/emberjs/ember-inspector/pull/960) ([rwwagner90](https://github.com/rwwagner90))
- Update Ember and CLI, bump deps, fix some deprecations, general cleanup [\#955](https://github.com/emberjs/ember-inspector/pull/955) ([rwwagner90](https://github.com/rwwagner90))
- Remove usage of chainable functions .readOnly\(\) [\#951](https://github.com/emberjs/ember-inspector/pull/951) ([gabz75](https://github.com/gabz75))
- UI Components Add-On [\#942](https://github.com/emberjs/ember-inspector/pull/942) ([nummi](https://github.com/nummi))
- Default theme for bookmarklet and tests [\#939](https://github.com/emberjs/ember-inspector/pull/939) ([nummi](https://github.com/nummi))
- Simplify layout of Routes Tree [\#938](https://github.com/emberjs/ember-inspector/pull/938) ([nummi](https://github.com/nummi))
- Remove "info" nav title [\#935](https://github.com/emberjs/ember-inspector/pull/935) ([nlfurniss](https://github.com/nlfurniss))
- alt/option click to toggle children in component tree [\#925](https://github.com/emberjs/ember-inspector/pull/925) ([nummi](https://github.com/nummi))

**Fixed bugs:**

- Editing an attributes adds quotes to the value [\#952](https://github.com/emberjs/ember-inspector/issues/952)
- Setting dependency keys using the `.property\(\)` modifier has been deprecated [\#944](https://github.com/emberjs/ember-inspector/issues/944)
- \[v3.5\] No longer detects my ember-app [\#927](https://github.com/emberjs/ember-inspector/issues/927)
- Ensure we do not add quotes twice to strings when edited [\#954](https://github.com/emberjs/ember-inspector/pull/954) ([rwwagner90](https://github.com/rwwagner90))
- Fix setting \_channel by moving before super call [\#953](https://github.com/emberjs/ember-inspector/pull/953) ([rwwagner90](https://github.com/rwwagner90))
- Remove usage of .property\(\) syntax for setting CP keys [\#948](https://github.com/emberjs/ember-inspector/pull/948) ([gabz75](https://github.com/gabz75))
- Fix Error Page Console Error [\#945](https://github.com/emberjs/ember-inspector/pull/945) ([nummi](https://github.com/nummi))

**Closed issues:**

- Remove usage of .readOnly\(\) [\#950](https://github.com/emberjs/ember-inspector/issues/950)
- Ember inspector crashes in Data tab [\#946](https://github.com/emberjs/ember-inspector/issues/946)
- Removal of View Tab [\#923](https://github.com/emberjs/ember-inspector/issues/923)
- routeHandler.get is not a function [\#895](https://github.com/emberjs/ember-inspector/issues/895)
- Problems with ember-cli-deprecation-workflow [\#857](https://github.com/emberjs/ember-inspector/issues/857)

**Merged pull requests:**

- Bubble up deprecations for ember-deprecation-workflow \(\#857\) [\#949](https://github.com/emberjs/ember-inspector/pull/949) ([robustdj](https://github.com/robustdj))
- Bump minor version to 3.7.0 [\#934](https://github.com/emberjs/ember-inspector/pull/934) ([rwwagner90](https://github.com/rwwagner90))
- Changelog for 3.6 [\#933](https://github.com/emberjs/ember-inspector/pull/933) ([rwwagner90](https://github.com/rwwagner90))

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

## Ember Inspector 2.3.1

* [INTERNAL] Remove unsafe-eval from csp [#737](https://github.com/emberjs/ember-inspector/pull/737)

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
