# Review: fix-grid-meeting-range-lock-and-layering

## Summary

| Item | Value |
|---|---|
| Tasks verified | 20/21 |
| Requirements traced | 73/74 |
| CRITICAL | 1 |
| WARNING | 2 |
| SUGGESTION | 2 |

## Tasks

- ✅ 1.1 — `docs/glossary/time-selection.md:31` has the **Meeting range input** entry with «Время начала» / «Время окончания» and its *Code:* owners. `docs/glossary/locations.md` has "locked in Grid while a meeting range is set" twice. The files are 32 and 20 lines.
- ✅ 1.2 — `docs/architecture/domain-model.md:75` (command row) and `:92` (`LIVE --> PINNED`); `docs/architecture/views.md:44-45` (**Locked controls**, **Meeting range input**).
- ✅ 2.1 — `packages/client/src/model/reduceMeetingRangeWallTimes.test.ts` covers the 4 rows, the refusals, the whole day (`:160`) and a New York gap start (`:164`). `src/model/wallClock.test.ts:69` covers `isCanonicalWallTime`.
- ✅ 2.2 — `src/model/locationCommands.ts:27,82-92` adds the command. `src/model/wallClock.ts:53` adds `isCanonicalWallTime`, which `reduceWallTime.ts:39` now uses. The reducer is in `src/model/reduceMeetingRangeWallTimes.ts`. The command is routed at `src/model/locations.ts:194-195` and exported from `src/model/index.ts:132`.
- ❌ 2.3 — The feature and steps exist: `src/test/features/meeting_range/meeting_range_wall_times.feature` has 3 scenarios, `@FR5`. But the steps never assert, with `createInMemoryLocationBackend`, that the saved document has no `meeting` key after the command, so part of the task is ticked but not done (R1).
- ✅ 3.1 — `src/presenter/locationMeetingRange.ts:47-49` adds `startTimeLabel` / `endTimeLabel`; the test is at `src/presenter/locationMeetingRange.test.ts:42-45`.
- ✅ 3.2 — `src/controller/useMeetingRange.ts:154-178` adds `confirmMeetingRangeInput`, and `src/controller/index.ts:22-26` exports the enum. `src/controller/useMeetingRange.input.test.tsx:47-49` checks the three outcomes, `:74` checks the English text, and `:101` checks that nothing is saved.
- ✅ 4.1 — `tailwind.config.ts:23-32` has the 8 tokens, and every `z-[n]`, `z-10` and `z-20` is replaced: grep finds none in `src`. `z-page-bar` is at `src/app/MainPage.tsx:65`, `z-dialog` at `src/components/ui/dialog.tsx:24,27`. The tests are `dialog.test.tsx:44-45` and `MainPage.test.tsx:82`.
- ✅ 4.2 — `ZoneRowContent.tsx:133` no longer gives the zone line container `bg-surface`; the time label sits in `<span className="bg-surface">` at `LocalDateTime.tsx:137`. Tested at `ZoneRowContent.test.tsx:75-81` and `LocalDateTime.test.tsx:192-216`.
- ✅ 4.3a — The drag wiring moved to `src/views/shared/useSortableLocationRow.ts`; `LocationRow.tsx:102-106` uses it.
- ✅ 4.3b — `LocationMenu.tsx:69-73` adds `onOpenChange`, and `locationRowVariant.ts:73-74` adds `headerBoxLayer` / `headerBoxLayerWithOpenMenu`. `LocationRow.tsx:119-125` adds `isMenuOpen`. Tested in `LocationMenu.state.test.tsx:33-60` and `ViewLocationList.menuLayer.test.tsx:41-62`. `LocationRow.tsx` has 198 lines.
- ✅ 4.3 — `hourGridSlots.ts:35-36`, `LocationList.tsx:169`, `useSortableLocationRow.ts:31` (`disabled`), `DragHandle.tsx:35`, `LocationMenu.tsx:74-76,174` and `GridView.tsx:85` implement the lock. Tested in `LocationRow.locked.test.tsx`, `LocationMenu.state.test.tsx:63-95` and `LocalDateTime.meetingInput.test.tsx:95`.
- ✅ 4.4 — `MeetingRangeInput.tsx`; `wallTimeFieldKeys.ts`, which `WallTimeInput.tsx:51` uses; the switch at `LocalDateTime.tsx:124-158`; the 4 keys in both locales at `ru.json`/`en.json:123-126`. Tested in `MeetingRangeInput.test.tsx` and `LocalDateTime.meetingInput.test.tsx`.
- ✅ 4.5 — The scenarios are split over `grid_view_meeting_lock_unit.feature` (4 scenarios) and `grid_view_meeting_range_input_unit.feature` (5 scenarios), each with a step file.
- ✅ 5.1 — `grid_view_meeting_lock_e2e.feature` has all 9 scenarios with steps in `grid_view_meeting_lock_e2e.steps.ts`. The span locators are updated in `grid_view_meeting_e2e.steps.ts` and `grid_view_meeting_spans_e2e.steps.ts`.
- ✅ 5.2 — `grid_view_layers_e2e.feature` has "Dialogs cover the grid" (3 examples), "Rows scroll under the date bar", "An open location menu lies above the date bar" and the frame border outline (4 examples). The steps are in `grid_view_layers_e2e.steps.ts` and `frameBorderCoverage.ts`.
- ✅ 5.3 — The outline "Approved screenshots with a dialog open" exists, with 2 baselines each under `__screenshots__/chromium/` and `__screenshots__/mobile-chrome/`. The handoff says no existing baseline needed re-writing.
- ✅ 6.1 — Every run scores at least 90% overall (re-measured, see Mutation). One file in it, `useSortableLocationRow.ts`, is below 90% on its own (R3).
- ✅ 6.2 — CI is green per the stage brief; not re-run in this review.
- ✅ 6.3 — The traceability grep lists FR1–FR8, NFR-A1, NFR-A2, NFR-R1, NFR-R2 and UX1–UX3. "stays the button that opens the wall-time input" no longer appears in `src`.
- ✅ 7.1 — The `## H1` section is in `temporary-docs/gnomish/github-oinsio-time-zones-112/handoff/README.md`.

