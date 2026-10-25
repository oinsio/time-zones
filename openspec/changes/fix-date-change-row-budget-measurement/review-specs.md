# Specs review: fix-date-change-row-budget-measurement

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 13/13 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Freshness

- ✅ The failing scenario times `act(() => world.getReference().showNextDay())` with `performance.now()` and asserts `elapsedMs <= ROW_BUDGET_MS` (50): `packages/client/src/test/features/date_selection/steps/date_selection_reference_moment_rows.steps.tsx:41-68`, matching the CI log (line 67).
- ✅ The feature file and scenario exist with tags `@select-date-with-calendar-and-now @NFR-P1` and steps "Given 50 locations / And the app is open / When the user moves to the next day / Then the rows show the new date within 50 ms": `date_selection_reference_moment_rows.feature:5-10`.
- ✅ The steps file is 137 lines (design.md Context): `wc -l`.
- ✅ The stable requirement "Date changes are fast" and its scenario "50 rows within the budget" exist as the MODIFIED delta restates them: `openspec/specs/date-selection/spec.md:197-203`.
- ✅ The archived NFR-P1 reads "A date change re-presents 50 location rows in at most 50 ms, synchronously, with no loading state.": `openspec/changes/archive/2026/10/2026-10-25-select-date-with-calendar-and-now/proposal.md:79`. No archived change already implements this fix (no file outside the change names `fix-date-change-row-budget-measurement`).
- ✅ `locations_reorder_unit.steps.ts:253-270` times `reduceLocations(…MOVE_LOCATION…)` followed by `presentLocationRows` and nothing else.
- ✅ `locations_local_time_unit.steps.tsx:182-189` and `locations_device_time_zone_unit.steps.tsx:164-171` time only `presentLocationRows` (`locations_utc_offset_unit.steps.tsx:245-252` does the same, so "every other 50-row budget" holds).
- ❌ NG3 (proposal.md:43) says `location_search_performance` "already time[s] only model and presenter work". It times `citySearch.search(query, "en")`, the city-search adapter, and no rows: `test/features/location_search/steps/searchWorld.ts:27-31`.
- ✅ `showNextDay` dispatches `{ type: LocationCommandType.SHIFT_DATE, days: ONE_DAY, now: nowTimestamp() }`: `controller/useReferenceMoment.ts:91-96`.
- ✅ `useLocations` re-presents with `presentLocationRows(locations, { language, instant: getEffectiveInstant(state, clock.instant()), translate: t, deviceTimeZoneId })`: `controller/useLocations.ts:36-44`.
- ✅ `@/model` exports `reduceLocations`, `INITIAL_LOCATIONS_STATE`, `LocationCommandType`, `getEffectiveInstant` (`model/index.ts`). `@/presenter` exports `presentLocationRows` (`presenter/index.ts:60`). `@/constants` exports `ONE_DAY` = 1 (`constants/index.ts:10`, `constants/date.ts:33`).
- ✅ `getEffectiveInstant(state, now: Temporal.Instant)` returns the pinned instant when pinned: `model/referenceMoment.ts:36-42`. Task 1.2 passes `Temporal.Instant.from(now)`, which matches.
- ✅ `SHIFT_DATE` keeps the current wall time in the reference zone, which is `state.deviceTimeZoneId`: `model/reduceReferenceMoment.ts` `moveToDate`, `model/referenceMoment.ts:31-33`. From LIVE at `2026-03-08T07:30:00Z` in `UTC` it pins `2026-03-09T07:30:00Z`, so the expected instant in design D3 and the delta spec is right. The command's `now` must carry `Z` (`model/locations.ts:79`, `model/referenceMoment.test.ts:75`), and D1 uses `"2026-03-08T07:30:00Z"`.
- ✅ `LocationsState` is `{ locations, deviceTimeZoneId, reference }`, so `{ ...INITIAL_LOCATIONS_STATE, locations, deviceTimeZoneId }` (task 1.2) is a complete state: `model/locations.ts:24-36`.
- ✅ `LocationRow.localIsoDate` exists and is the zone's plain date: `presenter/presentLocationRows.ts:27,74`.
- ✅ `presenter/countryName.ts:4-9` caches one `Intl.DisplayNames` per language (design Context, D2).
- ✅ `dateSelectionWorld.tsx` exports `ENGLISH_LANGUAGE` (:28), defines `DEFAULT_INSTANT = "2026-03-08T07:30:00Z"` and `DEFAULT_DEVICE_ZONE = "UTC"` (:31-32), renders `MainPage` inside `LocationsProvider` (:120-127), and resets i18n to English before each scenario (:93).
- ✅ `world.rowOf(city)` exists: `dateSelectionWorld.tsx:63-67`. It runs a full-page `screen.getByRole("button", { name: i18n.t("locations.removeLocation", { city }) })` on every call (relevant to R1).
- ✅ Rows render the date as `<time dateTime={localIsoDate}>`: `views/shared/LocalDateTime.tsx:25`.
- ✅ `app/ViewSkeleton.tsx:17` is an `aria-busy="true"` skeleton (design D4).
- ✅ `vitest.config.ts` sets no `testTimeout`, so Vitest's default 5 s per test applies (relevant to R1).

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ scenario "The new date shows in the same render" | ✅ 2.1, 2.2 |
| NFR-P1 | ✅ | ✅ MODIFIED "Date changes are fast", scenario "50 rows within the budget" | ✅ 1.1, 1.2, 1.3 |
| UX1 | ✅ | ✅ requirement "no loading state" + scenario "The new date shows in the same render" | ✅ 2.1, 2.2 |
| M1 | ✅ | n/a | ✅ 3.1, 3.4 |
| M2 | ✅ | n/a | ✅ 3.2 |
| M3 | ✅ | n/a | ✅ 1.3 |
| M4 | ✅ | n/a | ✅ 3.3 |
| G1 | ✅ | n/a, met by NFR-P1 | n/a, met by M1 |
| G2 | ✅ | n/a, met by NFR-P1 and FR1 | n/a, met by NFR-P1 and FR1 tasks |
| NG1 | ✅ | n/a | n/a, no artifact touches the presenter, reducer or rendering code |
| NG2 | ✅ | n/a | n/a, the budget stays 50 ms and no retry or skip is added |
| NG3 | ✅ | n/a | n/a, no task edits the other budget scenarios |
| NG4 | ✅ | n/a | n/a, no Playwright task |

