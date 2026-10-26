# Replace wall-clock row budgets with deterministic checks

## Why

The PR check of `add-time-sliders-to-location-cards` fails in `pnpm test` on GitHub Actions. Three unit BDD scenarios that time the app's work with `performance.now()` miss their 50 ms limit: `date_selection_reference_moment_rows` 114 ms, `time_selection_day_track` 118 ms, `locations_local_time_unit` 52 ms. The same work takes about 22 ms on a developer machine, measured on that change's HEAD. The scenarios measure the runner, not the app: `ubuntu-latest` has few cores and `vitest run` runs 136 test files in parallel, so one wall-clock sample swings 5× with load. `fix-date-change-row-budget-measurement` already moved one of these budgets off jsdom rendering, and it is red again one change later.

There are seven such scenarios in unit BDD, plus the search query timing:

| Feature file (`packages/client/src/test/features/`) | Scenario | Change it came from |
|---|---|---|
| `locations/locations_local_time_unit.feature` | 50 rows within the budget | `show-local-time-and-date-on-location-cards` NFR-P1 |
| `locations/locations_utc_offset_unit.feature` | 50 rows within the budget | `show-utc-offset-on-location-rows` NFR-P1 |
| `locations/locations_device_time_zone_unit.feature` | 50 rows within the budget | `mark-device-time-zone-in-location-list` NFR-P1 |
| `locations/locations_reorder_unit.feature` | 50 locations within the budget | `reorder-locations-by-drag-and-drop` NFR-P1 |
| `date_selection/date_selection_reference_moment_rows.feature` | 50 rows within the budget | `select-date-with-calendar-and-now` NFR-P1, `fix-date-change-row-budget-measurement` NFR-P1 |
| `time_selection/time_selection_moment.feature` | 50 rows within the time-selection budget | `add-time-sliders-to-location-cards` NFR-P1 |
| `time_selection/time_selection_day_track.feature` | 50 tracks within the date-change budget | `add-time-sliders-to-location-cards` NFR-P2 |
| `location_search/location_search_performance.feature` | Query timing | `add-locations-via-search` NFR-P1 |

The real risks that the budgets guard against can be counted exactly: a date-time formatter built per row per call, colour stops recomputed on every presenting, every record normalized per query. A count does not depend on the runner. Building an Intl formatter is the costliest step in presenting a row. While checking this, we found one real case of it: `formatLocalTime` and `formatLocalDate` call `Temporal.ZonedDateTime.prototype.toLocaleString`, which in `temporal-polyfill` builds a new `Intl.DateTimeFormat` on every call, so 100 builds per presenting of 50 rows.

Audience: every contributor (a red PR check blocks every merge) and every user (the budgets only protect them while they catch real regressions).

## What Changes

- MODIFIED: every unit BDD scenario in the table above stops asserting elapsed time. It asserts work bounds instead: how many `Intl.DateTimeFormat`, `Intl.DisplayNames` and `Intl.Collator` objects are built, how many time zone transitions are looked up, how many strings are normalized. The 50 ms product budgets stay in the specs, with the same values.
- MODIFIED: local time and local date labels are formatted with cached `Intl.DateTimeFormat` objects, one per language, zone and label kind, shared with the hour labels of the day track. They are no longer formatted through `ZonedDateTime.toLocaleString`. The labels do not change.
- ADDED: a benchmark suite (`pnpm bench`) times the same eight operations with warm-up and repeated samples. It compares each median with the 50 ms budget and reports misses as warnings. It runs in its own CI job, which never fails the PR check.
- MODIFIED: the PR check runs that benchmark job alongside the existing steps. A budget miss shows as a warning. The unit test step stays deterministic.
- MODIFIED: `.claude/rules/test-planning.md` and `.claude/rules/bdd-unit.md` no longer recommend `performance.now()` in unit BDD. It points NFR-P work to deterministic work bounds (blocking) plus a benchmark (non-blocking). The global decision is recorded as `docs/adr/0008-performance-budgets-as-work-bounds.md`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `locations`: the requirements "Offsets are fast, accessible and fit every screen", "Reorder is accessible and fits every screen", "Device time zone badge is accessible and fits every screen" and "Local time and date are fast and accessible" replace their timed scenarios with work-bound scenarios and name the benchmark as the timing check.
- `date-selection`: the requirement "Date changes are fast" does the same.
- `time-selection`: the requirement "Time selection is fast" does the same, for selections and date changes.
- `location-search`: the requirement "Search is fast and lazy" replaces "Query timing" with a work-bound scenario.
- `app-delivery`: the requirement "Checks on every pull request" adds the non-blocking benchmark job and requires that unit test results do not depend on runner speed.