## Requirements

- ✅ FR1 — `GridView.tsx:85` sets `areRowControlsLocked`. It reaches `DragHandle.tsx:35` (`disabled`), `LocationMenu.tsx:74-76,174` (closes and disables) and `useSortableLocationRow.ts:31` (`disabled`). In `LocalDateTime.tsx:75-79` an open wall-time input closes without confirming. Tested by `LocationRow.locked.test.tsx`, the unit and E2E "Controls are locked…" scenarios, and `LocalDateTime.meetingInput.test.tsx:95`.
- ✅ FR2 — The lock is derived from `meeting !== undefined` (`GridView.tsx:85`). "Cards keeps its controls with a meeting range" passes in unit BDD, and the E2E lock scenario checks the controls after Clear.
- ✅ FR3 — The span button is named `meeting.rangeInputLabel` (`LocalDateTime.tsx:113-120`) and opens `MeetingRangeInput` with the start field focused and selected (`MeetingRangeInput.tsx:47-50`). Tested by `MeetingRangeInput.test.tsx:36-66` and "The span opens the meeting range input".
- ✅ FR4 — `MeetingRangeInput.tsx:52-79` handles Enter, blur, Esc and the errors, and `useMeetingRange.ts:154-178` returns the outcomes. Tested by `MeetingRangeInput.test.tsx:67-158` and the unit outlines. The English text of the range error differs from the spec (R2).
- ✅ FR5 — `reduceMeetingRangeWallTimes.ts:49-97` delegates to `reduceSetMeetingRange`. Tested by `reduceMeetingRangeWallTimes.test.ts` and `meeting_range_wall_times.feature`.
- ✅ FR6 — `z-dialog` on the overlay and content (`dialog.tsx:24,27`); tested by E2E "Dialogs cover the grid".
- ✅ FR7 — `z-page-bar` on the footer (`MainPage.tsx:65`), and a header box with an open menu gets `z-location-menu` (`locationRowVariant.ts:74`, `LocationRow.tsx:119-125`). Tested by E2E "Rows scroll under the date bar" and "An open location menu lies above the date bar".
- ✅ FR8 — The surface background is now on the glyphs only (`ZoneRowContent.tsx:133`, `LocalDateTime.tsx:137`). Tested by the E2E frame border coverage outline (`frameBorderCoverage.ts`).
- ✅ NFR-A1 — `grid_view_meeting_lock_e2e.feature:78` (`@NFR-A1`) runs axe in light and dark, with the input open and with an error shown. `aria-invalid` / `aria-describedby` are set at `MeetingRangeInput.tsx:93-94`.
- ✅ NFR-A2 — Covered by E2E "Tab order skips the locked controls", "The open input's fields sit in place of the span in the Tab order" and "The keyboard alone sets the meeting".
- ✅ NFR-R1 — Covered by E2E "The open input fits on a phone" at 320 × 640 and 390 × 844.
- ✅ NFR-R2 — Covered by the outline "Approved screenshots with a dialog open" and 4 new baselines.
- ✅ UX1 — `disabled:opacity-40 disabled:cursor-default` on both buttons (`DragHandle.tsx:38`, `LocationMenu.tsx:176`); asserted in `LocationRow.locked.test.tsx` and `LocationMenu.state.test.tsx:64`.
- ✅ UX2 — `border-accent font-bold text-meeting-text` and the dash (`MeetingRangeInput.tsx:23-24,112`); tested at `MeetingRangeInput.test.tsx:36-53`.
- ✅ UX3 — Covered by the E2E frame border outline (`@UX3`).
- ✅ M1 — The E2E "Controls are locked during the meeting and free after it" uses the 4 sample rows: every handle and menu button is disabled, no row offers the wall-time input, and after Clear they are enabled and the time opens the wall-time input. The Tab-stop part is measured with 2 rows in "Tab order skips the locked controls".
- ⚠️ M2 — 4 of the 5 named pairs are measured exactly (`grid_view_meeting_range_input_unit.feature:13-16`). The English pair is measured as `10 am`–`12:30 pm` (`:21`, `useMeetingRange.input.test.tsx:74`), not as the named Almaty `9 am`–`11 am`. The 12-hour parse path is the same, so this is not raised as a finding.
- ✅ M3 — The 4 named invalid inputs are the examples at `grid_view_meeting_range_input_unit.feature:33-36`.
- ✅ M4 — Covered by E2E "Dialogs cover the grid", 3 examples at 390 × 844.
- ✅ M5 — Covered by E2E "Rows scroll under the date bar" and "An open location menu lies above the date bar" (12 locations, 390 × 844).
- ✅ M6 — Covered by the E2E frame border outline at 390 × 844 and 1440 × 900, for both frames.
- ✅ Scenario: Controls are locked during the meeting and free after it — `grid_view_meeting_lock_unit.feature:6`, `grid_view_meeting_lock_e2e.feature:100`.
- ✅ Scenario: Setting a meeting range closes an open location menu — `grid_view_meeting_lock_unit.feature:16`.
- ✅ Scenario: Cards keeps its controls with a meeting range — `grid_view_meeting_lock_unit.feature:22`.
- ✅ Scenario: Type the meeting in another location's time — `grid_view_meeting_range_input_unit.feature:6`.
- ✅ Scenario: Twelve-hour texts — `grid_view_meeting_range_input_unit.feature:19`.
- ✅ Scenario: Wrong input keeps the input open — `grid_view_meeting_range_input_unit.feature:25`.
- ✅ Scenario: Esc closes the input without a change — `grid_view_meeting_range_input_unit.feature:39`.
- ✅ Scenario: Dialogs cover the grid — `grid_view_layers_e2e.feature:6`.
- ✅ Scenario: Rows scroll under the date bar — `grid_view_layers_e2e.feature:24`.
- ✅ Scenario: An open location menu lies above the date bar — `grid_view_layers_e2e.feature:37`.
- ✅ Scenario: Approved screenshots with a dialog open — `grid_view_layers_e2e.feature:69`, plus the baselines.
- ✅ Scenario: Notes and header texts cover the frame — unchanged, in `grid_view_hour_frame_e2e.feature`.
- ✅ Scenario: The frame border runs through the empty parts of the header — `grid_view_layers_e2e.feature:50`.
- ✅ Scenario: Frame and dimming of the sample meeting — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`.
- ✅ Scenario: A quarter-hour range — `grid_view_meeting_unit.feature`.
- ✅ Scenario: Meeting frame colour and layers — `grid_view_meeting_e2e.feature`, with the span locator updated.
- ✅ Scenario: Page Up on Moscow's strip — `grid_view_hour_frame_e2e.feature`.
- ✅ Scenario: Slider name and value of a strip — `grid_view_hour_frame_e2e.feature`.
- ✅ Scenario: Tab order and focus ring — `grid_view_hour_frame_e2e.feature`; the meeting-state Tab order is in `grid_view_meeting_lock_e2e.feature:6`.
- ✅ Scenario: No accessibility violations with hour cells — `grid_view_hour_frame_e2e.feature`.
- ✅ Scenario: Spans of the sample meeting — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`, with the locators updated.
- ✅ Scenario: Clear returns the times — `grid_view_meeting_unit.feature`.
- ✅ Scenario: The span opens the meeting range input — `grid_view_meeting_range_input_unit.feature:45`.
- ✅ Scenario: No accessibility violations in the meeting state — `grid_view_meeting_share_e2e.feature`.
- ✅ Scenario: No accessibility violations with the meeting range input — `grid_view_meeting_lock_e2e.feature:79`.
- ✅ Scenario: Tab order skips the locked controls — `grid_view_meeting_lock_e2e.feature:6`.
- ✅ Scenario: The open input's fields sit in place of the span in the Tab order — `grid_view_meeting_lock_e2e.feature:29`.
- ✅ Scenario: The keyboard alone sets the meeting — `grid_view_meeting_lock_e2e.feature:47`.
- ✅ Scenario: The open input fits on a phone — `grid_view_meeting_lock_e2e.feature:61`.
- ✅ Scenario: Drag a card to the top with the mouse — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Drag a card down by touch — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Cancel a drag — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Scrolling over a card scrolls the page — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: A single location has no handle — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Drag by finger without Pointer Events — unchanged, `locations_reorder_legacy_touch_e2e.feature`.
- ✅ Scenario: A quick swipe over the handle scrolls without Pointer Events — unchanged, `locations_reorder_legacy_touch_e2e.feature`.
- ✅ Scenario: No drag in Grid while a meeting range is set — `grid_view_meeting_lock_e2e.feature:118`.
- ✅ Scenario: Move a card down with the keyboard — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Cancel a keyboard move — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: Handle names the city — unchanged, `locations_reorder_e2e.feature`.
- ✅ Scenario: No keyboard reorder in Grid while a meeting range is set — `grid_view_meeting_lock_e2e.feature:132`.
- ✅ Scenario: Keyboard — unchanged, `home_location/home_location_e2e.feature:8`.
- ✅ Scenario: The menu does not start a reorder — unchanged, `home_location_e2e.feature`.
- ✅ Scenario: The menu is locked in Grid while a meeting range is set — `grid_view_meeting_lock_e2e.feature:147`.
- ✅ Scenario: Name and list size — unchanged, `locations_device_time_e2e.feature`.
- ✅ Scenario: No violations — unchanged, `locations_device_time_e2e.feature:17` ("Accessibility of the device time location…", light and dark). The device row gets the Grid lock from the same `LocationRow` path as every row.
- ✅ Scenario: Wall-clock times of any location set the range — `meeting_range_wall_times.feature:6`.
- ✅ Scenario: Times that break the invariants are refused — `meeting_range_wall_times.feature:20`.
- ✅ Scenario: The whole reference day — `meeting_range_wall_times.feature:36`.
- ✅ Scenario: Open the field — unchanged, `time_selection_wall_time_input_e2e.feature`, `settings_hour_format_unit.feature`.
- ✅ Scenario: Open the field in the 12-hour format — unchanged, `settings_hour_format_unit.feature`.
- ✅ Scenario: No input for an unknown zone — unchanged, `time_selection_wall_time_input_unit.feature`.
- ✅ Scenario: No wall-time input in Grid while a meeting range is set — `grid_view_meeting_lock_unit.feature:28`.

