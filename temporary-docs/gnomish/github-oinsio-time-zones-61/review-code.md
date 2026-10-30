# Review: add-wall-time-input-with-hint

## Summary

| Item | Value |
|---|---|
| Tasks verified | 29/29 |
| Requirements traced | 69/72 |
| CRITICAL | 1 |
| WARNING | 0 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 `WALL_TIME_INPUT_PATTERNS`, `MAX_WALL_TIME_HOUR`, `MAX_WALL_TIME_MINUTE`, `WALL_TIME_COMMAND_PATTERN` in `packages/client/src/constants/timeSelection.ts:15-25`, re-exported in `constants/index.ts:61-72`.
- ✅ 1.2 The four `locations.wallTime*` keys in `locales/en.json:31-34` and `locales/ru.json:31-34`, texts as in FR6, FR7 and NFR-A2.
- ✅ 2.1 `LocationCommandType`, `LocationErrorCode`, `LocationCommand` moved to `model/locationCommands.ts` and re-exported from `model/locations.ts:17-21`. Stryker: `locations.ts` 100%.
- ✅ 2.2 `WallTimeTargetKind` / `WallTimeTarget` / optional `wallTimeTarget` in `model/referenceMoment.ts:11-37`; `SET_WALL_TIME` and `INVALID_TIME` in `model/locationCommands.ts`; `model/reduceWallTime.ts:50-101`, delegated at `model/locations.ts:149`. Tests in `model/reduceWallTime.test.ts`, and the Kyiv/Kiev case in `model/reduceWallTime.legacy.test.ts:38`.
- ✅ 2.3 `getWallClockNote`, `WallClockNote`, `WallClockNotePlacement` in `model/wallClockNote.ts`, exported from `model/index.ts:82-88`. Tests in `model/wallClockNote.test.ts` (`it.each` at :60, :83).
- ✅ 2.4 The Here-entry and location-target rules in `model/followReferenceZone.ts:32-38`, tests in `model/followReferenceZone.test.ts`. Stryker: 100%.
- ✅ 2.5 Measured by this review: `reduceWallTime.ts` 96.97%, `wallClockNote.ts` 100%, `followReferenceZone.ts` 100%, `referenceMoment.ts` 100%, `locations.ts` 100%. `locationCommands.ts` has no mutants (types and enums only).
- ✅ 3.1 `presenter/parseWallTimeInput.ts`, exported at `presenter/index.ts:37`. The 16 texts of M4 are in `presenter/parseWallTimeInput.test.ts` and in the `Accepted texts` / `Rejected texts` outlines.
- ✅ 3.2 `formatWallClockTime` in `presenter/localDateTime.ts:45-56` uses the cached `getDateTimeFormatter`. `presentDateBar` switched to it at `presenter/dateBar.ts:60-61`. Tests in `presenter/localDateTime.test.ts`.
- ✅ 3.3 `presentWallTimeHint` in `presenter/wallTimeHint.ts`, tests in `presenter/wallTimeHint.test.ts:24,53` (GAP English, AMBIGUOUS Russian, UNIQUE → `undefined`).
- ✅ 3.4 `wallTimeInputLabel`, `wallTimeHint` and `findRowNoteOf` in `presenter/presentZoneMoment.ts:116-150`. `cityLabel` is passed from `presentLocationRows.ts:54` and `presentHereEntry.ts:34`. Tests in `presenter/presentZoneMoment.wallTime.test.ts:53-114`.
- ✅ 3.5 Measured by this review: `parseWallTimeInput.ts`, `wallTimeHint.ts`, `localDateTime.ts`, `dateBar.ts`, `presentZoneMoment.ts` and `presentHereEntry.ts` are at 100%. `presentLocationRows.ts` is at 85.71% (6/7). Its one survivor is an equivalent mutant on a line this branch did not change (see Mutation).
- ✅ 4.1 The gap note now comes from `getWallClockNote` in `controller/useReferenceMoment.ts:30-37`, and `wallClockNote` is put into the rows context in `controller/useLocations.ts:60`. Tests: `controller/useReferenceMoment.test.tsx` (+60 lines) and `controller/useLocations.wallTime.test.tsx:57`.
- ✅ 4.2 `controller/useWallTimeInput.ts`, exported in `controller/index.ts:19-24`. Tests in `controller/useWallTimeInput.test.tsx:82,91,101,113` (pins and closes, `INVALID_TEXT`, removed location closes silently, 0 writes for 20 inputs and a Now).
- ✅ 5.1 The time button is in `views/shared/LocalDateTime.tsx:47-56` and the field in `views/shared/WallTimeInput.tsx`. The listed cases are in `views/shared/WallTimeInput.test.tsx:32-115` and `LocalDateTime.test.tsx:53-74`. The live-tick defect in the blur path is R1.
- ✅ 5.2 `views/shared/WallTimeInput.legacy.test.tsx:13` stubs out `PointerEvent` and opens the field with a plain click.
- ✅ 5.3 `views/shared/WallTimeHint.tsx` (`role="status"`, `Info` icon, `bg-notice text-notice-foreground`) is placed by `ZoneRowContent.tsx:117`, after the place/time span and before `DayTrack`. Targets are bound in `LocationRow.tsx:158-164` and `HereEntryRow.tsx:53-55`, and wired through `LocationList.tsx:138` and `CardsView.tsx:42,89,104`. Exported from `views/shared/index.ts:10-11`. Tests in `WallTimeHint.test.tsx` and `HereEntryRow.test.tsx`.
- ✅ 5.4 Measured by this review: `WallTimeInput.tsx` 91.89%, `LocalDateTime.tsx` 90.91%, `WallTimeHint.tsx`, `ZoneRowContent.tsx`, `useWallTimeInput.ts`, `useReferenceMoment.ts`, `useLocations.ts`, `HereEntryRow.tsx`, `LocationList.tsx` and `CardsView.tsx` 100%, `LocationRow.tsx` 98.18%. All of them are at or above the 90% minimum.
- ✅ 6.1 `test/features/time_selection/time_selection_wall_time_input_unit.feature` (all listed scenarios, lines 6-240) and `steps/time_selection_wall_time_input_unit.steps.tsx` with `wallTimeHintScenarios.ts`.
- ✅ 6.2 `time_selection_wall_time_budget.feature:6,14` with its steps. `wallClockLookupsIn` spies on `PlainDateTime#toZonedDateTime` in `test/zoneLookupCounter.ts:24-43`. The bench case is in `test/benchmarks/rowPresenting.bench.ts:39-41`.
- ✅ 6.3 `date_selection/date_selection_wall_clock.feature:58-70` has both scenarios, tagged `@add-wall-time-input-with-hint @FR7`, and `steps/date_selection_wall_clock.steps.tsx` defines their steps.
- ✅ 6.4 `time_selection_wall_time_input_e2e.feature` covers Open, Cancel, Keyboard-only, Tab confirms, Names, the axe outline of 10 rows, the button and hint checks, scrolling at 320/2560 and the Pointer-Events tap. `locations_here_entry_e2e.feature:47-56` expects two Tab stops.
- ✅ 6.5 The `@view-contract` scenario "Type an exact time" is at `time_selection_view_contract_e2e.feature:21`, with steps in `time_selection_view_contract_e2e.steps.ts`.
- ✅ 6.6 `locationsStates.ts:64` adds `wall-time-input` and `wall-time-hint`. Outline rows are at `locations_ui_e2e.feature:185-192`. The 8 new baselines per project were added and the row baselines re-approved (PNG diff in the branch).
- ✅ 7.1 `handoff/H1-glossary-wall-time-input.patch` passes `git apply --check`. The scratch check applies, and `Wall-time target` appears once in the result.
- ✅ 7.2 `handoff/H2-architecture-wall-time-input.patch` passes `git apply --check`. The scratch check applies: `GMT-4` count 0, `SET_WALL_TIME(target, time, date)` count 1, and Q4 names the Here entry.
- ✅ 8.1 The traceability loop, run from `packages/client/`, printed nothing.
- ✅ 8.2 CI is green for the branch (stage precondition). This review's own `pnpm build` succeeded, and screenshot baselines were re-approved.
- ✅ 8.3 `grep -rniE "time ?picker|time edit" src` and `grep -n GMT src/locales/*.json` print nothing.

