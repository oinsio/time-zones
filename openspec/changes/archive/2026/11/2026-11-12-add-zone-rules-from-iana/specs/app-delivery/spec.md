# Spec Delta

## MODIFIED Requirements

### Requirement: Checks on every pull request
Every pull request SHALL run lint, typecheck, unit tests, the production build with the bundle size budget, and the smoke E2E scenarios. Any failing step MUST fail the check. The result of the unit tests MUST NOT depend on the speed or load of the runner: no unit test may compare a measured duration with a limit. Every pull request MUST also run the timing benchmark in a separate job that reports the median of each timed operation and warns about every median above its budget, and that job MUST NOT fail the check. The check MUST also fail when the built JavaScript does not parse at the Safari 12 level or uses a regular-expression lookbehind, when the built CSS contains an `inset` shorthand or a `dvh` height without a preceding `vh` fallback in the same rule, or when production sources contain BigInt. The check MUST also run the zone rules check against `zdump -v` and fail on one difference, and MUST fail when the zone rules asset exceeds its gzipped budget. <!-- implements FR12, NFR-P1 of setup-app-shell-and-pages-deploy; FR6, FR7, FR8 of replace-wall-clock-row-budgets-with-deterministic-checks; FR13 of support-legacy-ios-12-safari; FR8, NFR-P1 of add-zone-rules-from-iana -->

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

#### Scenario: Zone rules differ from zdump
- **WHEN** a pull request changes the committed zone rules release so that one zone's offset differs from `zdump -v` at a clock change
- **THEN** the pull request check is reported as failed and names the zone

#### Scenario: Zone rules asset exceeds its budget
- **WHEN** the zone rules asset of the build exceeds its gzipped budget
- **THEN** the build check fails and reports the actual size
