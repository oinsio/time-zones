# Review: add-grid-meeting-range-and-share

## Summary

| Item | Value |
|---|---|
| Tasks verified | 29/29 |
| Requirements traced | 104/107 |
| CRITICAL | 0 |
| WARNING | 0 |
| SUGGESTION | 4 |

## Tasks

Paths are relative to `packages/client/` unless they start with `docs/`, `openspec/` or `temporary-docs/`.

- ✅ 1.1 Glossary: `docs/glossary/time-selection.md:23` (Meeting range with *Code:* `MeetingRange`, `SET_MEETING_RANGE`, `CLEAR_MEETING_RANGE`, `getMeetingSpan`, `getLocationMeetingRange`, `useMeetingRange`), `:25` (Meeting handle → `MeetingHandle`, `getMeetingRangeAfterHandleMove`, `MeetingHandleSlider`); Share meeting says "text only" and Meeting share text names `presentMeetingShareText`; `grep "(planned"` finds no Meeting / Share meeting / Day shift entry; `TextSharing` in `docs/glossary/architecture.md` (2 hits), Meeting copied notice in `docs/glossary/app-shell.md`, `@meeting-range` in `docs/glossary/views.md`; every glossary file under 200 lines.
- ✅ 1.2 `docs/architecture/open-questions.md:19` — Q8 appears once, under `## Resolved` (line 8), "Text only … no link"; `@meeting-range` in `docs/architecture/views.md`; `getDayShift` in `docs/architecture/domain-model.md`.
- ✅ 2.1 `src/model/meetingRange.test.ts`, `src/model/dayShift.test.ts` exist and cover the listed tables (Stryker: `dayShift.ts` 100 %, `meetingRange.ts` 98.81 %).
- ✅ 2.2 `src/model/meetingRange.ts:55-209` (`isValidMeetingRange`, `getMeetingRangeOfCells`, `getMeetingHandleLimits`, `getMeetingRangeAfterHandleMove`, `getMeetingRangeAtHandleMinutes`, `getMeetingSpan`, `moveMeetingRangeToDay`, `getLocationMeetingRange`), `src/model/dayShift.ts`, `getHourCellStart` at `src/model/hourCells.ts:114`, constants in `src/constants/meeting.ts`.
- ✅ 2.3 `src/model/reduceMeetingRange.ts:44-99` (`reduceSetMeetingRange`, `reduceClearMeetingRange`, `followMeetingRange`); `src/model/locations.ts:93-99` wraps every outcome in `followMeetingRange`; removal in `reduceReferenceMoment.ts` (`RESET_TO_NOW`), `reduceSelectInstant.ts:45,57`, `reduceWallTime.ts:73,85`; date move through `moveMeetingRangeToDay` in `moveToDate`; `src/model/reduceMeetingRange.test.ts` (243 lines). `locations.ts` is 196 lines. Untested branch noted in R1.
- ✅ 3.1 `src/presenter/locationMeetingRange.ts`, `meetingBar.ts`, `meetingHandles.ts`, `meetingShareText.ts` with their tests; `meeting` namespace and `locations.dayShiftEarlier/Later` in both `src/locales/en.json` and `ru.json` (Stryker 100 % on all four presenters).
- ✅ 4.1 `src/ports/textSharing.ts` (`ShareOutcome`, `TextSharing`), `src/adapters/browserTextSharing.ts`, `inMemoryTextSharing.ts`, `textSharing.contract.ts` run against both in `textSharing.test.ts`.
- ✅ 5.1 `src/controller/useMeetingRange.ts`, `useMeetingShare.ts`, `useMeetingBar.ts` with tests; `hasMeetingRange` in `useHourGrid.ts`. The "same step" test does not use the dispatch spy the task names and cannot catch the guard's removal (R2).
- ✅ 6.1 `src/test/features/meeting_range/meeting_range_commands.feature` (10 tagged scenarios) with `steps/meeting_range_commands.steps.ts`.
- ✅ 6.2 `meeting_range_handles.feature` ("Keyboard moves of the handles", "A drag cannot cross the other end") and `meeting_range_day_shift.feature` with steps.
- ✅ 6.3 `meeting_range_share.feature` (3 scenarios) with `steps/meeting_range_share.steps.ts`.
- ✅ 6.4 `src/test/features/grid_view/grid_view_meeting_budget.feature` with `steps/grid_view_meeting_budget.steps.ts:98-104` (0 formatters, 0 transition lookups, strips by identity, no `performance.now()`); `src/test/benchmarks/meetingRange.bench.ts`.
- ✅ 7.1 Tokens in `src/styles/tokens.css`, names in `tailwind.config.ts`; `showsMeetingRange: true` at `src/views/index.ts:25`; `src/views/viewRegistry.test.ts:36` asserts Grid has it and Cards not.
- ✅ 7.2 `src/views/grid/useHourCellSelection.ts`, `HourStrip.tsx`, `MeetingFrame.tsx`, `MeetingHandle.tsx`, `meetingHandleRow.ts`, `useMeetingHandleDrag.ts`, `useHourStripScroll.ts` (third argument), `GridView.tsx`; tests `HourStrip.selection.test.tsx`, `HourStrip.selectionGesture.test.tsx`, `MeetingFrame.test.tsx`, `MeetingHandle.test.tsx`, `useMeetingHandleDrag.test.tsx` / `.edges.test.tsx` (touch fallback with `PointerEvent` stubbed), `useHourStripScroll.test.tsx`. Every grid production file under 200 lines.
- ✅ 7.3 `src/views/shared/MeetingBar.tsx`, `RowNotes.tsx`, `LocalDateTime.tsx` (span and day shift mark), `ZoneRowContent.tsx`, `LocationRow.tsx` (199 lines), `hourGridSlots.ts` (`meetingRangeOf`), `locationRowVariant.ts` (`focus-within:z-[4]`); tests `MeetingBar.test.tsx`, `LocalDateTime.test.tsx`, `ViewLocationList.grid.test.tsx`.
- ✅ 7.4 `src/app/MainPage.tsx` (`meetingBar`), `src/app/AppShell.tsx:84-166` (`useMeetingBar`, `useMeetingShare`, focus after Clear), `src/app/MeetingShareNotice.tsx`; tests `MainPage.test.tsx:90-121`, `AppShell.meeting.test.tsx`.
- ✅ 7.5 `src/test/features/grid_view/grid_view_meeting_unit.feature` (9 tagged scenarios) with `steps/grid_view_meeting_unit.steps.tsx`; `grid_view_hour_frame_unit.feature:37` "A tap on a cell sets a one-hour meeting range"; the old wording appears nowhere in `src/`.
- ✅ 8.1 `src/test/features/grid_view/grid_view_meeting_e2e.feature` (11 tagged scenarios) with `steps/grid_view_meeting_e2e.steps.ts` and `steps/grid_view_meeting_spans_e2e.steps.ts`.
- ✅ 8.2 `grid_view_meeting_handles_e2e.feature` (9 tagged scenarios) with `steps/grid_view_meeting_handles_e2e.steps.ts` and `grid_view_meeting_handle_keys_e2e.steps.ts`.
- ✅ 8.3 `grid_view_meeting_share_e2e.feature` (6 tagged scenarios) with `steps/grid_view_meeting_share_e2e.steps.ts` (a11y step at `:174-191`).
- ✅ 8.4 `playwright.bdd.config.ts` (`MEETING_RANGE_CONTRACT_TAG_PATTERN`, `grepInvert` array); `grid_view_meeting_contract_e2e.feature`. Re-measured here: `--project view-contract-grid --list` counts "Set, resize, share and clear" = 1; `view-contract-cards` = 0 for it and 1 for "Select a time".
- ✅ 8.5 `src/test/features/main_page/main_page_header_e2e.feature` gains 2 tagged scenarios with steps in `main_page_header_e2e.steps.ts`.
- ✅ 8.6 `grid_view_meeting_screenshots_e2e.feature` and 16 baselines under `src/test/features/__screenshots__/{chromium,mobile-chrome}/Approved-screenshots-of-the-meeting-state-*`.
- ✅ 9.1 Re-measured here (see Mutation): every measured file ≥ 90 %.
- ✅ 9.2 CI is green per the stage premise; I did not re-run build, bundle-size, legacy-build, typecheck, lint or `pnpm test` myself.
- ✅ 9.3 `grep` of `add-grid-meeting-range-and-share` in `src` and the config finds FR1–FR17, NFR-P1, NFR-A1, NFR-A2, NFR-R1, NFR-R2, UX1–UX3.
- ✅ 10.1 `temporary-docs/gnomish/github-oinsio-time-zones-108/handoff/README.md` → `## H1`.
- ✅ 10.2 Same README → `## H2`.
- ✅ 10.3 `handoff/H3-adr-0013-capability-scoped-contract.patch` and `## H3`. The ADR is numbered 0013, not 0012 as the task says; the README records why ("0012 is taken by 'User-chosen view'", which `playwright.bdd.config.ts` already cites as ADR-0012). That is a justified, documented departure.