## Requirements

- ✅ FR1 — Time button in `LocalDateTime.tsx:47-56`, nothing rendered for an empty time at `:39`. Tests: `WallTimeInput.test.tsx:32`, the unit scenario "No input for an unknown zone", the e2e "Open the field".
- ✅ FR2 — `parseWallTimeInput.ts` with `WALL_TIME_INPUT_PATTERNS`. Tests: the `Accepted texts` outline (10 rows) and `parseWallTimeInput.test.ts`.
- ✅ FR3 — `reduceWallTime.ts:50-101` resolves through `resolveWallClock`, and the date comes from `openedDate` (`LocalDateTime.tsx:51,60`). Tests: `reduceWallTime.test.ts`, the unit scenarios "Type a time in another city", "Wall-clock outcomes of a typed time" and "Type a time in the Here entry", and the e2e "Tab confirms the field".
- ✅ FR4 — The same-state return is at `reduceWallTime.ts:74-80`. The reference day follows the pinned instant. Test: unit "The typed instant leaves the reference day" and `reduceWallTime.test.ts` (`toBe`).
- ⚠️ FR5 — Escape and an unchanged blur close the field (`WallTimeInput.tsx:58-71`; tests `WallTimeInput.test.tsx:63,79`, e2e "Cancel"). But in live mode, leaving the field after a minute tick pins a stale time (R1).
- ✅ FR6 — `WallTimeInput.tsx:49-56,89-92`: error, `aria-invalid` and `aria-describedby`, and the field stays open. Tests: `WallTimeInput.test.tsx:51,86` and the `Rejected texts` outline.
- ✅ FR7 — `getWallClockNote` + `presentWallTimeHint` + `WallTimeHint`. Tests: the four hint-text scenarios, "The hint ends with the next change", "A home change keeps the hint", "A device time zone change ends the hint on the Here entry", "A wall-time input ends the gap note", and `wallClockNote.test.ts`.
- ✅ FR8 — The pinned mode shows Now. Tests: unit "The typed instant leaves the reference day" (`@FR8`), the outline row "returns to now", and `useLocations.wallTime.test.tsx:57`.
- ✅ FR9 — Dispatch goes straight to the store (`useWallTimeInput.ts:38`). Tests: `useWallTimeInput.test.tsx:113` (0 writes), unit "Nothing is stored or shared" and "The hint leaves with its row".
- ✅ FR10 — `CLOSED` for any store answer (`useWallTimeInput.ts:44`) and `LOCATION_NOT_FOUND` at `reduceWallTime.ts:66`. Tests: `useWallTimeInput.test.tsx:101` and unit "The location is gone while typing".
- ✅ FR11 — en/ru keys exist. Tests: e2e "Names in English" / "Names in Russian" and the hint-text scenarios in both languages.
- ✅ FR12 — `time_selection_view_contract_e2e.feature:21` "Type an exact time".
- ✅ FR13 — Opens on a click (`LocalDateTime.tsx:51`), `inputMode="numeric"` (`WallTimeInput.tsx:78`), and no BigInt (`Instant#equals` at `reduceWallTime.ts:76`). Tests: `WallTimeInput.legacy.test.tsx`, e2e "Tap opens the field without Pointer Events", `reduceWallTime.legacy.test.ts`, and unit "A renamed zone on outdated zone data".
- ✅ NFR-P1 — `formatWallClockTime` uses the cached formatter. Tests: `time_selection_wall_time_budget.feature:6,14` (0 formatters; lookups only in `America/New_York`) and the bench case `rowPresenting.bench.ts:39`.
- ✅ NFR-A1 — e2e outline "No accessibility violations" with 5 states × 2 themes.
- ✅ NFR-A2 — The name comes from `presentZoneMoment.ts:116-119` and is used on both the button and the field. Tests: `presentZoneMoment.wallTime.test.ts:53`, e2e "Names in …", and the Here-entry Tab-stop scenario.
- ✅ NFR-A3 — `role="status"` at `WallTimeHint.tsx:15`. e2e "Time button and hint are accessible" checks status, no live region with times, and `LocalDateTime` not being a live region (`LocalDateTime.test.tsx:48`).
- ✅ NFR-A4 — `KEYS_KEPT_IN_FIELD` with `stopPropagation` (`WallTimeInput.tsx:15-23,59`). Tests: `WallTimeInput.test.tsx:95,109` and e2e "Keyboard-only input" / "Tab confirms the field".
- ✅ NFR-R1 — e2e outline "No horizontal scrolling" at 320/2560: no scroll, card keeps its size, hint position.
- ✅ NFR-R2 — `locations_ui_e2e.feature:185-192` and the new PNG baselines for chromium and mobile-chrome.
- ✅ UX1 — Button classes `min-h-11 min-w-11 cursor-text … focus-visible:outline` (`LocalDateTime.tsx:52`). e2e checks 44×44, the outline and the text cursor.
- ✅ UX2 — Field `text-2xl md:text-4xl … border-accent` (`WallTimeInput.tsx:87`) and `inputmode` checked in e2e "Keyboard-only input".
- ✅ UX3 — `bg-notice text-notice-foreground`, `text-[13px]` and the `Info` icon (`WallTimeHint.tsx`), placed before the day track. e2e checks the hint position, and screenshots cover it.
- ✅ M1 — The traceability loop (task 8.1) prints nothing for all 23 ids.
- ✅ M2 — `reduceWallTime.test.ts` and unit "Type a time in another city" / "The typed instant leaves the reference day" (`@M2`).
- ✅ M3 — Rows GAP/AMBIGUOUS of the "Wall-clock outcomes of a typed time" outline (`@M3`) and `wallTimeHint.test.ts`.
- ✅ M4 — 10 accepted and 6 rejected rows in the unit outlines (`@M4`) and `parseWallTimeInput.test.ts`.
- ✅ M5 — `useWallTimeInput.test.tsx:113` and unit "Nothing is stored or shared" (`@M5`).
- ⚠️ M6 — Measured: every file is ≥ 90%. But `LocalDateTime.tsx` (90.91%) and `WallTimeInput.tsx` (91.89%) are below the 95% target, and `presentLocationRows.ts` is 85.71%. All survivors are equivalent mutants (see Mutation), so no finding.
- ✅ M7 — The 10-row axe outline, the 320/2560 outline and the screenshot outline with baselines.
- ✅ M8 — `WallTimeInput.legacy.test.tsx` (jsdom), e2e "Tap opens the field without Pointer Events" (Chromium), `reduceWallTime.legacy.test.ts:38` (Kyiv/Kiev, zone stays `Europe/Kyiv`), and `noBigIntInSources.test.ts` (CI green).
- ✅ Scenario: A gap is told in the bar — unchanged existing scenario in `date_selection_wall_clock.feature`. Still green after the switch to `getWallClockNote`.
- ✅ Scenario: A time selection ends the gap note — existing scenario in `date_selection_wall_clock.feature`. `SELECT_INSTANT` builds no target.
- ✅ Scenario: A wall-time input ends the gap note (date-selection delta) — `date_selection_wall_clock.feature:59`.
- ✅ Scenario: A gap from a wall-time input stays out of the bar — `date_selection_wall_clock.feature:70`.
- ✅ Scenario: Wall-clock outcomes — existing outline in `date_selection` features. `reduceReferenceMoment` is unchanged.
- ✅ Scenario: A malformed date changes nothing — existing scenario. `INVALID_DATE` is also covered for `SET_WALL_TIME` in the unit outline.
- ✅ Scenario: A device time zone change drops the gap note — `date_selection_wall_clock.feature:48`. The no-target rule at `followReferenceZone.ts:32-35`.
- ✅ Scenario: Name and list size — `locations_here_entry_e2e.feature:39`, now also tagged `@add-wall-time-input-with-hint @NFR-A2`.
- ✅ Scenario: One Tab stop on the Here entry — `locations_here_entry_e2e.feature:49`, expects the time button and then the slider.
- ✅ Scenario: No violations — `locations_here_entry_e2e.feature:59` "Accessibility of the Here entry in the <state> state" (light/dark). The Here entry now contains the time button.
- ✅ Scenario: Open the field — `time_selection_wall_time_input_e2e.feature:10`.
- ✅ Scenario: No input for an unknown zone — `time_selection_wall_time_input_unit.feature:6`.
- ⚠️ Scenario: Cancel — `time_selection_wall_time_input_e2e.feature:17` (Escape). But "the moment is still live" fails when the user cancels by leaving the field after a minute tick (R1).
- ✅ Scenario: Accepted texts — unit outline at `:13`.
- ✅ Scenario: Rejected texts — unit outline at `:31`.
- ✅ Scenario: Type a time in another city — unit `:50`.
- ✅ Scenario: Wall-clock outcomes of a typed time — unit outline at `:64`.
- ✅ Scenario: Type a time in the Here entry — unit `:79`.
- ✅ Scenario: The typed instant leaves the reference day — unit `:89`.
- ✅ Scenario: Nothing is stored or shared — unit `:101`.
- ✅ Scenario: The location is gone while typing — unit `:111`.
- ✅ Scenario: A malformed command changes nothing — unit outline at `:122`.
- ✅ Scenario: Hint for a DST gap — unit `:134`.
- ✅ Scenario: Hint for a DST overlap — unit `:145`.
- ✅ Scenario: Hint texts in Russian for a DST gap — unit `:155`.
- ✅ Scenario: Hint texts in English for a DST overlap — unit `:164`.
- ✅ Scenario: The hint ends with the next change — unit outline at `:173` (wall-time input, track step, next day, Now).
- ✅ Scenario: The hint leaves with its row — unit `:190`.
- ✅ Scenario: A home change keeps the hint — unit `:201`.
- ✅ Scenario: A device time zone change ends the hint on the Here entry — unit `:214`.
- ✅ Scenario: A wall-time input ends the gap note (time-selection delta) — unit `:227`.
- ✅ Scenario: Names in both languages — e2e "Names in English" and "Names in Russian".
- ✅ Scenario: No new formatter after a wall-time input — `time_selection_wall_time_budget.feature:6`.
- ✅ Scenario: The typed time is resolved in its row's zone only — `time_selection_wall_time_budget.feature:14`.
- ✅ Scenario: No accessibility violations — e2e outline (10 rows) plus "Time button and hint are accessible".
- ✅ Scenario: Keyboard-only input — e2e `:26`.
- ✅ Scenario: Tab confirms the field — e2e `:37`.
- ✅ Scenario: No horizontal scrolling — e2e outline at 320/2560.
- ✅ Scenario: Tap opens the field without Pointer Events — e2e, last scenario.
- ✅ Scenario: A renamed zone on outdated zone data — unit `:240`.
- ✅ Scenario: Type an exact time — `time_selection_view_contract_e2e.feature:21`.

