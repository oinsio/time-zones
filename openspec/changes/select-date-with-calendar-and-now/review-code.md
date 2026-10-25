# Review: select-date-with-calendar-and-now

## Summary

| Item | Value |
|---|---|
| Tasks verified | 27/28 |
| Requirements traced | 88/91 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 0 |

## Tasks

- ✅ 1.1 — `packages/client/src/constants/date.ts:3-37` (format options, `DAYS_PER_WEEK`, `ONE_DAY`, `FIRST_DAY_OF_WEEK_BY_LANGUAGE`), re-exported at `constants/index.ts:2-11`; `KeyboardKey` gains the six keys at `constants/keyboard.ts:7-12`.
- ✅ 1.2 — `locales/en.json` and `locales/ru.json` both gain the `date` namespace with the same nine keys (`now` = `Сейчас`, both `gapNote` texts as in design D6).
- ✅ 2.1 — `model/wallClock.ts:25-42` `resolveWallClock` with an explicit `compatible` disambiguation plus `earlier`/`later` classification; `model/wallClock.test.ts` covers the four rows. Stryker: 100%.
- ✅ 2.2 — `model/referenceMoment.ts:5-43`, `model/reduceReferenceMoment.ts:86-101` (reducer moved to its own file, not into `referenceMoment.ts` as D1 says; the behaviour is the same), `model/locations.ts` gains `reference`, `SET_DATE`/`SHIFT_DATE`/`RESET_TO_NOW`, `INVALID_DATE`/`DATE_OUT_OF_RANGE` and delegates at `locations.ts:148-151`; tests in `model/referenceMoment.test.ts` and `model/referenceMomentPicking.test.ts`.
- ✅ 2.3 — `model/calendar.ts:5-96` (`getCalendarWeeks`, `CalendarMove`, `getCalendarFocusTarget`), exported from `model/index.ts:6-10`; `model/calendar.test.ts`.
- ✅ 2.4 — Measured in this review: wallClock 100%, referenceMoment 100%, reduceReferenceMoment 95.12%, calendar 97.96%, locations 100% (see Mutation).
- ✅ 3.1 — `presenter/dateBar.ts:45-81` `presentDateBar`; `presenter/dateBar.test.ts`. Stryker: 100%.
- ✅ 3.2 — `presenter/calendarMonth.ts:50-92` `presentCalendarMonth`, both presenters exported at `presenter/index.ts:4-15`; `presenter/calendarMonth.test.ts`. Stryker: 100%.
- ✅ 3.3 — Measured in this review: dateBar 100%, calendarMonth 100%.
- ✅ 4.1 — `controller/useReferenceMoment.ts:55-109` (actions dispatch through `store.dispatch`, never the write scheduler); `controller/useReferenceMoment.test.tsx`; exported at `controller/index.ts:13`.
- ✅ 4.2 — `controller/useLocations.ts` presents rows at `getEffectiveInstant(state, clock.instant())`; `controller/useLocations.reference.test.tsx`.
- ✅ 4.3 — `controller/useCalendarMonth.ts:23-54`; `controller/useCalendarMonth.test.tsx`; `useCalendarMonth` and `CalendarMove` exported at `controller/index.ts:1,4`.
- ✅ 4.4 — Measured in this review: useLocations 100%, useReferenceMoment 100%, useCalendarMonth 100%.
- ✅ 5.1 — `views/shared/DateBar.tsx:18-82`; `views/shared/DateBar.test.tsx` asserts text, `dateTime` and which controls exist only.
- ✅ 5.2 — `views/shared/calendarKeys.ts:4-21`; `views/shared/calendarKeys.test.ts`. Stryker: 100%.
- ✅ 5.3 — `views/shared/CalendarDialog.tsx:38-198`; `views/shared/CalendarDialog.test.tsx` (clicks only).
- ✅ 5.4 — `DateBar` exported at `views/shared/index.ts:2`; `app/MainPage.tsx` gains `bottomBar` and the sticky `<footer>` with the notices region inside; `app/AppShell.tsx` passes `bottomBar={<DateBar />}`; `app/MainPage.test.tsx` adds the two DOM-structure checks.
- ✅ 5.5 — Measured in this review over the task's four files: 74 of 82 mutants killed = 90.2%, at the minimum. Per file, `CalendarDialog.tsx` is 87.50%, below 90% (R2).
- ✅ 6.1 — `test/features/date_selection/date_selection_reference_moment.feature`, `date_selection_reference_moment_rows.feature` and `date_selection_wall_clock.feature` hold every listed scenario. Their steps are in the matching `steps/*.steps.tsx` files. The feature was split across three files to keep each under 200 lines. The world (`steps/dateSelectionWorld.tsx:127-138`) renders `MainPage` with `DateBar` in a `LocationsProvider`, not `AppShell`. The bar, rows and dialog it exercises are the same.
- ✅ 6.2 — `date_selection_calendar.feature` (pick and close scenarios driven by `userEvent` on the real dialog, `steps/date_selection_calendar.steps.tsx:43-100`) and `date_selection_calendar_month.feature` ("The calendar opens on the pinned date", "March 2026 in English and Russian", "A move beyond the supported range changes nothing").
- ✅ 6.3 — `date_selection_date_bar.feature` with `steps/date_selection_date_bar.steps.tsx` ("Date text by screen width and language", "Another year", "Live date changes at midnight", "Bar in each state" over six states).
- ✅ 6.4 — `main_page/main_page_unit.feature` gains the bar steps and `@select-date-with-calendar-and-now @FR8` in both scenarios; `main_page/steps/main_page_unit.steps.ts` carries the comments and steps.
- ✅ 7.1 — `date_selection_e2e.feature` (keyboard, names, announcement, axe-core outline, visible label) and `date_selection_layout_e2e.feature` (bar layout, calendar layout, look, touch targets, no horizontal scroll), steps in `steps/date_selection_e2e.steps.ts`, `date_selection_a11y_e2e.steps.ts`, `date_selection_layout_e2e.steps.ts`, `date_selection_theme_e2e.steps.ts`.
- ✅ 7.2 — `date_selection_view_contract_e2e.feature` ("Select a date", "Return to now", `@view-contract`), steps in `steps/date_selection_view_contract_e2e.steps.ts`.
- ✅ 7.3 — `main_page/main_page_e2e.feature:63-65` "Notice above the bar"; step at `main_page/steps/main_page_e2e.steps.ts:158-170`.
- ❌ 7.4 — Partly done. The `pinned` and `calendar` rows were added (`locations/locations_ui_e2e.feature:139-146`, `locations/steps/locationsStates.ts:105-113`) with 16 new baselines. The existing "list", "empty", "suggestions" and "IST results" baselines were not re-approved, though the task requires it: none of those 32 PNGs changed on this branch, and they still show no date bar (R1).
- ✅ 8.1 — The task's grep loop, run in this review over `FR1`–`FR10`, `NFR-P1`, `NFR-A1`–`NFR-A3`, `NFR-R1`–`NFR-R3` and `UX1`–`UX3`, prints nothing.
- ✅ 8.2 — CI is green for this branch (stage input). The full `pnpm test:mutation` run is left to the user, as `CLAUDE.md` requires.