## Requirements

- ✅ FR1 — `MeetingRange` and `isValidMeetingRange` (`src/model/meetingRange.ts:19,55`), `WorldClockState.meeting` (`src/model/locations.ts`); never stored: scenario "A stored list never carries a meeting range".
- ✅ FR2 — `reduceSetMeetingRange` / `reduceClearMeetingRange` (`src/model/reduceMeetingRange.ts:44,79`); "Set a two-hour meeting", "Invalid ranges are refused", "Clear keeps the moment pinned".
- ✅ FR3 — removal in `reduceReferenceMoment.ts`, `reduceSelectInstant.ts:45`, `reduceWallTime.ts:73`; date move via `moveMeetingRangeToDay` (`meetingRange.ts:178`); "Commands that remove the range", "Next day keeps the meeting", "A shorter day clamps the end".
- ✅ FR4 — `followMeetingRange` (`reduceMeetingRange.ts:90`) applied in `reduceLocations`; "Another home removes the range", "Removing the last location removes the range".
- ✅ FR5 — `onCellClick` (`src/views/grid/useHourCellSelection.ts:64`), Enter/Space at `HourStrip.tsx:63`; `getMeetingRangeOfCells`; "Tap on column 9", "Enter on an hour strip".
- ✅ FR6 — drag in `useHourCellSelection.ts:42-62`, `touch-action` at `HourStrip.tsx:73`; e2e "Drag from column 9 to column 10", "Drag to the left", "A swipe on a scrolling strip sets nothing".
- ✅ FR7 — `MeetingFrame.tsx`, dimming through `MEETING_DIMMED_OPACITY_CLASS` (`HourCellView.tsx:47`); "Frame and dimming of the sample meeting", "Meeting frame colour and layers".
- ✅ FR8 — `presentLocationMeetingRange`, `getDayShift`, span and mark in `LocalDateTime.tsx`; "Spans of the sample meeting", "Day shifts at the start of the sample meeting".
- ✅ FR9 — `MeetingHandleSlider` (`z-[3]`), `getMeetingHandleRow`; e2e "Handles of the sample meeting" (`elementFromPoint` at each handle).
- ✅ FR10 — `getMeetingRangeAtHandleMinutes` + `useMeetingHandleDrag`; "Drag the end handle one hour right", "Drag the start handle past the end", "A drag cannot cross the other end"; touch fallback in `useMeetingHandleDrag.test.tsx:189-236`.
- ✅ FR11 — auto-scroll at `useMeetingHandleDrag.ts:53-89`; e2e edge scenarios on `mobile-chrome`.
- ✅ FR12 — `presentMeetingHandles`, slider attributes at `MeetingHandle.tsx:96-104`; "Slider values of the handles", "Keys on the handles", "Keyboard moves of the handles".
- ✅ FR13 — `MeetingBar.tsx`, `useMeetingBar`, `MainPage` `meetingBar`, focus after Clear at `AppShell.tsx:90-94`; "Durations in the title", "Clear meeting", "The meeting bar replaces the header", "Cards keeps its header with a meeting range".
- ✅ FR14 — `presentMeetingShareText` + `useMeetingShare`; "English text of the sample meeting", "The text follows the hour format".
- ✅ FR15 — `createBrowserTextSharing` (`src/adapters/browserTextSharing.ts`), `useMeetingShare`, `MeetingShareNotice`; contract tests and "Outcomes of sharing" plus the four e2e share scenarios.
- ✅ FR16 — `docs/architecture/open-questions.md:19` (Resolved) and the glossary Share meeting entry; the share scenario asserts no line holds a URL.
- ✅ FR17 — `MEETING_RANGE_CONTRACT_TAG_PATTERN` in `playwright.bdd.config.ts`; `grid_view_meeting_contract_e2e.feature`; `--list` counts re-measured (Grid 1, Cards 0).
- ✅ NFR-P1 — `grid_view_meeting_budget.steps.ts:98-104` (0 formatters, 0 transition lookups, same strips); `src/test/benchmarks/meetingRange.bench.ts`.
- ⚠️ NFR-A1 — names, 44 × 44 px buttons, 24 × 48 px handle hit area and accent focus ring are implemented and tested (`MeetingBar.test.tsx`, `MeetingHandle.test.tsx`, e2e). But the axe step (`grid_view_meeting_share_e2e.steps.ts:182-188`) disables `color-contrast` on dimmed cells, so the requirement as written ("no violations") is not what is checked. FR7 fixes the dimming at opacity 0.4, so code cannot meet both. Handoff H4 asks the human to amend NFR-A1 and the scenario. No code finding: the fix is a spec decision outside the fix-code stage.
- ✅ NFR-A2 — keyboard set/resize/share/clear and Tab order in the e2e share and handle features; notices in the polite region without focus (`AppShell.meeting.test.tsx:87`).
- ✅ NFR-R1 — e2e "Meeting bar on a narrow phone" (320 × 640) and handle rows at 390 × 844.
- ✅ NFR-R2 — `grid_view_meeting_screenshots_e2e.feature` with 16 baselines (visual check against the design is handoff H1).
- ✅ UX1 — tokens `--color-meeting*`, `border-[3px] border-meeting rounded-md` frame, `h-9 w-3` grips; e2e colour and layer scenarios, screenshots.
- ✅ UX2 — step rounding in `getMeetingRangeAtHandleMinutes`, limits in `getMeetingHandleLimits`; e2e edge scenario asserts at most 15 per move.
- ✅ UX3 — `presentMeetingShareText` joins plain lines with `\n`; "English text of the sample meeting" asserts no URL.
- ✅ M1 — e2e "Drag the end handle one hour right" (09:00–11:00, «2 h», New York `23:00–01:00`) plus "Spans of the sample meeting".
- ✅ M2 — `grid_view_meeting_unit.feature:23` / `grid_view_meeting_e2e.feature:76` "22 cells of every row are dimmed and columns 9 and 10 are not".
- ✅ M3 — `meeting_range_handles.feature:6-18` "Keyboard moves of the handles".
- ✅ M4 — "Invalid ranges are refused" (5 rows) and `reduceMeetingRange.test.ts`.
- ✅ M5 — "Commands that remove the range", "Next day keeps the meeting", "Clear keeps the moment pinned".
- ✅ M6 — "English text of the sample meeting" (unit and e2e, exact 5 lines).
- ✅ M7 — "Outcomes of sharing" and the contract tests.
- ⚠️ M8 — 8 screenshots per project pass, but the axe-core part is measured with `color-contrast` off on dimmed cells (same as NFR-A1; pending H4).
- ✅ M9 — budget scenario asserts 0 formatter builds and 0 transition lookups for 50 rows.
- ✅ M10 — Q8 once, under Resolved; `grep "(planned"` finds no meeting entry in `docs/glossary/time-selection.md`.
- ✅ Scenario: English user opens the app — unchanged behaviour; `src/app/AppShell.test.tsx:35`.
- ✅ Scenario: Russian user opens the app — unchanged; `AppShell.test.tsx:35,50`.
- ✅ Scenario: The language changes while the app is open — `settings/settings_language_e2e.feature`.
- ✅ Scenario: The meeting bar title replaces the heading — `AppShell.meeting.test.tsx:50-70` (bar title is the only heading, `document.title` stays the app title).
- ✅ Scenario: Tap on column 9 — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Enter on an hour strip — both features above.
- ✅ Scenario: Drag from column 9 to column 10 — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Drag to the left — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: A swipe on a scrolling strip sets nothing — `grid_view_meeting_e2e.feature` (CDP finger on `mobile-chrome`).
- ✅ Scenario: Frame and dimming of the sample meeting — unit and e2e features.
- ✅ Scenario: A quarter-hour range — `grid_view_meeting_unit.feature`.
- ✅ Scenario: Meeting frame colour and layers — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Spans of the sample meeting — unit and e2e features.
- ✅ Scenario: Clear returns the times — `grid_view_meeting_unit.feature`.
- ✅ Scenario: Handles of the sample meeting — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Drag the end handle one hour right — `grid_view_meeting_handles_e2e.feature:21-29`.
- ✅ Scenario: Drag the start handle past the end — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Finger drag without Pointer Events — component level, `src/views/grid/useMeetingHandleDrag.test.tsx:189-236` (touch drag with `PointerEvent` stubbed to `undefined` reaches `onDragHandleTo`, prevents scrolling) and `.edges.test.tsx:143-184`.
- ✅ Scenario: Dragging the end handle to the right edge on a phone — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Dragging the start handle to the left edge on a phone — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: The hour frame comes back into view after Clear — `grid_view_meeting_handles_e2e.feature`; `useHourStripScroll.test.tsx`.
- ✅ Scenario: Slider values of the handles — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Keys on the handles — `grid_view_meeting_handles_e2e.feature`.
- ✅ Scenario: Durations in the title — `grid_view_meeting_unit.feature`, `src/presenter/meetingBar.test.ts`.
- ✅ Scenario: Clear meeting — unit and e2e features (focus on Add location).
- ✅ Scenario: Meeting bar on a narrow phone — `grid_view_meeting_e2e.feature`.
- ✅ Scenario: Share where the browser can share — `grid_view_meeting_share_unit.feature`, `grid_view_meeting_share_e2e.feature`.
- ✅ Scenario: Closing the share sheet — both share features.
- ✅ Scenario: Copy where the browser cannot share — both share features.
- ✅ Scenario: Neither share nor clipboard — both share features.
- ✅ Scenario: Set, resize, share and clear — `grid_view_meeting_contract_e2e.feature`, listed only by `view-contract-grid`.
- ⚠️ Scenario: No accessibility violations in the meeting state — implemented in `grid_view_meeting_share_e2e.feature`, but the step disables `color-contrast` on dimmed cells (`grid_view_meeting_share_e2e.steps.ts:185-188`) while the delta scenario still says "no violations"; pending handoff H4.
- ✅ Scenario: A handle move re-presents the spans cheaply — `grid_view_meeting_budget.feature`.
- ✅ Scenario: Approved screenshots of the meeting state — `grid_view_meeting_screenshots_e2e.feature`.
- ✅ Scenario: Frame on the current hour — `grid_view_hour_frame_unit.feature` (unchanged).
- ✅ Scenario: Live frame follows the clock — `grid_view_hour_frame_unit.feature`.
- ✅ Scenario: Pinned frame stays — `grid_view_hour_frame_unit.feature`.
- ✅ Scenario: Now returns the frame — `grid_view_hour_frame_unit.feature`.
- ✅ Scenario: Frame crosses every row in the accent colour — `grid_view_hour_frame_e2e.feature` (unchanged).
- ✅ Scenario: No hour frame during a meeting — `grid_view_meeting_unit.feature`, `grid_view_meeting_e2e.feature`; `GridView.tsx:52,62-73`.
- ✅ Scenario: User opens the app — `main_page/main_page_unit.feature` (unchanged).
- ✅ Scenario: Notices stay available — `main_page/main_page_unit.feature`.
- ✅ Scenario: Header keeps its position — `main_page_unit.feature`, `main_page_e2e.feature`.
- ✅ Scenario: The meeting bar title is the only heading — `src/app/MainPage.test.tsx:116-118` (`getAllByRole("heading")` length 1).
- ✅ Scenario: Narrow header — `main_page_header_e2e.feature`.
- ✅ Scenario: Wide header — `main_page_header_e2e.feature`.
- ✅ Scenario: The header opens the search and the settings — `main_page_header_e2e.feature`.
- ✅ Scenario: Slash still opens the search — `main_page_header_e2e.feature`.
- ✅ Scenario: One Add location button — `main_page_header_e2e.feature`.
- ✅ Scenario: Header sizes and accessibility — `main_page_header_e2e.feature`.
- ✅ Scenario: No Add location button on an unreadable list — `main_page_header_e2e.feature`.
- ✅ Scenario: The meeting bar replaces the header — `main_page_header_e2e.feature` (new, tagged).
- ✅ Scenario: Cards keeps its header with a meeting range — `main_page_header_e2e.feature` (new, tagged); `AppShell.meeting.test.tsx:126`.
- ✅ Scenario: One contract run per registered view — `viewContractProjects` in `playwright.bdd.config.ts` (one project per registry entry).
- ✅ Scenario: Grid runs every contract scenario — `VIEW_CONTRACT_PENDING_TAGS` is `{}` (`playwright.bdd.config.ts:55`); Grid lists the meeting scenario too.
- ✅ Scenario: Meeting scenarios run only for views that show the meeting range — re-measured with `--list`: Grid 1, Cards 0, Cards still lists "Select a time"; the flag is guarded by `viewRegistry.test.ts:36`.
- ✅ Scenario: A stored list never carries a meeting range — `meeting_range_commands.feature`.
- ✅ Scenario: Set a two-hour meeting — `meeting_range_commands.feature`.
- ✅ Scenario: Invalid ranges are refused — `meeting_range_commands.feature`.
- ✅ Scenario: Clear keeps the moment pinned — `meeting_range_commands.feature`.
- ✅ Scenario: Commands that remove the range — `meeting_range_commands.feature`.
- ✅ Scenario: Next day keeps the meeting — `meeting_range_commands.feature`.
- ✅ Scenario: A shorter day clamps the end — `meeting_range_commands.feature`.
- ✅ Scenario: Another home removes the range — `meeting_range_commands.feature`.
- ✅ Scenario: Removing the last location removes the range — `meeting_range_commands.feature`.
- ✅ Scenario: Adding a location keeps the range — `meeting_range_commands.feature`.
- ✅ Scenario: Keyboard moves of the handles — `meeting_range_handles.feature:6`.
- ✅ Scenario: A drag cannot cross the other end — `meeting_range_handles.feature`.
- ✅ Scenario: Day shifts at the start of the sample meeting — `meeting_range_day_shift.feature`.
- ✅ Scenario: English text of the sample meeting — `meeting_range_share.feature`.
- ✅ Scenario: The text follows the hour format — `meeting_range_share.feature`.
- ✅ Scenario: Outcomes of sharing — `meeting_range_share.feature`.