## Mutation

Measured by this review, in five scoped runs of at most five files each (`npx stryker run --mutate …` from `packages/client/`, reading `reports/mutation/mutation-report.json` after each run):

| File | Score | Survivors |
|---|---|---|
| `src/model/reduceWallTime.ts` | 96.97% | 2. One is `e instanceof RangeError` → `true` at :97. Equivalent: the only thrower is Temporal and it throws `RangeError`. |
| `src/model/wallClockNote.ts` | 100% | 0 |
| `src/model/followReferenceZone.ts` | 100% | 0 |
| `src/model/referenceMoment.ts` | 100% | 0 |
| `src/model/locations.ts` | 100% | 0 |
| `src/model/locationCommands.ts` | — | no mutants (types and enums) |
| `src/constants/timeSelection.ts` | 100% | 0 |
| `src/presenter/parseWallTimeInput.ts` | 100% | 0 |
| `src/presenter/wallTimeHint.ts` | 100% | 0 |
| `src/presenter/localDateTime.ts` | 100% | 0 |
| `src/presenter/dateBar.ts` | 100% | 0 |
| `src/presenter/presentZoneMoment.ts` | 100% | 0 |
| `src/presenter/presentHereEntry.ts` | 100% | 0 |
| `src/presenter/presentLocationRows.ts` | 85.71% | 1. `markKind === undefined` → `false` at :53, a line this branch did not change. Equivalent: `marks[undefined]` is `undefined` too. |
| `src/controller/useWallTimeInput.ts` | 100% | 0 |
| `src/controller/useReferenceMoment.ts` | 100% | 0 |
| `src/controller/useLocations.ts` | 100% | 0 |
| `src/views/shared/WallTimeInput.tsx` | 91.89% | 3. `?.` → `.` on `fieldRef.current` at :45-46, and the effect deps `[]` → a constant array at :47. All equivalent: the ref is set when the effect runs, and a constant dependency never re-runs the effect. |
| `src/views/shared/LocalDateTime.tsx` | 90.91% | 2. `?.` on `buttonRef.current` at :36, and `isFocusReturnDue.current = false` → `true` at :35. Both equivalent: the button is mounted when the effect runs, and the next close always overwrites the flag before the effect reads it. |
| `src/views/shared/WallTimeHint.tsx` | 100% | 0 |
| `src/views/shared/ZoneRowContent.tsx` | 100% | 0 |
| `src/views/shared/LocationRow.tsx` | 98.18% | 1 |
| `src/views/shared/HereEntryRow.tsx` | 100% | 0 |
| `src/views/shared/LocationList.tsx` | 100% | 0 |
| `src/views/cards/CardsView.tsx` | 100% | 0 |