## Requirements

- ✅ FR1 — `model/locations.ts` `INITIAL_LOCATIONS_STATE.reference = LIVE_REFERENCE_MOMENT`. Actions bypass `dispatchAndSchedule` (`controller/useReferenceMoment.ts:73-83`). Tested by the "The app opens live", "Date changes store nothing" and "The pinned moment survives a list change in another tab" scenarios.
- ✅ FR2 — `model/reduceReferenceMoment.ts:35-78` (`SHIFT_DATE` from the effective instant, wall time kept, pinned); scenarios "Next day from live", "Previous day resolves the offset for that day", "Moves add up from the pinned moment".
- ✅ FR3 — `SET_DATE` with the same-date no-op at `model/reduceReferenceMoment.ts:44`; `views/shared/CalendarDialog.tsx` opens on the shown month, picks and closes; scenarios in `date_selection_calendar.feature` and `date_selection_calendar_month.feature`.
- ✅ FR4 — `model/wallClock.ts:25-42`; gap note built at `controller/useReferenceMoment.ts:30-37` and `presenter/dateBar.ts:74-79`; "A gap is told in the bar" and "Wall-clock outcomes".
- ✅ FR5 — `controller/useLocations.ts` uses `getEffectiveInstant`; "Rows at a pinned moment", "A pinned moment ignores minute updates", `controller/useLocations.reference.test.tsx`.
- ✅ FR6 — `RESET_TO_NOW` at `model/reduceReferenceMoment.ts:90-93`; Now shown only while pinned (`views/shared/DateBar.tsx:61-70`); "Now after browsing dates", "Rows follow the clock again after now".
- ✅ FR7 — `presenter/dateBar.ts:53-69` (short/long labels, year when it differs); `minuteTick` in the memo key at `controller/useReferenceMoment.ts:66-69`; "Date text by screen width and language", "Another year", "Live date changes at midnight", E2E visible-label outline.
- ✅ FR8 — `app/MainPage.tsx` footer with the notices region inside; `app/AppShell.tsx` passes `<DateBar />`; "Bar in each state" (six states), E2E "Notice above the bar".
- ✅ FR9 — `date` keys in both locales; `FIRST_DAY_OF_WEEK_BY_LANGUAGE` (`constants/date.ts:35-37`); "March 2026 in English and Russian", Russian rows of "Date text by screen width and language".
- ✅ FR10 — `INVALID_DATE` (`model/reduceReferenceMoment.ts:94-100`) and `DATE_OUT_OF_RANGE` (`:62-65`); "A malformed date changes nothing", "A move beyond the supported range changes nothing", `model/referenceMoment.test.ts`.
- ✅ NFR-P1 — "50 rows within the budget" (`steps/date_selection_reference_moment_rows.steps.tsx:41-69`, `performance.now()` ≤ 50 ms, synchronous `act`).
- ✅ NFR-A1 — E2E outline "No accessibility violations in the <bar state> state in the <theme> theme" (live/pinned/calendar open × light/dark) with the default `AxeBuilder` rules.
- ✅ NFR-A2 — Roving `tabIndex` and key moves in `views/shared/CalendarDialog.tsx:54-72,175`, focus to the date button after Now (`DateBar.tsx:30-33`); seven keyboard scenarios in `date_selection_e2e.feature`.
- ✅ NFR-A3 — `aria-label`s, `aria-current`, `aria-selected` on the gridcell (`CalendarDialog.tsx:164-175`), polite live region (`DateBar.tsx:77-79`); E2E "Names and marks", "Date change is announced".
- ✅ NFR-R1 — `className="px-1 sm:p-4"` on the calendar content; E2E "No horizontal scrolling" outline and "Calendar days fit the narrowest screen".
- ✅ NFR-R2 — `sticky bottom-0` footer, `justify-between md:justify-center` bar; E2E "Bar on a narrow screen", "Bar on a wide screen", "Last card above the bar", "Calendar on a <width> px screen".
- ❌ NFR-R3 — New `pinned`/`calendar` baselines exist, but the existing "list", "empty", "suggestions" and "IST results" baselines were not re-approved and do not show the bar (R1).
- ✅ UX1 — `min-h-11 min-w-11` on bar controls and day buttons; E2E "Touch targets", "Calendar days fit the narrowest screen".
- ✅ UX2 — Now with `Clock` icon, `bg-accent text-accent-foreground`, icon-only arrows (`DateBar.tsx:39-69`); E2E "Bar controls look as approved in the <theme> theme".
- ✅ UX3 — Date text `text-base font-semibold text-foreground` (`CalendarDialog.tsx:82`); E2E "The date is the most prominent text of the bar …".
- ✅ M1 — The task 8.1 grep finds every FR, NFR and UX id on a line naming this change.
- ✅ M2 — The "Next day from live", "Previous day resolves the offset for that day" and "Pick a date in a later month" scenarios assert the M2 row texts and offsets. `model/referenceMoment.test.ts` asserts the exact pinned instants.
- ✅ M3 — "Wall-clock outcomes" (three rows with status and note), "A gap is told in the bar"; `model/referenceMoment.test.ts` asserts the instants and statuses.
- ✅ M4 — "Date text by screen width and language", "Another year" and "March 2026 in English and Russian" (5 and 6 week rows).
- ✅ M5 — "Date changes store nothing" (10 moves and Now, `lastDelayMs()` is `undefined`); `controller/useReferenceMoment.test.tsx`.
- ⚠️ M6 — Measured here: model 98.20%, presenter + controller 100%, views + app 91.67% (all 15 files together: 342 of 353 = 96.9%). `views/shared/CalendarDialog.tsx` alone is 87.50%, below the 90% minimum (R2).
- ⚠️ M7 — axe-core (6 runs) and no-horizontal-scroll scenarios exist. The 32 existing screenshot baselines pass only because they were never re-approved: they still show the page without the bar (R1).
- ✅ Scenario: The app opens live — `date_selection_reference_moment.feature:5-13`.
- ✅ Scenario: Date changes store nothing — `date_selection_reference_moment.feature:15-20`, `steps/date_selection_reference_moment.steps.tsx:52-70`.
- ✅ Scenario: The pinned moment survives a list change in another tab — `date_selection_reference_moment.feature:22-31`.
- ✅ Scenario: Next day from live — `date_selection_reference_moment.feature:33-46`.
- ✅ Scenario: Previous day resolves the offset for that day — `date_selection_reference_moment.feature:47-57`.
- ✅ Scenario: Moves add up from the pinned moment — `date_selection_reference_moment.feature:58-65`.
- ✅ Scenario: A move beyond the supported range changes nothing — `date_selection_calendar_month.feature:22-23` and following steps.
- ✅ Scenario: A gap is told in the bar — `date_selection_wall_clock.feature:5-13`.
- ✅ Scenario: Wall-clock outcomes — `date_selection_wall_clock.feature:15-28`.
- ✅ Scenario: A malformed date changes nothing — `date_selection_wall_clock.feature:30-35`.
- ✅ Scenario: Pick a date in a later month — `date_selection_calendar.feature:5-16`, `steps/date_selection_calendar.steps.tsx:43-73`.
- ✅ Scenario: Picking the shown date changes nothing — `date_selection_calendar.feature:18-25`.
- ✅ Scenario: Closing the calendar changes nothing — `date_selection_calendar.feature:27-36`.
- ✅ Scenario: The calendar opens on the pinned date — `date_selection_calendar_month.feature:5-12`.
- ✅ Scenario: March 2026 in English and Russian — `date_selection_calendar_month.feature:14-20`.
- ✅ Scenario: Now after browsing dates — `date_selection_reference_moment.feature:66` and following.
- ✅ Scenario: Date text by screen width and language — `date_selection_date_bar.feature:5-19`.
- ✅ Scenario: Another year — `date_selection_date_bar.feature:21-27`.
- ✅ Scenario: Live date changes at midnight — `date_selection_date_bar.feature:29-34`.
- ✅ Scenario: Bar in each state — `date_selection_date_bar.feature:36-48`.
- ✅ Scenario: Notice above the bar — `main_page/main_page_e2e.feature:63-65`.
- ✅ Scenario: 50 rows within the budget — `date_selection_reference_moment_rows.feature:5-10`.
- ✅ Scenario: Next day and Now with the keyboard — `date_selection_e2e.feature:26-35`.
- ✅ Scenario: Tab order of the bar — `date_selection_e2e.feature:6-13`.
- ✅ Scenario: Space activates the bar and the calendar — `date_selection_e2e.feature:14-25`.
- ✅ Scenario: Pick a date with the keyboard — `date_selection_e2e.feature:36-46`.
- ✅ Scenario: Focus crosses into the next month — `date_selection_e2e.feature:47-55`.
- ✅ Scenario: Page keys and week ends — `date_selection_e2e.feature:56-63`.
- ✅ Scenario: Esc closes without change — `date_selection_e2e.feature:64-72`.
- ✅ Scenario: Names and marks — `date_selection_e2e.feature:74-82`, `steps/date_selection_a11y_e2e.steps.ts:27-56`.
- ✅ Scenario: Date change is announced — `date_selection_e2e.feature:83-88`.
- ✅ Scenario: No accessibility violations — `date_selection_e2e.feature:90-105`.
- ✅ Scenario: Bar on a narrow screen — `date_selection_layout_e2e.feature:5-12`.
- ✅ Scenario: Bar on a wide screen — `date_selection_layout_e2e.feature:14-20`.
- ✅ Scenario: Last card above the bar — `date_selection_layout_e2e.feature:22-29`.
- ✅ Scenario: Calendar on a narrow and a wide screen — `date_selection_layout_e2e.feature:31-44` (outline over 375/639/640/1024 px).
- ✅ Scenario: Bar controls look as approved — `date_selection_layout_e2e.feature:46-58`.
- ✅ Scenario: The date is the most prominent text of the bar — `date_selection_layout_e2e.feature:60-75`.
- ✅ Scenario: Touch targets — `date_selection_layout_e2e.feature:77-85`.
- ✅ Scenario: Calendar days fit the narrowest screen — `date_selection_layout_e2e.feature:87-94`.
- ✅ Scenario: No horizontal scrolling — `date_selection_layout_e2e.feature:96` and following (320/2560 px × live/pinned/calendar).
- ✅ Scenario: Whole-hour zone — unchanged, `locations/locations_utc_offset_unit.feature`; rows still get a live instant through `getEffectiveInstant`.
- ✅ Scenario: Half-hour zone — unchanged, `locations/locations_utc_offset_unit.feature`.
- ✅ Scenario: 45-minute zone — unchanged, `locations/locations_utc_offset_unit.feature`.
- ✅ Scenario: Daylight saving time is respected — unchanged, `locations/locations_utc_offset_unit.feature`.
- ✅ Scenario: Zero offset — unchanged, `locations/locations_utc_offset_unit.feature`.
- ✅ Scenario: Offset is computed again when the list changes — unchanged, `locations/locations_utc_offset_unit.feature`.
- ✅ Scenario: Offset is computed again at the minute boundary — unchanged, `locations/locations_clock_tick.feature`.
- ✅ Scenario: Offset that cannot be computed — unchanged, `locations/locations_utc_offset_unit.feature`.
- ✅ Scenario: Time and date of each location — unchanged, `locations/locations_local_time_unit.feature`.
- ✅ Scenario: Zones on both sides of midnight — unchanged, `locations/locations_local_time_unit.feature`.
- ✅ Scenario: Russian interface — unchanged, `locations/locations_local_time_unit.feature`.
- ✅ Scenario: Time is computed again when the list changes — unchanged, `locations/locations_local_time_unit.feature`.
- ✅ Scenario: Time that cannot be computed — unchanged, `locations/locations_local_time_unit.feature`.
- ✅ Scenario: Rows at a pinned moment — `date_selection_reference_moment_rows.feature:12-22`.
- ✅ Scenario: The time changes at the minute boundary — unchanged, `locations/locations_clock_tick.feature`; `minuteTick` stays in the `useLocations` memo key.
- ✅ Scenario: No updates while the page is hidden — unchanged, `locations/locations_clock_tick.feature`.
- ✅ Scenario: The offset follows a DST change while the app is open — unchanged, `locations/locations_clock_tick.feature`.
- ✅ Scenario: Updates write nothing — unchanged, `locations/locations_clock_tick.feature`.
- ✅ Scenario: A pinned moment ignores minute updates — `date_selection_reference_moment_rows.feature:24-34`.
- ✅ Scenario: Rows follow the clock again after now — `date_selection_reference_moment_rows.feature:36-45`.
- ✅ Scenario: User opens the app — `main_page/main_page_unit.feature` with the added bar step, `@select-date-with-calendar-and-now @FR8`.
- ✅ Scenario: Notices stay available — `main_page/main_page_unit.feature` with the added bar step, `@select-date-with-calendar-and-now @FR8`.
- ✅ Scenario: Header keeps its position — unchanged, `main_page/main_page_unit.feature` and `main_page/main_page_e2e.feature`.