## Mutation

Measured with `npx stryker run --mutate '<files>'` in `packages/client`: five runs of at most 5 files each, run one at a time.

| File | Score | Survivors / no coverage |
|---|---|---|
| `src/model/reduceMeetingRangeWallTimes.ts` | 96.15% | 2 (`e instanceof RangeError` → `true`, `:63` and `:92`: the rethrow paths) |
| `src/model/wallClock.ts` | 100% | — |
| `src/presenter/locationMeetingRange.ts` | 100% | — |
| `src/controller/useMeetingRange.ts` | 96.61% | 2, in code this change did not touch (`:95-96`) |
| `src/views/shared/MeetingRangeInput.tsx` | 98.61% | 1 (`:74`, `endText === initialEndText` → `true`; R5) |
| `src/views/shared/LocalDateTime.tsx` | 98.63% | 1 (`:62`, default `cityLabel`) |
| `src/views/shared/LocationMenu.tsx` | 95.88% | 3 survived and 1 with no coverage, all in lines this change did not touch |
| `src/views/shared/DragHandle.tsx` | 100% | — |
| `src/views/shared/LocationRow.tsx` | 100% | — |
| `src/views/shared/useSortableLocationRow.ts` | 88.89% | 1 (`:49`, `setItemRef` body → `{}`; R3) |
| `src/views/shared/wallTimeFieldKeys.ts` | 100% | — |
| `src/views/shared/WallTimeInput.tsx` | 100% | — |
| `src/views/shared/ZoneRowContent.tsx` | 100% | — |
| `src/views/shared/locationRowVariant.ts` | 100% | — |
| `src/model/reduceWallTime.ts` | 96.00% | 2, in code this change did not touch |
| `src/model/locations.ts` | 100% | — |
| `src/views/grid/GridView.tsx` | 100% | — |
| `src/views/shared/LocationList.tsx` | 100% | — |
| `src/components/ui/dialog.tsx` | 100% | — |
| `src/app/MainPage.tsx` | 100% | — |
| `src/views/grid/HourFrame.tsx` | 100% | — |
| `src/views/grid/MeetingFrame.tsx` | 100% | — |
| `src/views/grid/MeetingHandle.tsx` | 100% | — |