## Mutation

Measured here with `cd packages/client && npx stryker run --mutate '<files>'`, six runs, at most five files each, one at a time. The first attempt with five files hit the 10-minute tool limit and was killed, so I re-ran in smaller batches. One dry run failed on an unrelated flaky test (`AppShell settings page should open the page with the settings button and focus its heading`, focus on `<body>`); the identical re-run passed.

| File | Score | Survivors |
|---|---|---|
| `src/model/meetingRange.ts` | 98.81 % | 1 (`<` → `<=` at :194, equivalent) |
| `src/model/dayShift.ts` | 100 % | 0 |
| `src/model/reduceMeetingRange.ts` | 92.86 % | 5 (non-`RangeError` rethrow at :25-26; the same-range short-circuit conditions at :69-71, see R1) |
| `src/presenter/locationMeetingRange.ts` | 100 % | 0 |
| `src/presenter/meetingBar.ts` | 100 % | 0 |
| `src/presenter/meetingHandles.ts` | 100 % | 0 |
| `src/presenter/meetingShareText.ts` | 100 % | 0 |
| `src/adapters/browserTextSharing.ts` | 94.59 % | 2 (missing-API guards at :24, :43; calling `undefined` throws and lands in the same outcome — equivalent) |
| `src/controller/useMeetingRange.ts` | 90.70 % | 4 (non-`RangeError` rethrow at :78-79; same-step guard at :132, see R2) |
| `src/controller/useMeetingShare.ts` | 100 % | 0 |
| `src/controller/useMeetingBar.ts` | 100 % | 0 |
| `src/views/grid/useHourCellSelection.ts` | 97.44 % | 1 (optional chaining) |
| `src/views/grid/useMeetingHandleDrag.ts` | 91.67 % | 7 (optional chaining and defensive null guards, `cancelable` check, cleanup block) |
| `src/views/grid/MeetingHandle.tsx` | 100 % | 0 |
| `src/views/grid/MeetingFrame.tsx` | 100 % | 0 |
| `src/views/grid/meetingHandleRow.ts` | 100 % | 0 |
| `src/views/grid/HourStrip.tsx` | 100 % | 0 |
| `src/views/shared/LocalDateTime.tsx` | 100 % | 0 |
| `src/views/shared/MeetingBar.tsx` | 100 % | 0 |

