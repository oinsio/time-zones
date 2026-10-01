# Specs review: show-utc-offset-on-location-rows

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 24/26 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 1 |

## Freshness

- ✅ `openspec/specs/locations/spec.md:62` has the requirement "List in the Cards view" (city, country, remove action) that `proposal.md:5` cites; the change adds a requirement and does not modify it.
- ✅ `presenter/presentLocationRows.ts:5-24` — `LocationRow { id, cityLabel, countryName }` and `presentLocationRows(locations, language)`, as design.md:7 says.
- ✅ `controller/useLocations.ts:28-31` calls `presentLocationRows` inside a `useMemo` keyed on `[locations, language]` (design.md:7).
- ✅ `controller/LocationsProvider.tsx:21-25,50-54` takes optional `repository` and `writeScheduler` props; `controller/locationsContext.ts:22-29` defines `LocationsContextValue` without a clock (design.md:8, D4).
- ✅ `lib/temporal.ts:9-37` defines `Clock`, `systemClock`, `fakeClock(isoTimestamp, timeZone)`; a grep for `systemClock|fakeClock|Temporal.Now` in `packages/client/src` finds no other production reader of the clock (design.md:9).
- ✅ `views/shared/LocationRow.tsx:20-26` renders the city and, when not empty, the country in a `text-sm text-muted-foreground` span; `views/cards/CardsView.tsx:54` renders rows through `LocationList` (design.md:10).
- ✅ The callers named in design.md Consequences are the only ones: `presentLocationRows(` is called only in `useLocations.ts:29` and `presentLocationRows.test.ts`; `LocationRow` objects are built only in `LocationList.test.tsx:9-11` and compared whole only in `useLocations.test.tsx:52-54`.
- ✅ `test/features/locations/steps/locations_ui_unit.steps.tsx:67` asserts the substring `${firstCity}${firstCountry}` for "Rows show city and country" (`locations_ui_unit.feature:6`), so an offset placed after the country keeps it valid (design D5).
- ✅ `adapters/inMemoryLocationRepository.ts:57` returns `initialDocument` as given, without `parseStoredLocations`, so an unknown zone (`Mars/Olympus_Mons`) is reachable in unit tests (design D6); in production `model/parseStoredLocations.ts:38-39` rejects such a document, so FR6 is defensive only.
- ✅ `createInMemoryLocationRepository` is exported from `adapters/index.ts`, `LocationList` from `views/shared/index.ts` (design D6).
- ✅ The reused E2E steps exist: "the stored locations are …" (`locations_view_contract_e2e.steps.ts:21-22`), "the screen is {int} px wide for the locations" and "the locations screen does not scroll horizontally" (`locations_layout_e2e.steps.ts:14-25`), "the user opens the locations app" (`locations_ui_e2e.steps.ts:22`), `/^the locations screen uses the (light|dark) theme$/`, `/^the locations are in the (.+) state$/`, "the locations screen has no accessibility violations" (`locations_view_a11y_e2e.steps.ts:17-35`).
- ✅ The outline "Screenshot of the <state> state at <width> px in the <theme> theme" is at `locations_ui_e2e.feature:110` with 4 `list` examples; 8 `Screenshot-of-the-list-state-*.png` baselines exist under `__screenshots__/chromium/` and `mobile-chrome/`; `LocationsState.LIST` seeds Almaty and Moscow (`locationsStates.ts:20,49-52`).
- ✅ `KNOWN_CITIES` in `test/factories/buildLocation.ts:17-27` lacks Kathmandu and UTC, and `locationsE2eHelpers.ts:15-25` lacks Kathmandu, so tasks 6.1 and 7.1 rightly add them.
- ✅ `locales/locales.test.ts` checks key parity between locale files (task 1.2); `locations.utcOffsetPrefix` does not exist yet in `locales/en.json`.
- ✅ `package.json` name is `@time-zones/client` with `typecheck`, `test`, `lint`, `build`, `test:bdd` scripts; `vitest.config.ts:12-14` runs `*.steps.tsx` and excludes `*_e2e.steps.ts`; `playwright.bdd.config.ts:13-14` picks up `*_e2e.feature` and `steps/*_e2e.steps.ts`.
- ✅ `constants/locations.ts:2` has `LOCATIONS_SCHEMA_VERSION = 1` (proposal.md:13); no adapter or port is touched.
- ✅ Nothing is implemented yet: no `utcOffset` file or `getUtcOffsetMinutes`/`utcOffsetLabel` in `packages/client/src`, `openspec/specs/` or the three archived changes.

