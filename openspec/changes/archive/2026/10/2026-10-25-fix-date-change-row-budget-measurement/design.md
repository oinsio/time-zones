# Design: Fix the date-change row budget measurement

## Context

Driven by NFR-P1, FR1 and UX1 of `proposal.md` (see proposal.md, Why). Current state, checked in `packages/client/src/`:

- `test/features/date_selection/steps/date_selection_reference_moment_rows.steps.tsx` (137 lines), scenario "50 rows within the budget":
  - Given: stores the first 50 zones of `Intl.supportedValuesOf("timeZone")` through `world.setStoredLocations`.
  - When: times `act(() => world.getReference().showNextDay())` with `performance.now()`.
  - Then: checks the first zone's row `<time datetime>` and `elapsedMs <= ROW_BUDGET_MS` (50).
  - The timed block therefore includes the React commit of 50 rows into jsdom.
- `controller/useReferenceMoment.ts`: `showNextDay` dispatches `{ type: LocationCommandType.SHIFT_DATE, days: ONE_DAY, now }` to the store. `controller/useLocations.ts` then re-presents the rows with `presentLocationRows(locations, { instant: getEffectiveInstant(state, clock.instant()), … })`.
- `model/index.ts` exports `reduceLocations`, `INITIAL_LOCATIONS_STATE`, `LocationCommandType` and `getEffectiveInstant`. `presenter/index.ts` exports `presentLocationRows`. `constants/index.ts` exports `ONE_DAY` (`constants/date.ts`, value 1).
- `test/features/locations/steps/locations_reorder_unit.steps.ts`, scenario "50 locations within the budget": times `reduceLocations(…MOVE_LOCATION…)` followed by `presentLocationRows(outcome.state.locations, …)`. This is the house pattern for a "command + re-present" budget.
- `presenter/countryName.ts` caches one `Intl.DisplayNames` per language, so the first presentation in a process pays construction costs that later ones do not. In the app the rows are always presented once before the user can change the date.
- `test/features/date_selection/steps/dateSelectionWorld.tsx` exports `ENGLISH_LANGUAGE` and builds the jsdom page (`MainPage` inside `LocationsProvider`) used by the untimed scenario.

## Goals / Non-Goals

**Goals:**
- The timed block contains only the app's own date-change work: the reducer and the presenter.
- The same-render, no-loading-state promise is still exercised through the real page.

**Non-Goals:**
- No production code changes (proposal M4), and no change to `vitest.config.ts`.

## Decisions

### D1: Time the reducer and the presenter, not the jsdom render (NFR-P1)

The timed step runs `reduceLocations(state, { type: SHIFT_DATE, days: ONE_DAY, now: "2026-03-08T07:30:00Z" })` on a state of 50 locations with `deviceTimeZoneId: "UTC"`. Then it calls `presentLocationRows(outcome.state.locations, { language: ENGLISH_LANGUAGE, instant: getEffectiveInstant(outcome.state, now), translate: i18n.getFixedT(ENGLISH_LANGUAGE), deviceTimeZoneId: "UTC" })`. Both calls sit between two `performance.now()` reads. This is the same work `showNextDay` triggers in the controller, minus React and jsdom, and it matches `locations_reorder_unit.steps.ts`. The timed step imports through module `index.ts` files only (`@/model`, `@/presenter`, `@/constants`), as `process-invariants.md` requires.

### D2: Warm the presenter once before timing (NFR-P1)

Before the timed block, the Given step presents the same 50 locations once at the original instant, untimed. That matches the spec's "rows that were already presented once" and the real app, where the list is on screen before any date change. It keeps one-time costs (the cached `Intl.DisplayNames`, first-use formatter setup in the Temporal polyfill) out of the 50 ms.

### D3: Assert every presented row, not one (NFR-P1)

The Then step checks that every row's `localIsoDate` equals `Temporal.Instant.from("2026-03-09T07:30:00Z").toZonedDateTimeISO(row zone).toPlainDate().toString()`. This shows the timed work produced the new date for all 50 rows. `SHIFT_DATE` keeps the wall-clock time `07:30` in the reference zone `UTC` (ADR-0003, ADR-0007), so the expected instant is fixed.

### D4: Same-render check without timing, through the real page (FR1, UX1)

The scenario "The new date shows in the same render" reuses the existing world steps: 50 stored locations, `givenAppOpen`, then one `act(() => world.getReference().showNextDay())`. Right after that single synchronous `act`, the Then step checks that the row of every one of the 50 zones has a `<time>` whose `datetime` is that zone's local date at `2026-03-09T07:30:00Z`. It does no `await`, no `waitFor` and no timing. It resolves the rows with one DOM query, not 50 calls to `world.rowOf` (each runs a full-page `getByRole` name lookup, which is slow and load-dependent in jsdom): a single `querySelectorAll("button[aria-label]")` over the page, mapping each button's exact `aria-label` to its `closest("li")`. Each zone's row is the entry whose label equals `i18n.t("locations.removeLocation", { city: zone })`. The match is exact, never by substring or position, because zone IDs share prefixes and a derived device-zone row for `UTC` may be present (ADR-0007). A loading state between the date change and the rows (for example the `aria-busy` skeleton of `app/ViewSkeleton.tsx`) would replace the rows, so a zone's row would be missing from that map and the check would fail. No `aria-*` attribute is asserted, so the scenario stays in jsdom per `bdd-unit.md` ("aria-labels, focus management": E2E only). The instant follows from the world's default `2026-03-08T07:30:00Z` and device zone `UTC` (`dateSelectionWorld.tsx`, `DEFAULT_INSTANT`, `DEFAULT_DEVICE_ZONE`). This keeps the synchronous-update promise without coupling it to runner speed.

## Consequences

Positive:
- The budget scenario is deterministic in what it measures, so CI goes green and stays green under load.
- All 50-row budgets in the suite now measure the same layers (model and presenter).

Negative:
- The jsdom render of 50 rows is no longer timed (see Risks).

## Alternatives Considered

**Keep timing `act(showNextDay)` with a bigger budget or retries**: rejected. It changes the requirement's number (NG2), and the result would still depend on runner load.

**Median of N timed `act` runs**: rejected. Each run still renders through jsdom, so the measurement is still of jsdom. It also mutates the page between samples.

**Move the timing to Playwright E2E**: rejected for this fix (NG4). A real-browser frame timing is a new kind of test with its own flakiness, and it is not needed to restore the build.

## Risks / Trade-offs

- [The jsdom render is no longer under a time budget] → It was never a meaningful proxy for real-browser paint. Real-browser speed stays covered by the architecture's synchronous design (overview "All conversions are synchronous"), and NG4 records that no Playwright timing is added.
- [The pure scenario could drift from what `showNextDay` really does] → It uses the same exported model and presenter functions that `useLocations` and `useReferenceMoment` call. The FR1 scenario still drives the real hook end to end.

## Migration Plan

None. This is a test-only change, and rollback is a revert of the two test files.