No file is below the 90 % minimum. Three are below the 95 % target. For `useMeetingHandleDrag.ts` the survivors are defensive guards with no observable effect in jsdom; the two worth a test are R1 and R2.

## Findings

### R1 — SUGGESTION — Re-setting the same range while the reference is not a clean pin is untested
- Location: `packages/client/src/model/reduceMeetingRange.ts:66-74`
- Rule: `.claude/rules/tdd-workflow.md` (mutation target ≥ 95 %; "each survivor indicates a missed scenario or a weak assertion")
- Problem: `reduceSetMeetingRange` returns the same state object only when the range is equal **and** the reference is `PINNED`, `UNIQUE` and has no `wallTimeTarget`. Replacing any of those three conditions with `true` survives Stryker (lines 69, 70, 71), so no test sets an equal range while the reference is not already that clean pin. Such a state is reachable. Take reference zone `America/New_York` with a 15-minute meeting 02:00–02:15 on 7 March 2026, then `SHIFT_DATE` +1: 8 March 02:00 falls in the DST gap, so the reference is pinned at 03:00 with status `GAP` while `meeting` is 03:00–03:15. Arrow Left on the end handle (already at its lower limit, start + 15 min) then dispatches an equal range.
- Impact: FR2 says setting a range pins the moment "status unique". A regression that drops one of these checks would leave the `GAP` status (and its gap note) after a re-set, and no test would fail. The file scores 92.86 %, below the 95 % target.
- Fix: in `src/model/reduceMeetingRange.test.ts` add an `it.each` over three states that hold `meeting` = the sample range but whose `reference` is (a) pinned at the start with `wallClockStatus: WallClockStatus.GAP`, (b) pinned at the start with a `wallTimeTarget` set, (c) `LIVE`. In each, `SET_MEETING_RANGE` with the same start and end must return a new state object whose reference is `PINNED`, `UNIQUE`, at the start, without `wallTimeTarget`. Re-run `npx stryker run --mutate 'src/model/reduceMeetingRange.ts'`.
- Fix risk: none — test only. State (c) cannot arise through commands, but it is a valid unit input for the guard.
- Status: open