Not measured: `src/views/shared/hourGridSlots.ts` (types only, no mutants) and `src/controller/useMeetingRangeSetup.tsx` (test setup).

## Findings

### R1 — CRITICAL — Task 2.3 ticked without the stored-document assertion
- Location: `packages/client/src/test/features/meeting_range/steps/meeting_range_wall_times.steps.ts:31`
- Rule: `.gnomish` review instructions (a task ticked but not done is CRITICAL); `tasks.md` 2.3
- Problem: Task 2.3 is ticked `[x]` and asks the unit BDD to "also assert, with `createInMemoryLocationBackend`, that the saved document has no `meeting` key after the command". The steps run only on `createMeetingWorld()` (a bare store over the reducer) with no backend, and no step checks the stored document. The rest of 2.3 (3 scenarios, `@FR5`, real store and reducer) is done, but the ticked task is not fully done.
- Impact: At the model+store level, nothing proves that a range set from wall-clock times is never persisted (ADR-0011). A regression that writes `meeting` through this new command would pass the feature. Only the hook-level `save` spy in `useMeetingRange.input.test.tsx:101` would catch it.
- Fix: Add a step "And the stored document has no meeting range" to "Wall-clock times of any location set the range" in `meeting_range_wall_times.feature`. In the steps, run that scenario on `createStoredListApp` from `steps/meetingRangeStoredApp.ts`, dispatching through `useMeetingRange().confirmMeetingRangeInput` or the store. Assert as `meeting_range_commands.steps.ts:72-76` does: `Object.keys(backend.document)` does not contain `"meeting"`.
- Fix risk: The stored app goes through the controller, so the "When" step must dispatch in `act` and use the immediate write scheduler the helper already wires. The outline's other assertions keep using the store world.
- Status: fixed
- Resolution: added scenario "A range typed in wall-clock times is never stored" to meeting_range_wall_times.feature, run on createStoredListApp through confirmMeetingRangeInput; it asserts the in-memory backend document has no meeting key.

