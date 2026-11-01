# Specs review: show-clock-change-note-on-location-cards

## Summary

| Item | Value |
|---|---|
| Stale claims | 2 |
| Requirements fully covered | 28/29 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 1 |
| SUGGESTION | 2 |

## Freshness

- ✅ `findOffsetTransitions(timeZoneId, day)` is the one transition search, in `packages/client/src/model/dayPeriodWindows.ts:40`; it walks `getTimeZoneTransition("next")` from `day.start − OFFSET_CHANGE_MARGIN_HOURS` up to `day.end + margin` (inclusive today, `<= 0` at line 53). `OFFSET_CHANGE_MARGIN_HOURS = 3` is in `constants/timeSelection.ts:16` (design Context, D2).
- ✅ `getDayPeriodStops` (`model/dayPeriodStops.ts:57`) is memoized by one day key `start|end` and a `Map` by zone (lines 53–78) and is the only production caller of `findOffsetTransitions` besides the default parameter of `collectBlendWindows` (design D2).
- ✅ `ReferenceDay` is `{ start, end, lengthMinutes }` and `getReferenceDay(state, now)` builds it from the zoned effective instant in the reference zone (`model/dayTrack.ts:19–46`) (design D1).
- ✅ The only `ReferenceDay` object literals outside `dayTrack.ts` are in `model/dayPeriodWindows.test.ts` and `test/features/time_selection/steps/time_selection_day_colours.steps.tsx`; `test/referenceDay.ts` goes through `getReferenceDay` (design D1, task 2.2).
- ✅ `getWallClockNote` (`model/wallClockNote.ts:41`) decides between `DATE_BAR` and `ROW` notes; the presenter's private `findRowNoteOf` and a local `RowNote` type live in `presenter/presentZoneMoment.ts:101,140–153` (design Context, D4, task 3.4).
- ✅ `useLocations` passes `referenceDay: getReferenceDay(state, now)` and `wallClockNote: getWallClockNote(state)` to `presentLocationRows` (`controller/useLocations.ts:69–74`) (design D1).
- ✅ `MAX_TRANSITION_LOOKUPS_PER_ZONE = 2`, `startWorkCount`, `transitionLookups()`, `transitionLookupsByZone()`, `formatters()`, `displayNames()` exist in `test/workCounters.ts:8–126`; lookups are counted by a spy on `Temporal.ZonedDateTime.prototype.getTimeZoneTransition` (design Context, tasks 2.3, 5.2).
- ✅ The time-selection date-change bound ("at most 2 time zone transitions per zone") is in `openspec/specs/time-selection/spec.md:388` and scenario `time_selection_day_track.feature:61–65`; its 50 zones are the first 50 of `Intl.supportedValuesOf("timeZone")` (`trackBudgetWorld.ts:57–59`, all `Africa/*`), none of which has an offset change between `2026-03-02` and `2026-03-17` (checked with the engine's tzdata 2026e), so the shared window walk keeps every zone at ≤ 2 lookups as D2 claims.
- ✅ The dates and instants of the scenarios hold against the engine's zone rules: Belgrade `2026-10-25T01:00:00Z` (back) and `2027-03-28T01:00:00Z` (forward); Lord Howe `2026-10-03T15:30:00Z` (+30 min, wall clock `2026-10-04T02:00`); Almaty `2024-02-29T18:00:00Z` (+6 → +5); Boa Vista `2000-10-08T04:00:00Z` and `2000-10-15T03:00:00Z`; Chicago `2026-03-08T08:00:00Z`. The window-bounds table (`spec.md:31–39`) and the reference-zone scenario (`spec.md:41–47`) evaluate to the stated yes/no.
- ✅ `formatWallClockTime(time: Temporal.PlainTime, language, hourFormat)` exists and formats through the cached UTC formatter (`presenter/localDateTime.ts:51–63`); `getDateTimeFormatter` and `DateTimeLabelKind { LOCAL_TIME, LOCAL_DATE, HOUR }` are in `presenter/dateTimeFormatters.ts:9–44`; `MINUTES_PER_HOUR` and `UTC_ZONE_ID` are exported from `constants/index.ts` (design D5).
- ✅ `getUtcOffsetMinutes` and `getLocalDateTime` return `undefined` on `RangeError` (`model/utcOffset.ts:17`, `model/localDateTime.ts:15`) (design D2).
- ✅ `WallTimeHint.tsx` is an `order-last` paragraph with `role="status"`, notice tokens and an `aria-hidden` `Info` icon (`views/shared/WallTimeHint.tsx:14–24`); `LocationRow.tsx` is 190 lines, renders `WallTimeHint` after `LocationMenu` (lines 179–185) and names the row through `aria-label={row.accessibleName}` / `aria-labelledby` (lines 138–156) (design D6).
- ✅ Production code already subtracts one nanosecond from an instant without BigInt (`model/dayPeriodWindows.ts:155`), and the BigInt scan forbids only BigInt literals, `BigInt(` and `epochNanoseconds` (`src/test/noBigIntInSources.test.ts`) (design D2, D7).
- ✅ The legacy zone shim is `src/lib/legacy/zoneShim.ts`; ADR-0003 records the "known limitation" of browser tzdata and ADR-0009 the iOS Safari 12.5 / 2022b engine (design D7).
- ✅ The E2E device zone is `Asia/Almaty` (`playwright.bdd.config.ts:39,80`) (design D8).
- ✅ Unit `KNOWN_CITIES` (`test/factories/buildLocation.ts:18`) has no Belgrade, Lord Howe Island, Boa Vista or Chicago yet, so task 5.1 must add them; the default budget location is Moscow (line 5).
- ✅ Reused E2E steps exist: "the current time is {string}", "the stored locations are …", "the screen is {int} px wide for the locations", "the locations interface language is Russian", "the locations screen uses the {word} theme", "the page shows a GAP hint", "the locations screen has no accessibility violations", "the locations screen does not scroll horizontally" (under `src/test/features/**/steps/`).
- ✅ `presentBudgetRows` (`test/features/locations/steps/rowBudgetWorld.ts:36`), `wallTimeBudgetWorld.ts` with `SET_WALL_TIME`, `test/benchmarks/rowPresenting.bench.ts`, `scripts/check-bench-budgets.mjs`, the `bench` script writing `reports/bench/bench.json`, and the commands `SHIFT_DATE`, `SET_HOME_LOCATION`, `SELECT_INSTANT` exist (tasks 5.1–5.3).
- ✅ The approved screenshot outlines of `locations_ui_e2e.feature:135` and `locations_12_hour_screenshots_e2e.feature:6` run at `2026-03-08T07:30:00Z` and their lists hold New York, whose change on `2026-03-08T07:00:00Z` is in the Almaty window (NFR-R2, task 6.2). The only other screenshot outlines with cards (`locations_utc_offset_e2e.feature`, `locations_device_time_zone_e2e.feature`) reuse the same list state; `settings_e2e.feature` shows no card.
- ✅ The stable `time-selection` "Wall-time input layout" requirement (`openspec/specs/time-selection/spec.md:899`) compares the New York card with and without the hint and stays true: the note sits below the noted parts and is replaced by the hint.
- ✅ The glossary files `docs/glossary/time.md` (24 lines) and `docs/glossary/date-selection.md` (11 lines) hold **UTC offset**, **Wall-time hint** and **Wall-clock note**; `docs/architecture/views.md:73,86` has "Shared building blocks" with a "Wall-time hint" row. No term "clock change" or "row note" exists yet (task 1.1).
- ✅ Nothing of the change is implemented: no `clockChange`, `getRowNote`, `RowNoteBox` or `clockChange*` locale key in `packages/client/src`, and no archived change covers it.
- ❌ Task 7.2 (`tasks.md:55`) calls `node scripts/check-legacy-build.mjs` "the BigInt and syntax scan of ADR-0009"; that script checks only built syntax and CSS (`scripts/check-legacy-build.mjs:1–7`). The BigInt scan is `src/test/noBigIntInSources.test.ts`, which the same task runs through `pnpm --filter @time-zones/client test`, so nothing goes unchecked; no finding.
- ❌ Task 6.1 (`tasks.md:48`) adds only Belgrade and Lord Howe Island to the E2E `KNOWN_CITIES` but its accessibility outline stores Chicago; `locationsE2eHelpers.ts:19–38` has no Chicago, and `buildStoredLocations` fails on a city the table lacks (line 44) — see R2.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ "Window bounds", "The window is counted in the reference zone", bounds scenarios | ✅ 2.1, 2.2, 5.1 |
| FR2 | ✅ | ✅ lower/upper bound, 30-minute and permanent change scenarios | ✅ 2.3, 3.1, 5.1, 6.1 |
| FR3 | ✅ | ✅ "A change on the reference day, before and after it" | ✅ 2.3, 5.1 |
| FR4 | ✅ | ✅ "Nearest of two changes" (tie rule in the SHALL) | ✅ 2.3 (tie case), 5.1 |
| FR5 | ✅ | ✅ home/device, no-change zone, unknown zone | ✅ 2.5, 3.3, 5.1 |
| FR6 | ✅ | ✅ three scenarios of "Clock change note and the wall-time hint" | ✅ 2.5, 3.3, 5.1, 6.1 |
| FR7 | ✅ | ✅ "The note follows the date bar and the settings" | ✅ 5.1 |
| FR8 | ✅ | ✅ "Texts in both languages", "Amount with hours and minutes" | ✅ 3.1, 3.2, 5.1 |
| NFR-P1 | ✅ | ✅ two budget scenarios | ✅ 5.2, 5.3, 7.1 |
| NFR-A1 | ✅ | ✅ "The note is not announced" | ✅ 4.1, 6.1 |
| NFR-A2 | ✅ | ✅ "No accessibility violations with notes" (list differs from the task, R2) | ✅ 6.1 |
| NFR-R1 | ✅ | ✅ "No horizontal scrolling with notes" | ✅ 6.1 |
| NFR-R2 | ✅ | ✅ screenshot sentence of the fast/accessible requirement | ✅ 6.2, 6.3 |
| UX1 | ✅ | ✅ bottom-line scenarios; the no-move clause has no scenario (R1) | ✅ 4.1, 6.1 (no-move check unworkable, R1) |
| UX2 | ✅ | ✅ "Clock change note text" | ✅ 3.1, 5.1 |
| M1 | ✅ | n/a | ❌ no task checks 15 of 15 dates; the outline has 3 "yes" and 2 "no" dates of that range (R3) |
| M2 | ✅ | n/a | ✅ 5.2 |
| M3 | ✅ | n/a | ✅ 7.1 |
| M4 | ✅ | n/a | ✅ 6.1 |
| M5 | ✅ | n/a | ✅ 7.3 |
| G1 | ✅ | n/a met by FR1, FR2, FR5 | n/a met by FR1, FR2, FR5 |
| G2 | ✅ | n/a met by FR2, FR3, FR8, UX2 | n/a met by FR2, FR3, FR8, UX2 |
| G3 | ✅ | n/a met by NFR-P1, M2 | n/a met by NFR-P1, M2 |
| NG1 | ✅ | n/a nothing builds DST/summer/winter wording; texts and grep in 7.3 exclude it | n/a |
| NG2 | ✅ | n/a no dismiss, link or setting anywhere | n/a |
| NG3 | ✅ | n/a D6 keeps the hint's DOM (`role="status"`) through `RowNoteBox`; texts and lifetime untouched | n/a |
| NG4 | ✅ | n/a no own tzdata; D7 records engine behaviour | n/a |
| NG5 | ✅ | n/a no note in search, calendar or date bar; D2 keeps the stops unchanged | n/a |
| NG6 | ✅ | n/a window fixed by `CLOCK_CHANGE_WINDOW_DAYS`, no setting | n/a |

## Consistency

- `design.md:58` (D8) adds Chicago to the E2E `KNOWN_CITIES` in `locationsE2eHelpers.ts`, but task 6.1 (`tasks.md:48`) adds only Belgrade and Lord Howe Island there while its accessibility outline stores Chicago.
- The spec scenario "No accessibility violations with notes" (`specs/locations/spec.md:183–186`) lists Almaty, Belgrade and New York with no instant, while task 6.1 (`tasks.md:48`) builds New York, Chicago and Almaty at `2026-03-08T07:30:00Z`, where Belgrade would show no note (its change on `2026-03-29` is outside the window, `spec.md:119`).
- The requirement "Clock change note is fast, accessible and fits every screen" (`specs/locations/spec.md:160`) says showing the note "MUST NOT move or resize the city, time, day track or location menu button of the card" — the same card with and without the note — while task 6.1 (`tasks.md:48`) checks the Belgrade boxes against "the Almaty card", a different card.

## Findings

### R1 — WARNING — The "note moves nothing" check compares two different cards and has no spec scenario
- Location: `openspec/changes/show-clock-change-note-on-location-cards/tasks.md:48`; `openspec/changes/show-clock-change-note-on-location-cards/specs/locations/spec.md:160` and `:173–181`
- Rule: `.claude/rules/test-planning.md` (every FR/NFR/UX has an automated test); `.claude/rules/delta-specs.md`
- Problem: UX1 and the SHALL at `spec.md:160` require that showing the note does not move or resize the city, time, day track or location menu button of its card. No spec scenario states this clause ("The note is not announced" checks only the bottom line, live region and accessible name). Task 6.1 checks it as "the city, time, track and menu button boxes equal those of a card without a note within 1 px, compared with the Almaty card at 1024 px". The existing box helper `boxesOfCard` (`src/test/features/time_selection/steps/cardLayoutE2eHelpers.ts:20–31`) returns absolute page boxes, and the Almaty card sits at another `y`, carries the Here mark caption and another city name, so its city box differs from Belgrade's by far more than 1 px whether or not a note is shown.
- Impact: the assertion as written fails on a correct implementation (or is rewritten ad hoc by the implementer), so UX1's "nothing moves" clause ends up either red or untested, and the archived spec keeps a SHALL without a scenario.
- Fix: in `specs/locations/spec.md` under "Clock change note is fast, accessible and fits every screen" add a scenario "Showing the note moves nothing in its card": GIVEN the device time zone is `Asia/Almaty`, the current instant is `2026-10-10T08:00:00Z` and the list contains Almaty and Belgrade (Belgrade shows no note) AND the positions and sizes of the Belgrade city, time, day track and location menu button are noted, WHEN the user picks 20 October 2026 in the calendar, THEN Belgrade shows its clock change note AND the noted parts keep their positions and sizes within 1 px. Tag it `@show-clock-change-note-on-location-cards @UX1`. In task 6.1 replace "the city, time, track and menu button boxes equal those of a card without a note within 1 px, compared with the Almaty card at 1024 px" with this scenario at 1024 px, reusing the existing steps `the place, time, track and menu of {string} are noted` / `... have not moved` (`time_selection_card_layout_e2e.steps.ts:34,64`) and `the user picks {string} in the calendar` (as in `date_selection_view_contract_e2e.feature:15`, here `"Tuesday, October 20, 2026"`).
- Fix risk: low. The picked date changes the Belgrade date label, but from 768 px the time column has one fixed width on every card (`openspec/specs/locations/spec.md:775`), and the Belgrade offset difference (+2 h vs +5 h) and time (10:00) are the same on both dates, so only the card height changes. The Almaty card above shows no note on either date. The scenario adds one E2E run of a few seconds.
- Status: fixed
- Resolution: added scenario "Showing the note moves nothing in its card" (Almaty device zone, 1024 px, 2026-10-10T08:00:00Z, the user picks 20 October 2026, the same Belgrade card compared before and after within 1 px) to specs/locations/spec.md under "Clock change note is fast, accessible and fits every screen"; task 6.1 drops the Almaty-card comparison and adds this scenario (@UX1) reusing the existing steps "the place, time, track and menu of {string} are noted / have not moved" and "the user picks {string} in the calendar" (both on the locationsWorld fixture).

### R2 — SUGGESTION — The E2E accessibility scenario lists different cities in the spec and the task, and Chicago is never added to the E2E city table
- Location: `openspec/changes/show-clock-change-note-on-location-cards/specs/locations/spec.md:183–186`; `openspec/changes/show-clock-change-note-on-location-cards/tasks.md:48`; `openspec/changes/show-clock-change-note-on-location-cards/design.md:58`
- Rule: `.claude/rules/gherkin.md` (scenarios are the executable spec); `.claude/rules/traceability.md`
- Problem: the spec scenario names Almaty, Belgrade and New York "with a clock change note and a wall-time hint shown" and gives no instant; task 6.1 builds the outline with New York, Chicago and Almaty at `2026-03-08T07:30:00Z`, where Belgrade has no note. Task 6.1 also adds only Belgrade and Lord Howe Island to `KNOWN_CITIES` in `locationsE2eHelpers.ts`, which has no Chicago (lines 19–38), although D8 lists Chicago for that table.
- Impact: followed literally, task 6.1's outline throws on the unknown city "Chicago" in `buildStoredLocations`; and the archived spec scenario describes a list that no test runs.
- Fix: rewrite the spec scenario as: GIVEN the device time zone is `Asia/Almaty` and the current instant is `2026-03-08T07:30:00Z`, AND the list contains Almaty, New York and Chicago, AND the user typed `02:30` in New York, so New York shows the wall-time hint and Chicago its clock change note, WHEN the list is shown in the light or the dark theme, THEN axe-core reports no violations. In task 6.1 add Chicago (`America/Chicago`, `US`) to the E2E `KNOWN_CITIES` next to Belgrade and Lord Howe Island.
- Fix risk: none — Chicago's change on `2026-03-08T08:00:00Z` lies in the Almaty window of that date, matching the unit scenario "Other rows keep their notes next to a hint" (`spec.md:121–127`).
- Status: fixed
- Resolution: rewrote spec scenario "No accessibility violations with notes" in specs/locations/spec.md to the list task 6.1 runs (Asia/Almaty, 2026-03-08T07:30:00Z, Almaty, New York and Chicago, 02:30 typed in New York: hint in New York, clock change note in Chicago); task 6.1 now adds Chicago (America/Chicago, US) to the E2E KNOWN_CITIES next to Belgrade and Lord Howe Island, matching design D8.

### R3 — SUGGESTION — Metric M1 (15 of 15 dates) is not measured by any task
- Location: `openspec/changes/show-clock-change-note-on-location-cards/proposal.md:130`; `openspec/changes/show-clock-change-note-on-location-cards/tasks.md:42`
- Rule: `.claude/rules/proposal-format.md` (metrics are concrete and measurable); `.claude/rules/test-planning.md`
- Problem: M1 counts the Belgrade note on 15 of 15 dates `2026-10-18`…`2026-11-01` and on 0 of 2 dates `2026-10-17`, `2026-11-02`. Task 5.1 runs the "Window bounds" outline from the spec table (`spec.md:31–39`), which holds only three dates of that range (`10-18`, `10-25`, `11-01`); task 2.1 tests one window. No task produces the 15/15 count.
- Impact: M1 cannot be reported as met from the test run; the archived change claims a measurement nobody takes.
- Fix: in task 5.1 say that the "Window bounds" Scenario Outline gets one example per date from `2026-10-17` to `2026-11-02` (17 rows: 15 "yes", 2 "no") in addition to the March rows, and add those rows to the table in `spec.md:31–39`.
- Fix risk: none — 12 more examples of an in-memory unit scenario.
- Status: fixed
- Resolution: the "Window bounds" table in specs/locations/spec.md now has one row per date from 2026-10-17 to 2026-11-02 (15 yes, 2 no) plus the March rows, and task 5.1 says the outline carries these examples as the M1 count.

## Verdict

Needs revision — blocking: R1 (the UX1 "nothing moves" check in task 6.1 cannot pass as written and has no spec scenario). R2 and R3 are polish that the same revision can include. No CRITICAL finding: the change delivers every rule of the task (window in the reference zone, tense against the reference moment, any offset change, nearest change, local time and date, every row kind, wall-time hint priority in the model, no live region, cache per zone and reference day with counted bounds and a benchmark, legacy behaviour in D7, glossary and `views.md` updates).