### R2 — SUGGESTION — The "drag stays on the same step" test cannot fail
- Location: `packages/client/src/controller/useMeetingRange.test.tsx:106-114` (guard at `packages/client/src/controller/useMeetingRange.ts:132-134`)
- Rule: `.claude/rules/tdd-workflow.md`; task 5.1 of `tasks.md` ("a drag to the same step dispatches nothing new (store `dispatch` spy)")
- Problem: the test asserts `result.current.meeting` keeps its identity after `dragHandleTo(END, 661)`. But even without the guard, the reducer returns the same state object for an equal range (D1), so the memo keeps its identity anyway. Removing the guard survives Stryker (two mutants at :132). The `dispatch` spy that task 5.1 names is not used.
- Impact: D5's "a handle drag dispatches only when the step changes" is unguarded. A regression would dispatch on every `pointermove` of a drag and nobody would notice. `useMeetingRange.ts` scores 90.70 %, just above the minimum.
- Fix: in the test's `renderHook` callback, also read `useContext(LocationsContext)` and return its `store` with the hook result. After `selectCells(9, 10)`, `vi.spyOn(store, "dispatch")` (as task 5.1 says) and assert the spy is not called after `dragHandleTo(MeetingHandle.END, 661)`. Also add a positive case: `dragHandleTo(MeetingHandle.END, 700)` calls it once.
- Fix risk: low. `LocationsProvider` (`src/controller/LocationsProvider.tsx:62`) creates the store internally and the test's `setup` cannot inject one, so the store has to be read from the context. The spy works because the hook calls `store.dispatch` at call time. Test only, no production change.
- Status: open