`presentLocationRows.ts` is the one file below 90%. Its only survivor is equivalent and sits on a line this branch did not touch, and no test can kill it. Changing untouched production code only to satisfy the counter would widen the change, so it is not a finding. No mutation survivor exposes an untested requirement. Note that R1's defect survives because no test rerenders the field with a new `initialText`, not because of a missed mutant.

## Findings

### R1 — CRITICAL — Leaving the field after a minute tick pins a stale time in live mode
- Location: `packages/client/src/views/shared/WallTimeInput.tsx:68`
- Rule: FR5 of `add-wall-time-input-with-hint` and the `time-selection` delta requirement "Closing the wall-time input", which says "Escape, or leaving the field without changing its text, SHALL close the field and change nothing".
- Problem: `handleBlur` decides "unchanged" with `text === initialText`. `text` is seeded once (`useState(initialText)`, :41), but `initialText` is a live prop: `LocalDateTime.tsx:59` passes `initialText={localTimeLabel}`, and that label advances on every minute tick while the moment is live. Once a minute boundary passes while the field is open, untouched text no longer equals `initialText`. Leaving the field then calls `confirm`, which dispatches `SET_WALL_TIME` with the old minute.
- Impact: Reproduced in the production build (Chromium, page clock at `2026-06-01T14:29:55Z`, zone `America/New_York`). Open the time button (`10:29`), let the clock pass 10:30, click elsewhere without typing. The row stays at `10:29`, the moment is pinned, and the Now button appears. In live mode the user only looked and left, yet every card stops following the clock. This breaks FR5 and the spec scenario "Cancel" ("the moment is still live"). The jsdom test `WallTimeInput.test.tsx:79` misses it because it never rerenders with a new `initialText`.
- Fix: Compare against the text the field opened with, not the live prop. In `WallTimeInput.tsx`, keep `const [openedText] = useState(initialText);` next to `text`, and use `text === openedText` in `handleBlur`. Add a case to `views/shared/WallTimeInput.test.tsx`: render with `initialText="10:30"`, `rerender` with `initialText="10:31"`, `fireEvent.blur(field)`, then expect `onConfirm` not to have been called and `onClose` to have been called with `false`.
- Fix risk: none. The field's text already ignores later `initialText` values, because `useState` seeds it once. Enter still confirms the shown text (FR3), changed text still confirms on blur, and the existing blur tests (`:70`, `:79`, `:86`) keep passing.
- Status: fixed
- Resolution: WallTimeInput now compares the text against `openedText` (seeded once) instead of the live `initialText` prop; covered by WallTimeInput.test.tsx "closes without confirming when left unchanged after the live time moved on".