### R2 — WARNING — English range error text differs from the spec
- Location: `packages/client/src/locales/en.json:126`
- Rule: `.claude/rules/i18n.md`; spec `grid-view` → "Meeting range input"
- Problem: The spec and FR4 fix the English text of the range error as "The meeting must lie within the day, in 15-minute steps". `en.json` has `"rangeInputError": "The meeting must fit inside the day, in 15-minute steps"`. No test checks the English text: every scenario that shows this error runs in Russian.
- Impact: An English-language user who types an invalid range sees a text that is not the one the spec defines, and nothing would catch a further drift.
- Fix: Set `meeting.rangeInputError` in `en.json` to "The meeting must lie within the day, in 15-minute steps". Optionally add an English case to `MeetingRangeInput.test.tsx` that asserts the text.
- Fix risk: none. No test or baseline uses the English string: grep for "fit inside" in `packages/client/src` finds only the locale.
- Status: fixed
- Resolution: en.json meeting.rangeInputError now reads "The meeting must lie within the day, in 15-minute steps"; MeetingRangeInput.test.tsx got an English case asserting the text.

### R3 — WARNING — `useSortableLocationRow.ts` mutation score below 90%
- Location: `packages/client/src/views/shared/useSortableLocationRow.ts:49`
- Rule: `CLAUDE.md` → Mutation testing (minimum acceptable ≥90%); `.claude/rules/tdd-workflow.md`
- Problem: The new file scores 88.89% (8 of 9 killed). The surviving mutant empties the body of `setItemRef`, so `cardRef.current` and dnd-kit's `setNodeRef` are never set, and no test fails.
- Impact: If the `<li>` stops being registered, the row is no longer a sortable node and the drop settle animation has no element. Reordering then breaks (or skips its settle animation) with green unit tests. The hook is the point of the D1 extraction, and the lock now depends on it.
- Fix: Add a test in `src/views/shared/LocationRow.dragging.test.tsx` (or a new `useSortableLocationRow.test.tsx`) that fails when the `<li>` is not registered. For example, spy on the row `<li>`'s `getBoundingClientRect` and assert dnd-kit measures it when the keyboard picks the row up (Space on the drag handle). Then re-run `npx stryker run --mutate 'src/views/shared/useSortableLocationRow.ts'`.
- Fix risk: Test-only. jsdom rects are all zero, so the assertion must check that the element was measured or registered, not where it moved; it must not depend on timing.
- Status: fixed
- Resolution: new useSortableLocationRow.test.tsx asserts setNodeRef receives the list item; Stryker on the file now kills 9 of 9 (100%).

