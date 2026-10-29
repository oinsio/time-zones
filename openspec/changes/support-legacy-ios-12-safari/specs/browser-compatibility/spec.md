# Spec Delta

## Purpose

Which browser engines the application supports, and how it starts and degrades on the oldest supported one (iOS Safari 12.5), so that old phones and tablets can still run it.

## ADDED Requirements

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
Built-ins missing on a legacy engine SHALL be installed before any application module or library runs. An engine that has every required built-in MUST NOT download the polyfills. The polyfills MUST NOT count towards the initial JavaScript budget. <!-- implements FR2, NFR-P1, NFR-P2 of support-legacy-ios-12-safari -->

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

### Requirement: No BigInt at run time
Production code SHALL NOT create, read or compare BigInt values at run time. That covers BigInt literals, the `BigInt` function and nanosecond epoch values. Instants MUST be compared and measured in milliseconds. <!-- implements FR3 of support-legacy-ios-12-safari -->

#### Scenario: Sources contain no BigInt
- **WHEN** the production sources are searched for BigInt literals, `BigInt(` and `epochNanoseconds`
- **THEN** none is found

#### Scenario: Zone checks work without BigInt
- **GIVEN** the environment has no `BigInt`
- **WHEN** the zone `Asia/Almaty` is checked and its day-period colours are computed for `2026-03-08`
- **THEN** the zone is accepted
- **AND** the colour stops equal those computed with `BigInt` present

### Requirement: Renamed zones on outdated zone data
When the engine rejects a canonical IANA zone but accepts one of its legacy names, every date and time operation on that zone SHALL use the legacy name, including resolving a wall-clock time with an explicit disambiguation. Stored and compared identifiers MUST stay canonical. A zone the engine rejects under every name MUST behave as an unknown zone. <!-- implements FR4 of support-legacy-ios-12-safari -->

#### Scenario: Adding a renamed zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **WHEN** the user adds Kyiv with the zone `Europe/Kyiv`
- **THEN** the location is added with the zone `Europe/Kyiv`
- **AND** the stored list holds `Europe/Kyiv`

#### Scenario: A renamed zone shows its time
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **AND** the stored list contains Kyiv with the zone `Europe/Kyiv`
- **AND** the current instant is `2026-03-08T07:30:00Z`
- **WHEN** the app starts
- **THEN** the Kyiv card shows `09:30` and `UTC+2`
- **AND** the stored list is read without error

#### Scenario: A wall-clock time in a renamed zone
- **GIVEN** the engine rejects `Europe/Kyiv` and accepts `Europe/Kiev`
- **WHEN** the wall-clock time `<wall clock>` in `Europe/Kyiv` is resolved
- **THEN** it resolves to `<instant>` with the status `<status>`

| wall clock | instant | status |
|---|---|---|
| `2026-03-08T10:00` | `2026-03-08T08:00:00Z` | `UNIQUE` |
| `2026-03-29T03:30` | `2026-03-29T01:30:00Z` | `GAP` |
| `2026-10-25T03:30` | `2026-10-25T00:30:00Z` | `AMBIGUOUS` |

#### Scenario: A zone rejected under every name
- **GIVEN** the engine rejects `America/Ciudad_Juarez` and has no legacy name for it
- **WHEN** a location with that zone is added
- **THEN** the location is rejected as an unknown time zone

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
On an engine without `ResizeObserver`, container widths SHALL be measured by a polyfill, so the view that fits the width is selected as on modern engines. <!-- implements FR6 of support-legacy-ios-12-safari -->

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