## Mutation

Run in this review, scoped with `--mutate`, one run at a time, report read from `packages/client/reports/mutation/mutation-report.json`:

| File | Score | Not killed |
|---|---|---|
| `src/model/wallClock.ts` | 100.00% | — |
| `src/model/referenceMoment.ts` | 100.00% | — |
| `src/model/reduceReferenceMoment.ts` | 95.12% | 2 survivors at `:63` and `:98`, `if (e instanceof RangeError)` → `true` (the rethrow of non-`RangeError`s, unreachable from Temporal) |
| `src/model/calendar.ts` | 97.96% | 1 survivor at `:93`, same rethrow guard |
| `src/model/locations.ts` | 100.00% | — |
| `src/presenter/dateBar.ts` | 100.00% | — |
| `src/presenter/calendarMonth.ts` | 100.00% | — |
| `src/controller/useLocations.ts` | 100.00% | — |
| `src/controller/useReferenceMoment.ts` | 100.00% | — |
| `src/controller/useCalendarMonth.ts` | 100.00% | — |
| `src/views/shared/DateBar.tsx` | 92.86% | 1 survivor at `:10`, `arrowButtonClassName` → `""` (styling, E2E-only per D8) |
| `src/views/shared/calendarKeys.ts` | 100.00% | — |
| `src/views/shared/CalendarDialog.tsx` | 87.50% (49 killed, 1 survived, 6 no coverage; 1 runtime error excluded from the score) | 6 no-coverage: `:57` BooleanLiteral, `:66` BlockStatement, `:68` ConditionalExpression ×2 and EqualityOperator, `:70` BooleanLiteral (the grid's key path); 1 survivor at `:29` (`iconButtonClassName` → `""`) — R2 |
| `src/app/MainPage.tsx` | 100.00% | — |
| `src/app/AppShell.tsx` | 100.00% | — |

## Findings

### R1 — CRITICAL — Existing screenshot baselines were not re-approved and do not show the date bar
- Location: `packages/client/src/test/features/locations/locations_ui_e2e.feature:113` (outline rows `:123-138`); baselines `packages/client/src/test/features/__screenshots__/{chromium,mobile-chrome}/Screenshot-of-the-{list,empty,suggestions,IST-results}-state-*.png`
- Rule: proposal NFR-R3 / M7, task 7.4 (`tasks.md:57`)
- Problem: Task 7.4 is ticked, and it reads "re-approve all existing and new baselines … with `--update-snapshots`". NFR-R3 requires that "the existing 'list', 'empty', 'suggestions' and 'IST results' baselines are re-approved", and that the approved screenshots "show the bar". On this branch only the 16 new `pinned`/`calendar` PNGs were added (`git diff --name-status` shows `A` only). None of the 32 existing baselines changed. `Screenshot-of-the-list-state-at-375-px-in-the-light-theme.png` still shows the page with no bottom bar, while the new `pinned` baseline shows it. These tests stay green only because of two things. First, Playwright 1.63's `--update-snapshots` preset is `changed`, which rewrites only failing snapshots. Second, `maxDiffPixelRatio` is 0.025 (`playwright.bdd.config.ts:32`), and the thin bar on a light surface stays under that.
- Impact: A ticked-but-undone task and an unmet requirement (NFR-R3, part of M7). The approved images of the four main states are not what the user sees. Any regression of the live bar can hide inside the 2.5% tolerance in all 32 comparisons. Examples: a wrong date, missing arrows, or a misplaced bar. The new baselines cover only the pinned bar.
- Fix: From `packages/client`, run `pnpm test:bdd:gen`. Then run `npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the (list|empty|suggestions|IST results) state" --update-snapshots=all` once for the `chromium` and `mobile-chrome` projects. Check that each of the 32 rewritten PNGs now shows the live bar (`Sun, March 8`, arrows, no Now), and commit them. Then run `npx playwright test -c playwright.bdd.config.ts --grep Screenshot` without the flag and confirm it passes.
- Fix risk: `--update-snapshots=all` approves whatever else differs in those 32 states. Any other drift under the tolerance (fonts, anti-aliasing) is accepted along with the bar, so each image must be looked at before committing. The `--grep` must stay limited to the screenshot outline so that no other snapshot is rewritten. No code changes.
- Status: open

### R2 — WARNING — `CalendarDialog.tsx` mutation score 87.50% is below the 90% minimum
- Location: `packages/client/src/views/shared/CalendarDialog.tsx:57`, `:66-72`
- Rule: `.claude/rules/tdd-workflow.md` ("Target mutation score: >=95%. Minimum acceptable: >=90%"), proposal M6
- Problem: Scoped Stryker on `src/views/shared/CalendarDialog.tsx` scores 87.50%: 49 killed, 1 survived (`:29` class string), 6 without coverage (plus 1 runtime error, which Stryker leaves out of the score). The six uncovered mutants are the whole grid key path: the BooleanLiteral on `shouldFocusDayRef.current = false` at `:57`, and in `handleKeyDown` the BlockStatement at `:66`, two ConditionalExpressions and one EqualityOperator on `move === undefined` at `:68`, and the BooleanLiteral on `shouldFocusDayRef.current = true` at `:70`. These mutants change behaviour; they are not equivalent — they are only untested in Vitest. No Vitest test sends a key event to the grid. That is deliberate: design D8 says jsdom tests "never assert keyboard handling … focus", and `.claude/rules/bdd-unit.md` puts "Keyboard accessibility" and "focus management" in E2E only. The browser scenarios "Pick a date with the keyboard", "Focus crosses into the next month", "Page keys and week ends" and "Esc closes without change" do exercise that path, but Stryker runs Vitest only and cannot see them.
- Impact: The file breaks the project's 90% per-file minimum, and M6 is not met for it. Each later mutation run reports the same six mutants as untested, which hides any new real gap in this file.
- Fix: Exclude only the six uncovered mutants, with a reason that says they are untested in Vitest by design, not equivalent. Before `:57` add `// Stryker disable next-line BooleanLiteral: not equivalent — keyboard focus is untested in jsdom by design (D8), covered by date_selection_e2e.feature`. Before `handleKeyDown` at `:66` add `// Stryker disable all: not equivalent — keyboard handling is untested in jsdom by design (D8), covered by date_selection_e2e.feature`, and after its closing `};` at `:72` add `// Stryker restore all`. Leave `useEffect`'s guard at `:55-56` and `handleOpenChange` at `:61-64` unmarked: their 8 mutants are killed by the existing Vitest tests in this run. Then rerun `cd packages/client && npx stryker run --mutate 'src/views/shared/CalendarDialog.tsx'`. Only no-coverage mutants leave the score, so 49 killed of 50 (98%) is expected. Do not add a jsdom keyboard test: D8 says jsdom tests "never assert keyboard handling … focus".
- Fix risk: This is the first suppression in `src/` for mutants that are not equivalent. The existing ones (`ViewErrorBoundary.tsx:22`, `AppErrorBoundary.tsx:25`, `ViewSkeleton.tsx:6`) are all equivalent mutants. It also departs from `.claude/rules/tdd-workflow.md` ("Write additional tests to kill survived mutants"). D8 forbids that test in jsdom, and Stryker runs Vitest only. After the fix, Stryker never mutates `:57` or `:66-72`. A regression there is caught only by the E2E keyboard scenarios "Pick a date with the keyboard", "Focus crosses into the next month", "Page keys and week ends" and "Esc closes without change". The key-to-move mapping itself stays covered by `calendarKeys.test.ts`. The change is comments only and has no runtime effect. If the fix-code stage rejects suppressing non-equivalent mutants, the only other path is to change D8, which is outside this change's scope; the finding then stays open as an accepted gap.
- Status: open

## Verdict

Not ready. Blocking: R1 (task 7.4 ticked but the 32 existing screenshot baselines were not re-approved; NFR-R3 unmet). R2 should be fixed in the same round to bring `CalendarDialog.tsx` to the 90% minimum.