## Consistency

None.

## Findings

### R1 — WARNING — The untimed same-render check runs 50 full-page `getByRole` name lookups in jsdom
- Location: `openspec/changes/fix-date-change-row-budget-measurement/tasks.md:188` (also `design.md:148`, D4)
- Rule: `—`
- Problem: Task 2.2 and design D4 check "for every one of the 50 zones, `world.rowOf(zone).querySelector("time")`". `world.rowOf` (`packages/client/src/test/features/date_selection/steps/dateSelectionWorld.tsx:63-67`) runs `screen.getByRole("button", { name: … })` over the whole page on every call. The page holds 50 `LocationRow`s, each with a drag handle and a remove button, plus the date bar. Every call computes the accessible name and visibility (`getComputedStyle` up the tree) of every button in jsdom, and the task makes 50 such calls in one step. The scenario it replaces calls `rowOf` once.
- Impact: The fix moves jsdom cost out of the 50 ms budget and into an untimed step that runs under Vitest's default 5 s test timeout (`vitest.config.ts` sets no `testTimeout`). The cost of 50 full-page role queries grows with runner load, which is the same kind of load-dependent failure that caused this task. The step can time out on a loaded CI runner and turn the build red again, which would defeat G1 and M1. It also adds needless seconds to every `pnpm test` run.
- Fix: In task 2.2 and design D4, resolve the rows with a single DOM query after the `act`, then pick each zone's row from that set by its exact city label (for example, collect the page's `<li>` rows once and match each zone's row by an exact label match, not a substring). Then read that row's `<time>` `datetime`. Keep the rest of D4 as is: still jsdom unit BDD, no `await`, no `waitFor`, no timing and no `aria-*` assertion.
- Fix risk: The lookup must match labels exactly. Several zone IDs share prefixes, and a derived "Here" row may be present because the device zone `UTC` is not among the 50 stored zones (ADR-0007). Positional or substring matching would check the wrong row. Without that care, the step could pass while the row it read is the wrong one.
- Status: open

### R2 — SUGGESTION — NG3 misdescribes `location_search_performance`
- Location: `openspec/changes/fix-date-change-row-budget-measurement/proposal.md:43`
- Rule: `—`
- Problem: NG3 says the excluded scenarios, including `location_search_performance`, "already time only model and presenter work". That scenario times `citySearch.search(query, "en")`, the city-search adapter, and presents no rows (`packages/client/src/test/features/location_search/steps/searchWorld.ts:27-31`).
- Impact: Low. Nothing gets built differently. The archived proposal would record a wrong fact about which layers that budget measures, and the reason for excluding it would rest on that wrong fact.
- Fix: Reword NG3 to: "They already time code without a jsdom render: model and presenter work for the `locations_*` budgets, the city-search adapter for `location_search_performance`."
- Fix risk: none
- Status: open

## Verdict

Ready to implement. No finding blocks it. Fixing R1 (WARNING) before implementation is recommended, so the new untimed scenario does not bring back load-dependent CI failures.