## Impact

- Production code: `packages/client/src/presenter/localDateTime.ts` and `presenter/dayTrack.ts` start using a new shared formatter cache, `presenter/dateTimeFormatters.ts`. Nothing changes in `model/`, `controller/`, `views/` or `adapters/`.
- Tests: the eight feature files above and their step definitions, plus `date_selection/steps/referenceMomentRowsWorld.ts`, `time_selection/steps/trackBudgetWorld.ts` and `location_search/steps/searchWorld.ts`. A new shared helper, `src/test/workCounters.ts`.
- New: `src/test/benchmarks/*.bench.ts`, the budget evaluation `scripts/benchBudgets.ts` and its command-line wrapper `scripts/check-bench-budgets.mjs` (both tested by `src/test/benchmarks/benchBudgets.test.ts`), the `bench` script in `packages/client/package.json`, and a `benchmark` job in `.github/workflows/ci.yml` (its shape is tested by `src/test/benchmarks/ciBenchmarkJob.test.ts`).
- Docs and rules: `.claude/rules/test-planning.md`, `.claude/rules/bdd-unit.md` (the "Performance (operation time)" row of "When to Use Unit BDD vs E2E BDD"), `docs/adr/0008-performance-budgets-as-work-bounds.md`, and the ADR list in `CLAUDE.md`.
- No new dependencies (`vitest bench` ships with Vitest 3). No storage, network or UI change.

## Goals

- G1: `pnpm test` passes or fails the same way on any runner and under any parallel load. No unit or unit BDD test compares a measured duration with a limit.
- G2: The regressions that the 50 ms budgets exist to stop still fail the PR check: formatters rebuilt per row, colour stops recomputed for an unchanged day, records normalized per query.
- G3: Real timings of the eight operations stay visible on every PR, without blocking it.

## Non-Goals

- NG1: Changing any budget value (50 ms, 50 rows, 10 queries) or any product behavior.
- NG2: Optimizing beyond the formatter cache that the new work bounds require.
- NG3: Real-browser timing (Playwright traces, Lighthouse, INP).
- NG4: Making the benchmark a blocking check, or storing benchmark history.
- NG5: Retries, skips or CI-only budget multipliers in Vitest.

## Users & Scenarios

- U1: A contributor opens a PR on a loaded runner. `pnpm test` passes because the app does the same counted work as on any machine.
- U2: A contributor adds `new Intl.DateTimeFormat(...)` inside the per-row path. The work-bound scenario of every affected feature fails and names the extra builds.
- U3: A contributor makes colour stops depend on the minute instead of the reference day. The time-selection work-bound scenario fails on the transition lookup count.
- U4: A reviewer opens the PR checks and reads the median of each of the eight operations in the benchmark job's summary. A median over 50 ms shows as a warning annotation.

## Requirements

### Functional

