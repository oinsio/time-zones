# Fix the date-change row budget measurement

## Why

The CI unit suite (`pnpm test` → `vitest run`) fails on the unit BDD scenario "50 rows within the budget" of `packages/client/src/test/features/date_selection/date_selection_reference_moment_rows.feature`: `expected 71.43615600000021 to be less than or equal to 50`. The scenario implements NFR-P1 of the archived `select-date-with-calendar-and-now` ("A date change re-presents 50 location rows in at most 50 ms, synchronously, with no loading state"), stable spec `openspec/specs/date-selection/spec.md`, requirement "Date changes are fast".

Its step definition (`steps/date_selection_reference_moment_rows.steps.tsx`, step "When the user moves to the next day") wraps `performance.now()` around `act(() => world.getReference().showNextDay())`, so the 50 ms covers a full React commit of 50 `<li>` rows into jsdom. On a shared CI runner that cost depends on the machine's load, not on the app. It measures jsdom, not the app's work. Every other 50-row budget in the suite times the model and presenter work and nothing else: `locations_reorder_unit.steps.ts` ("50 locations within the budget": `reduceLocations` + `presentLocationRows`), `locations_local_time_unit.steps.tsx` and `locations_device_time_zone_unit.steps.tsx` (`presentLocationRows`). Until this is fixed, the build on `main` stays red and every PR is blocked.

Audience: every contributor (red CI) and, indirectly, every user, because the performance budget only protects them if the measurement is stable.

## What Changes

- MODIFIED: the requirement "Date changes are fast" of `date-selection` now states what the 50 ms budget covers: working out the new reference moment for the next day and re-presenting the 50 rows (time, date, offset, badge labels). Rendering into a document is not part of the budget. The rows still show the new date in the same render as the date change, with no loading state.
- MODIFIED: the scenario "50 rows within the budget" times the date change plus the re-presentation of 50 rows that were already presented once (as they are while the app is open), and checks every presented row carries the new date.
- ADDED: the scenario "The new date shows in the same render" checks, without timing, that after moving to the next day with 50 locations the rendered rows show the new date at once, with no loading state.
- No production code, stored data, dependency or configuration changes. The fix is in the feature file and its step definitions.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `date-selection`: modifies the requirement "Date changes are fast". The budget is now scoped to computing the new moment and re-presenting the rows, and a scenario is added for the same-render update.

## Impact

- `packages/client/src/test/features/date_selection/date_selection_reference_moment_rows.feature` (scenario "50 rows within the budget" reworded, scenario "The new date shows in the same render" added).
- `packages/client/src/test/features/date_selection/steps/date_selection_reference_moment_rows.steps.tsx` (step definitions for both scenarios).
- Nothing under `src/model/`, `src/presenter/`, `src/controller/` or `src/views/` changes. No new dependencies, no storage schema change, no network.

## Goals

- G1: The unit suite passes on CI again. The NFR-P1 scenario fails only when the app's own date-change work is slower than 50 ms, not when jsdom or the runner is slow.
- G2: NFR-P1 of `select-date-with-calendar-and-now` stays covered: a 50 ms budget on 50 rows and a check that the update is synchronous with no loading state.

## Non-Goals

- NG1: Speeding up rendering, the presenter or the reducer. The production code already meets the budget. Only the measurement is wrong.
- NG2: Raising the 50 ms budget, adding retries to Vitest, or skipping the scenario on CI.
- NG3: Changing the other 50-row budget scenarios (`locations_*_unit`, `locations_reorder_unit`, `location_search_performance`). They already time code without a jsdom render: model and presenter work for the `locations_*` budgets, the city-search adapter for `location_search_performance`.
- NG4: A real-browser (Playwright) timing of the date change.

## Users & Scenarios

- U1: A contributor opens a PR. CI runs `pnpm test`, and the date-selection budget scenario passes on a loaded runner as long as the reducer and presenter stay within 50 ms for 50 rows.
- U2: A contributor makes the presenter much slower (for example, a new `Intl.DateTimeFormat` per row per call). The budget scenario fails and names the 50 ms budget.
- U3: A user with 50 locations moves to the next day, and every row shows the new date at once, with no spinner.

## Requirements

### Functional

- FR1: After the user moves to the next day with 50 locations in the list, the rendered rows show the new date in the same render as the date change, with no loading state. This check is untimed.

### Non-Functional

#### Performance

- NFR-P1: Working out the next day's reference moment and re-presenting 50 location rows that were already presented once takes at most 50 ms, measured with `performance.now()` in unit BDD. Every presented row carries its local date at the new moment.

#### Accessibility

_None. No markup changes._

#### Responsive

_None. No layout changes._

## UX Acceptance Criteria

- UX1: Moving to the next day never shows a loading state, whatever the number of rows (as today; FR1 keeps it under test).

## UI States Matrix

The location list's states do not change. This change only re-scopes how one of them (data present, after a date change) is tested.

| Network | Data | UI |
|---|---|---|
| any (client-only) | list loading | unchanged; a date change is not possible before the list loads |
| any | list failed to load | unchanged recovery state; no rows to re-present |
| any | empty list | unchanged empty state; a date change presents 0 rows |
| offline | 50 locations, date moved | the rows show the new date in the same render, no loading state (FR1, UX1). Nothing here uses the network. |
| online | 50 locations, date moved | same as offline (FR1, UX1); re-presentation within 50 ms (NFR-P1) |

## Behavior

- `packages/client/src/test/features/date_selection/date_selection_reference_moment_rows.feature`: scenarios tagged `@fix-date-change-row-budget-measurement` (NFR-P1, FR1, UX1). They keep their `@select-date-with-calendar-and-now @NFR-P1` tags so the archived change's traceability stays intact.

## Affected IA

No changes.

## Success Metrics

- M1: `npx vitest run src/test/features/date_selection/steps/date_selection_reference_moment_rows.steps.tsx` passes 5 runs out of 5 in a row locally, and the full `pnpm test` CI job passes with 0 failed tests.
- M2: 100% of FR1, NFR-P1 and UX1 appear on at least one line under `packages/client/src/` that also names `fix-date-change-row-budget-measurement`.
- M3: The budget scenario still detects a slow presenter: with 60 ms of artificial delay inside the timed block, it fails. This is a one-off red check during implementation, reverted afterwards.
- M4: 0 files changed under `packages/client/src/model/`, `presenter/`, `controller/` and `views/`.

## Open Questions

_None._