### R2 — SUGGESTION — New test files exceed the 200-line limit the change set for itself
- Location: `packages/client/src/test/features/time_selection/steps/time_selection_wall_time_input_e2e.steps.ts:1`
- Rule: `.claude/rules/process-invariants.md` ("Target 100–200 lines per file; 300 is a hard cap, used only when splitting would hurt clarity"), `CLAUDE.md` ("Files must stay under 200 lines"), and `tasks.md` ("every file stays under 200 lines").
- Problem: Five files this branch added are over 200 lines: `time_selection_wall_time_input_e2e.steps.ts` (293), `wallTimeHintScenarios.ts` (272), `time_selection_wall_time_input_unit.steps.tsx` (270), `model/reduceWallTime.test.ts` (269) and `time_selection_wall_time_input_unit.feature` (247). They group several separable concerns, such as open/cancel/keyboard steps versus axe/layout steps, and parsing versus the hint's life.
- Impact: These files are close to the 300-line hard cap. The next scenario pushes them over, and the project keeps files small for AI context quality. The change's own task conventions are not met.
- Fix: Split along the existing concerns. Move the e2e axe, layout and legacy-tap steps into a `time_selection_wall_time_layout_e2e.steps.ts`. Split `reduceWallTime.test.ts` into a resolving file and a rejection/identity file. Move the hint-lifetime scenarios (FR7, FR9) into a `time_selection_wall_time_hint_unit.feature` with its own steps file, reusing `wallTimeWorld.tsx`.
- Fix risk: Low. The scenarios stay the same, but playwright-bdd regenerates its specs, and a step defined twice across files would clash. Run `npx bddgen` and the scoped vitest files after the move.
- Status: rejected (not-worth-it)
- Resolution: all five files are under the 300-line hard cap that the process-invariants rule sets (200 is a target); splitting playwright-bdd and vitest-cucumber step files risks duplicate-step clashes and regenerated specs for no behaviour gain, and CI checks stay green.

## Verdict

Not ready. One blocking finding: R1, where leaving the field after a minute tick pins a stale time and breaks FR5. R2 is optional.