### R3 — SUGGESTION — Second copy of the UTC-instant parsing rule
- Location: `packages/client/src/model/reduceMeetingRange.ts:14,21-30`
- Rule: `.claude/rules/code-style.md` ("Is any value repeated in 2+ places? → Must be a constant"), `.claude/rules/antipatterns.md` ("Second owner of a concept")
- Problem: `reduceMeetingRange.ts` declares its own `const UTC_DESIGNATOR = "Z"` and a `parseInstant` that rejects text not ending in `Z` and maps `RangeError` from `Temporal.Instant.from` to failure. That is the same rule and the same constant as `reduceSelectInstant.ts:13,32-42`. The ISO-with-`Z` command format now has two owners in the model.
- Impact: a change to how command instants are accepted (for example, also rejecting offsets other than `Z`, or a different error mapping) has to be made twice. Missing one makes `SET_MEETING_RANGE` and `SELECT_INSTANT` accept different texts for the same CLAUDE.md format ("ISO 8601 with Z suffix").
- Fix: move `UTC_DESIGNATOR` and `parseInstant` into one model module, e.g. new `src/model/commandInstant.ts` exporting `parseCommandInstant(text): Temporal.Instant | undefined`. Call it from `reduceMeetingRange.ts` and `reduceSelectInstant.ts`, which then returns `INVALID_INSTANT` when it gets `undefined`. Both are in `src/model/`, so a direct relative import is fine (same module).
- Fix risk: low. `reduceSelectInstant`'s existing tests and mutation run must stay green. Its error code stays `INVALID_INSTANT`, the meeting reducer's stays `INVALID_MEETING_RANGE`.
- Status: open

