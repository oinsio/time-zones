# browser-compatibility Specification

## Purpose
Which browser engines the application supports, and how it starts and degrades on the oldest supported one (iOS Safari 12.5), so that old phones and tablets can still run it.

## Requirements

### Requirement: Supported engines
The application SHALL support the latest Chrome, Firefox, Edge and Safari, and iOS Safari 12.5. On iOS Safari 12.5 the production build MUST start with no syntax error and no missing built-in, and MUST show the main page. Engines older than iOS Safari 12.5, and engines without ES modules, are not supported. <!-- implements FR1 of support-legacy-ios-12-safari -->

#### Scenario: Built code parses at the oldest supported level
- **WHEN** the built JavaScript of the production build is checked against the Safari 12 language level
- **THEN** every file parses
- **AND** no file contains a regular-expression lookbehind

#### Scenario: Main page renders on a legacy engine
- **GIVEN** the environment lacks `Intl.DisplayNames`, `ResizeObserver`, Pointer Events and `MediaQueryList.addEventListener`
- **AND** the list contains Almaty and Moscow
- **WHEN** the app starts
- **THEN** the main page shows the Almaty and Moscow cards with their times
- **AND** no error is thrown

### Requirement: Polyfills only where needed
Built-ins missing on a legacy engine SHALL be installed before any application module or library runs. An engine that has every required built-in MUST NOT download the polyfills. The polyfills MUST NOT count towards the initial JavaScript budget. A legacy engine is recognised by its missing built-ins only; the state of the engine's zone data plays no part, because the zone rules of the app replace it on every engine. <!-- implements FR2, NFR-P1, NFR-P2 of support-legacy-ios-12-safari; FR5 of add-zone-rules-from-iana -->

#### Scenario: Modern engine skips the polyfills
- **GIVEN** the engine has every required built-in
- **WHEN** the app starts
- **THEN** the polyfills are not requested
- **AND** the app starts

#### Scenario: Legacy engine installs the polyfills first
- **GIVEN** the engine lacks `Array.prototype.at`
- **WHEN** the app starts
- **THEN** the polyfills are installed before the app modules are loaded
- **AND** `Array.prototype.at` works in the app

#### Scenario: Initial JavaScript stays in budget
- **WHEN** the production build is measured
- **THEN** its initial JavaScript is at most 150 KB gzipped
- **AND** the polyfills are not part of it

#### Scenario: Outdated zone data alone needs no polyfills
- **GIVEN** the engine has every required built-in
- **AND** the engine rejects `Europe/Kyiv`
- **WHEN** the app starts
- **THEN** the polyfills are not requested
- **AND** Kyiv shows its time from the zone rules

### Requirement: No BigInt at run time
Production code SHALL NOT create, read or compare BigInt values at run time. That covers BigInt literals, the `BigInt` function and the nanosecond values of an instant (`epochNanoseconds`). Instants MUST be compared and measured in milliseconds. <!-- implements FR3 of support-legacy-ios-12-safari -->

#### Scenario: Sources contain no BigInt
- **WHEN** the production sources are searched for BigInt literals, `BigInt(` and `epochNanoseconds`
- **THEN** none is found

#### Scenario: Zone checks work without BigInt
- **GIVEN** the environment has no `BigInt`
- **WHEN** the zone `Asia/Almaty` is checked and its day-period colours are computed for `2026-03-08`
- **THEN** the zone is accepted
- **AND** the colour stops equal those computed with `BigInt` present

### Requirement: Missing country names
On an engine without `Intl.DisplayNames`, presenting a country SHALL yield an empty name and MUST NOT throw. Rows and search results MUST show no separator or placeholder where the country name would be. <!-- implements FR5, UX3 of support-legacy-ios-12-safari -->

#### Scenario: Rows without country names
- **GIVEN** the environment has no `Intl.DisplayNames`
- **AND** the list contains Almaty
- **WHEN** the rows are presented
- **THEN** the Almaty row has an empty country name
- **AND** no error is thrown

#### Scenario: Search results without country names
- **GIVEN** the environment has no `Intl.DisplayNames`
- **WHEN** the user searches for "Almaty"
- **THEN** Almaty is among the results with an empty country name

### Requirement: Width measurement on legacy engines
On an engine without `ResizeObserver`, a polyfill SHALL make a `ResizeObserver` available to the app before any application module runs, and the app MUST start on the chosen view as on modern engines. The view is never chosen by width. <!-- implements FR6 of support-legacy-ios-12-safari; FR6 of add-view-mode-setting-and-grid-skeleton -->

#### Scenario: View selection without ResizeObserver
- **GIVEN** the environment has no native `ResizeObserver`
- **WHEN** the app starts
- **THEN** a `ResizeObserver` is available to the app
- **AND** the Cards view is shown

### Requirement: Reduced motion on legacy engines
On an engine whose `MediaQueryList` lacks `addEventListener`, the reduced-motion preference SHALL be read, and its changes followed through `addListener` and `removeListener`. <!-- implements FR7 of support-legacy-ios-12-safari -->

#### Scenario: Preference followed through addListener
- **GIVEN** the reduced-motion `MediaQueryList` has `addListener` but no `addEventListener`
- **AND** the preference is off
- **WHEN** the preference turns on
- **THEN** the app treats motion as reduced

#### Scenario: Listener removed on unmount
- **GIVEN** the reduced-motion `MediaQueryList` has `addListener` but no `addEventListener`
- **WHEN** the component that reads the preference unmounts
- **THEN** its listener is removed with `removeListener`

### Requirement: Layout fallbacks for legacy CSS
The built CSS SHALL express every `inset` utility through `top`, `right`, `bottom` and `left`. Every `dvh` height MUST be preceded by a `vh` fallback in the same rule. Modern engines MUST render as before. <!-- implements FR12, NFR-R1 of support-legacy-ios-12-safari -->

#### Scenario: No inset shorthand in the build
- **WHEN** the built CSS is searched for `inset:` declarations
- **THEN** none is found

#### Scenario: Full height has a fallback
- **WHEN** the built CSS rule for the full-height utility is read
- **THEN** it declares a `vh` height before the `dvh` height

#### Scenario: Modern screenshots unchanged
- **WHEN** the screenshot tests run in `chromium` and `mobile-chrome`
- **THEN** every approved baseline passes without being updated

### Requirement: Accessibility of the legacy fallbacks
The main page and the search dialog SHALL have no accessibility violations in modern engines, and MUST have none when Pointer Events are absent and the input fallbacks are active. <!-- implements NFR-A1 of support-legacy-ios-12-safari -->

#### Scenario: No accessibility violations without Pointer Events
- **GIVEN** the engine has no Pointer Events
- **WHEN** the main page is shown and the search dialog is opened
- **THEN** an accessibility check reports no violations on the main page
- **AND** an accessibility check reports no violations in the search dialog
