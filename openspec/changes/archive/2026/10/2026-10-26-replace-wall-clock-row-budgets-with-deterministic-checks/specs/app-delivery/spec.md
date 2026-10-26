## MODIFIED Requirements

### Requirement: Checks on every pull request
Every pull request SHALL run lint, typecheck, unit tests, the production build with the bundle size budget, and the smoke E2E scenarios. Any failing step MUST fail the check. The result of the unit tests MUST NOT depend on the speed or load of the runner: no unit test may compare a measured duration with a limit. Every pull request MUST also run the timing benchmark in a separate job that reports the median of each timed operation and warns about every median above its budget, and that job MUST NOT fail the check. <!-- implements FR12, NFR-P1 of setup-app-shell-and-pages-deploy; FR6, FR7, FR8 of replace-wall-clock-row-budgets-with-deterministic-checks -->

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