### R4 — SUGGESTION — Traceability line inserted inside an existing JSDoc sentence
- Location: `packages/client/src/views/grid/MeetingHandle.tsx:42-44`
- Rule: `.claude/rules/traceability.md`
- Problem: The new line `Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).` was inserted between "Implements FR9, FR10, FR12, NFR-A1, NFR-A2, NFR-R1, UX1, UX2 of" and its continuation "add-grid-meeting-range-and-share (D6).".
- Impact: The JSDoc now reads as if the old requirements belong to this change, and the next line has no requirement ids. The link of `add-grid-meeting-range-and-share` to this component is garbled for anyone tracing those ids.
- Fix: Move the new line after `add-grid-meeting-range-and-share (D6).`.
- Fix risk: none (comment only).
- Status: fixed
- Resolution: moved the new Implements line after the add-grid-meeting-range-and-share (D6) sentence in MeetingHandle.tsx.

### R5 — SUGGESTION — Blur after changing only the end field is untested
- Location: `packages/client/src/views/shared/MeetingRangeInput.tsx:74`
- Rule: `.claude/rules/tdd-workflow.md` (survived mutant = missed scenario)
- Problem: The mutant `endText === initialEndText` → `true` survives. No test changes only the end field and then moves the focus out. FR4 says leaving "both fields after a text changed" confirms, whichever text changed.
- Impact: If someone drops the end-text comparison, typing a new end time and tapping elsewhere would close the input without setting the range, and no test would fail.
- Fix: Add an `it` in `MeetingRangeInput.test.tsx` that types a new end text only, tabs out of the wrapper, and expects `onConfirm` to be called with the unchanged start and the new end.
- Fix risk: none (test-only).
- Status: fixed
- Resolution: added MeetingRangeInput.test.tsx case changing only the end text and leaving focus; Stryker on the file kills 72 of 72 (100%).

## Verdict

Not ready. R1 (CRITICAL) blocks: task 2.3 is ticked but its stored-document assertion was never written. R2 (English range error text) and R3 (`useSortableLocationRow.ts` below 90% mutation) are WARNINGs the fix-code stage should fix as well; R1 and R3 add tests only, R2 is a one-line locale fix.