## Coverage

| Requirement id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ "UTC offset on location rows" | ✅ 5.1, 6.1 |
| FR2 | ✅ | ✅ Whole-hour, Half-hour, 45-minute, DST scenarios | ✅ 2.1, 3.2, 6.1 |
| FR3 | ✅ | ✅ "Offsets are written in one form", "Negative offset uses the minus sign" | ✅ 1.1, 3.1 |
| FR4 | ✅ | ✅ "Offset is computed again when the list changes" | ❌ 4.1 and 6.1 use a fixed `fakeClock`; the tests pass even if the instant is read once (R1) |
| FR5 | ✅ | ✅ "Russian interface" | ✅ 1.2, 3.2, 6.1 |
| FR6 | ✅ | ✅ "Offset that cannot be computed" | ✅ 2.1, 3.2, 5.1, 6.1 |
| NFR-P1 | ✅ | ✅ "50 rows within the budget" | ✅ 6.1 |
| NFR-A1 | ✅ | ✅ "No accessibility violations with offsets" | ✅ 7.1 |
| NFR-R1 | ✅ | ✅ "Offsets fit narrow and wide screens" | ✅ 7.1 |
| NFR-R2 | ✅ | ❌ in the requirement text only, no scenario (R2) | ✅ 7.2 |
| UX1 | ✅ | ✅ requirement text "on its secondary line, after the country name" | ✅ 5.1 |
| UX2 | ✅ | ✅ "Offsets are written in one form", "Russian interface" | ✅ 3.1, 3.2, 6.1 |
| M1 | ✅ | n/a | ✅ 8.1 |
| M2 | ✅ | n/a | ✅ 6.1 |
| M3 | ✅ | n/a | ✅ 3.3, 4.2, 5.2 |
| M4 | ✅ | n/a | ✅ 7.1 |
| M5 | ✅ | n/a | ✅ 3.1, 7.1 |
| G1 | ✅ | n/a — met by FR1, FR6 | n/a — met by FR1, FR6, M1 |
| G2 | ✅ | n/a — met by FR2 | n/a — met by FR2, M2 |
| NG1 | ✅ | n/a | n/a — no artifact builds differences from home or the reference zone |
| NG2 | ✅ | n/a | n/a — design D4 adds no tick; no artifact builds a timer |
| NG3 | ✅ | n/a | n/a — no artifact adds time, date, track or abbreviation |
| NG4 | ✅ | n/a | n/a — `presentSearchResults` and the Here entry are untouched |
| NG5 | ✅ | n/a | n/a — task 8.2 checks no offset reaches adapters or ports |
| Q1 | ✅ | n/a | n/a — deliberately left open for a docs change (proposal.md:118) |
| Q2 | ✅ | n/a | n/a — answered in proposal.md:119 (`UTC` in both locales), applied by task 1.2 |

## Consistency

None.

## Findings

