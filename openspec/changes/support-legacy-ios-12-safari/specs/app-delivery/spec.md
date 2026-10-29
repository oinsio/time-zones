# Spec Delta

## MODIFIED Requirements

### Requirement: Installable PWA
The application SHALL provide a web app manifest with name "Time Zones", short name "Time Zones", standalone display, `start_url` and `scope` equal to `/time-zones/`, theme color `#2F5BD3`, a background color equal to the light-theme background token, and icons of 192 px and 512 px including a maskable 512 px icon. The page MUST link a favicon, an Apple touch icon and the theme color. The page MUST declare itself as a home-screen web app for iOS with `<meta name="apple-mobile-web-app-capable" content="yes">`. <!-- implements FR3 of setup-app-shell-and-pages-deploy; FR11 of support-legacy-ios-12-safari -->

#### Scenario: Manifest is complete
- **WHEN** the manifest linked from the page is read
- **THEN** it contains the name, display mode, start URL, scope, theme color and the 192, 512 and maskable 512 icons

#### Scenario: Every icon is reachable
- **WHEN** each icon listed in the manifest and in the page head is requested
- **THEN** each responds successfully with an image

#### Scenario: Page declares an iOS home-screen web app
- **WHEN** the head of the built page is read
- **THEN** it contains `<meta name="apple-mobile-web-app-capable" content="yes">`

### Requirement: Checks on every pull request
Every pull request SHALL run lint, typecheck, unit tests, the production build with the bundle size budget, and the smoke E2E scenarios. Any failing step MUST fail the check. The result of the unit tests MUST NOT depend on the speed or load of the runner: no unit test may compare a measured duration with a limit. Every pull request MUST also run the timing benchmark in a separate job that reports the median of each timed operation and warns about every median above its budget, and that job MUST NOT fail the check. The check MUST also fail when the built JavaScript does not parse at the Safari 12 level or uses a regular-expression lookbehind, when the built CSS contains an `inset` shorthand or a `dvh` height without a preceding `vh` fallback in the same rule, or when production sources contain BigInt. <!-- implements FR12, NFR-P1 of setup-app-shell-and-pages-deploy; FR6, FR7, FR8 of replace-wall-clock-row-budgets-with-deterministic-checks; FR13 of support-legacy-ios-12-safari -->

#### Scenario: A check fails
- **WHEN** a pull request introduces a lint, type, test, build or budget failure
- **THEN** the pull request check is reported as failed

#### Scenario: Bundle exceeds the budget
- **WHEN** the initial JavaScript of the build exceeds 150 KB gzipped
- **THEN** the build check fails and reports the actual size

#### Scenario: A timing budget is missed
- **WHEN** the median of a timed operation in the benchmark is above its 50 ms budget
- **THEN** the benchmark job reports that median with a warning
- **AND** the pull request check is not failed by it

#### Scenario: Unit tests ignore runner speed
- **WHEN** the unit test files are searched for comparisons of a measured duration with a limit
- **THEN** none is found

#### Scenario: Built code is newer than Safari 12
- **WHEN** a pull request makes the built JavaScript use syntax Safari 12 cannot parse
- **THEN** the pull request check is reported as failed and names the file

#### Scenario: Built CSS uses the inset shorthand
- **WHEN** a pull request makes the built CSS contain an `inset:` declaration
- **THEN** the pull request check is reported as failed

#### Scenario: Built CSS uses dvh without a fallback
- **WHEN** a pull request makes a rule of the built CSS declare a `dvh` height with no `vh` value of the same property before it in that rule
- **THEN** the pull request check is reported as failed and names the file

#### Scenario: Sources use BigInt
- **WHEN** a pull request adds a BigInt literal, `BigInt(` or `epochNanoseconds` to production sources
- **THEN** the pull request check is reported as failed