### R4 — SUGGESTION — `meetingRange.ts` passes the 200-line limit
- Location: `packages/client/src/model/meetingRange.ts:1-209`
- Rule: `CLAUDE.md` ("Files must stay under 200 lines for AI context quality"), `.claude/rules/process-invariants.md` ("Target 100–200 lines per file")
- Problem: the new production file is 209 lines. It holds the range type and invariant, the cell and handle arithmetic, the date move and the per-location view `getLocationMeetingRange`.
- Impact: the project rule is broken by a file this change created. This is a context-quality cost, not a behaviour defect, so the severity is low (the 300-line hard cap is not reached).
- Fix: move `LocationMeetingRange` and `getLocationMeetingRange` (lines 38-42 and 198-209) into a new `src/model/locationMeetingRange.ts` next to `dayShift.ts`, and export them from `src/model/index.ts` as today. `meetingRange.ts` then drops under 200 lines. The glossary *Code:* entry names the function, not the file, so no glossary change is needed.
- Fix risk: low — `src/model/index.ts` re-exports keep every importer (`@/model`) unchanged. `meetingRange.test.ts` imports have to follow the moved function if it imports the file directly.
- Status: open

## Verdict

Ready. No CRITICAL or WARNING findings. Every task has evidence, every measured file is at or above the 90 % mutation minimum, and the four SUGGESTIONs (R1–R4) are non-blocking. The two ⚠️ lines (NFR-A1 / M8 and the a11y scenario) come from the `color-contrast` exception on dimmed cells. Code cannot resolve that against FR7; handoff H4 asks the human to amend the spec.