### R1 — WARNING — FR4 recomputation is never tested with a changing instant
- Location: `openspec/changes/show-utc-offset-on-location-rows/tasks.md:22` (also `tasks.md:32`, `specs/locations/spec.md:37-40`)
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: FR4 (proposal.md:58) requires the offset to be computed whenever the rows are presented again (add, remove, other-tab change, language change), not once. The only FR4 tests — task 4.1 "after `addLocation` of Kolkata both rows carry offsets" and the spec scenario "Offset is computed again when the list changes" run by task 6.1 — use one fixed `fakeClock`. With a fixed instant, Moscow shows `UTC+3` after the add whether the instant is read inside the `useMemo` (design D4) or captured once at mount (for example `useState(() => clock.instant())`). The spec scenario also has no GIVEN for the instant.
- Impact: an implementation that reads the instant once at provider mount passes every planned test and the Stryker runs of task 4.2 (moving the read is not a mutation Stryker generates), so FR4's "computed when the list is presented" ends up unverified; after a DST switch while the page is open, adding a city would leave stale offsets on every row with no failing test.
- Fix: in task 4.1, replace the FR4 test with one that uses a switchable test clock built from two `fakeClock` instances (`const january = fakeClock("2026-01-15T12:00:00Z"); const july = fakeClock("2026-07-15T12:00:00Z"); let currentClock = january; const switchableClock: Clock = { instant: () => currentClock.instant(), plainDateISO: () => currentClock.plainDateISO(), timeZoneId: () => currentClock.timeZoneId() };`): with New York stored, the row shows `UTC−5`; set `currentClock = july`, `addLocation` Kolkata; New York now shows `UTC−4` and Kolkata `UTC+5:30`. In `specs/locations/spec.md:37-40` rewrite the scenario as: GIVEN the list contains New York and the app was opened at `2026-01-15T12:00:00Z` (New York shows `UTC−5`); WHEN the current instant is `2026-07-15T12:00:00Z` and the user adds Kolkata; THEN the New York row shows `UTC−4` and the Kolkata row shows `UTC+5:30`; and have task 6.1's steps use the same switchable clock for it.
- Fix risk: low. The clock still comes only from `fakeClock` instants, so `.claude/rules/tdd-workflow.md` ("Mock current time with `fakeClock`… never use `vi.setSystemTime()` or `vi.useFakeTimers()`") holds; the switch is explicit, not call-count based, so React re-renders do not make it flaky. Task 6.1's steps file needs a small helper for the switchable clock.
- Status: open

### R2 — SUGGESTION — NFR-R2 has no scenario in the delta spec
- Location: `openspec/changes/show-utc-offset-on-location-rows/specs/locations/spec.md:67`
- Rule: `.claude/rules/traceability.md` (Gherkin scenario tags `@<change-name> @FR-X`; every requirement id traceable to a scenario)
- Problem: the requirement "Offsets are fast, accessible and fit every screen" states that "the approved 'list' screenshots at 375 px and 1024 px in both themes MUST show the offsets" (NFR-R2), but its scenarios (spec.md:69-82) cover only NFR-P1, NFR-A1 and NFR-R1. Task 7.2 adds the Gherkin outline "The list state shows offsets at <width> px in the <theme> theme" tagged `@NFR-R2`, which has no counterpart in the spec.
- Impact: after archive, the stable `locations` spec carries an NFR-R2 obligation with no scenario, so the feature outline of task 7.2 traces to no spec scenario and a later change editing that spec has nothing to keep in sync.
- Fix: add to `specs/locations/spec.md` after line 82: "#### Scenario: List screenshots show the offsets — WHEN the list with Almaty and Moscow is shown at 375 px and 1024 px in each theme — THEN the rows show `UTC+5` and `UTC+3` — AND the screen matches the re-approved screenshot".
- Fix risk: none — it restates what task 7.2 already builds and tests.
- Status: open

## Verdict

Needs revision — blocking: R1 (WARNING: FR4 has no test that can fail). R2 is optional polish. No CRITICAL findings: the layering (model returns minutes, presenter formats and translates, controller owns the clock), Temporal-only offset derivation from IANA ids, no stored offsets and test placement (jsdom unit vs playwright-bdd E2E) all agree with ADR-0002, ADR-0003, ADR-0004 and `.claude/rules/`.