- FR1: Presenting 50 location rows again, in the same language, for the same reference day, builds 0 `Intl.DateTimeFormat` and 0 `Intl.DisplayNames` objects and looks up 0 time zone transitions. This holds for presenting at another minute, after a reorder and after a time selection.
- FR2: Presenting 50 rows for the first time in a language builds at most 3 `Intl.DateTimeFormat` objects per distinct time zone and at most 1 `Intl.DisplayNames` object for that language.
- FR3: A date change on 50 rows that were already presented builds 0 `Intl.DateTimeFormat` objects and looks up at most 2 time zone transitions per zone. Presenting the new day a second time looks up 0 transitions.
- FR4: Computing the results of one non-empty query over the full bundled data normalizes exactly one string, the query, and builds at most 1 `Intl.Collator`.
- FR5: Local time, local date and hour labels stay identical, character for character, in English and Russian, including zones with offsets such as `+5:30` and `+5:45` and days with an offset change.
- FR6: `pnpm --filter @time-zones/client bench` times each of the eight operations from the "Why" table with warm-up and at least 20 samples and writes their medians to a JSON report. A separate budget check reads that report, prints each median, and emits a warning (a GitHub `::warning` annotation on CI) for every median above 50 ms. Both exit with 0 whatever the medians are.
- FR7: The PR workflow runs the benchmark in a separate job that never fails the PR check. The unit test step runs no benchmark.
- FR8: No file under `packages/client/src/` outside `src/test/benchmarks/` calls `performance.now()`, so no unit test, step file or step helper (`*.test.*`, `*.steps.*`, `*World.ts`) compares a measured duration with a limit. `.claude/rules/test-planning.md`, `.claude/rules/bdd-unit.md` and ADR 0008 state this policy for future changes. No file under `.claude/rules/` recommends `performance.now()` for a test.

### Non-Functional

#### Performance

- NFR-P1: The 50 ms budgets of the earlier changes stay unchanged. FR1–FR4 are their blocking check, and FR6 is their timing check.

#### Accessibility

_None. No markup changes._

#### Responsive

_None. No layout changes._

## UX Acceptance Criteria

- UX1: Users see no difference. Labels, renders and states are identical before and after (FR5). The existing E2E and screenshot suites pass without re-approval.

## UI States Matrix

No UI state changes. This change re-scopes how the "data present" state of the location list is verified.

| Network | Data | UI |
|---|---|---|
| any (client-only) | list loading / failed / empty | unchanged |
| offline / online | 50 locations | unchanged rows. Work bounds FR1–FR3 hold, and no network is involved |
| offline / online | search open, query typed | unchanged results. Work bound FR4 holds |

## Behavior

- The eight feature files in the "Why" table: their budget scenarios are reworded and tagged `@replace-wall-clock-row-budgets-with-deterministic-checks` with the matching FR id and `@NFR-P1`. The label scenarios get `@FR5 @UX1` instead. They keep the tags of the change they came from, so earlier traceability stays intact.
- `packages/client/src/presenter/localDateTime.test.ts` and `presenter/dayTrack.test.ts`: characterization of the labels (FR5).

## Affected IA

No changes.

## Success Metrics

- M1: The CI job "Lint, test, build, E2E" passes on the PR of this change, with 0 failed tests.
- M2: `grep -rlE "performance\.now\(\)" packages/client/src --exclude-dir=benchmarks` prints nothing. Today it prints 7 files: 4 `*.steps.*` and 3 `*World.ts`.
- M3: One Stryker run is scoped to the 3 cache files whose work is counted (`src/presenter/dateTimeFormatters.ts`, `src/model/dayPeriodStops.ts`, `src/presenter/countryName.ts`) with bail disabled. In it, 100% of the mutants on the 3 cache-hit lines (the lines with `return cached…`, 1 per file) are Killed, and each one is killed by at least one test under `src/test/features/`. So turning off the formatter, colour stop or region name cache fails a work-bound scenario. The search bound (FR4) is an exact count of 1, so it fails directly on one extra normalization. The hour label cache of `dayTrack.ts` is not in M3: without it, labels are only re-formatted with cached formatters, which no work bound counts (NG2). Its timing shows in the benchmark (FR6).
- M4: 100% of FR1–FR8, NFR-P1 and UX1 appear on at least one line under `packages/client/src/`, `.github/`, `.claude/rules/` or `docs/adr/` that also names `replace-wall-clock-row-budgets-with-deterministic-checks`.
- M5: The benchmark job reports a median for all 8 operations on the PR of this change.
- M6: Stryker mutation score ≥ 95% on `src/presenter/dateTimeFormatters.ts`, `src/presenter/localDateTime.ts`, `src/presenter/dayTrack.ts` and `scripts/benchBudgets.ts` (minimum acceptable ≥ 90%).

## Open Questions

- Q1: Should the benchmark become blocking later, for example with a self-hosted runner and a median of three runs? This is out of scope here (NG4). Revisit when there is benchmark history to compare against.
