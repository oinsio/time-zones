# Specs review: fix-grid-meeting-range-lock-and-layering

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 30/30 |
| Contradictions | 0 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 0 |

## Freshness

- ✅ `HourFrame` / `MeetingFrame` are `z-[1]`, the sticky boxes `z-[2]` with `focus-within:z-[4]`, the handles `z-[3]`, a dragged row `relative z-10`, an open menu `z-20` — `views/grid/HourFrame.tsx:20`, `views/grid/MeetingFrame.tsx:21`, `views/shared/locationRowVariant.ts:37,67`, `views/grid/MeetingHandle.tsx:90`, `views/shared/LocationRow.tsx:128`, `views/shared/LocationMenu.tsx:164` (paths under `packages/client/src/`).
- ✅ Dialog overlay and content are `fixed` with no z-index — `components/ui/dialog.tsx:23,26`; the date bar is `<footer className="sticky bottom-0 …">` with no z-index and holds the notices region (`role="status"`, `absolute … bottom-full`) — `app/MainPage.tsx:64-72`.
- ✅ `ZoneRowContent` passes `bg-surface text-sm text-muted-foreground` to `ZoneLine` (`views/shared/ZoneRowContent.tsx:120`), whose parts carry `bg-surface` themselves (`views/shared/ZoneLine.tsx:30-31`); the time button carries `bg-surface` on its `min-h-11 min-w-11` box (`views/shared/LocalDateTime.tsx:95`); the other header texts are already glyph-level `<span className="bg-surface …">` (`ZoneRowContent.tsx:87,95,111`, `LocalDateTime.tsx:66,72`).
- ✅ The tests that assert the old z classes exist at the cited lines: `HourFrame.test.tsx:27`, `MeetingFrame.test.tsx:34`, `MeetingHandle.test.tsx:49`, `LocationRow.dragging.test.tsx:60`, `ViewLocationList.grid.test.tsx:94`; no other `z-[n]`/`z-10`/`z-20` exists under `src/` (incl. `src/test/`), so the 4.1 grep is reachable.
- ✅ `LocationRow.tsx` is 199 lines and holds `useSortable`, `cardRef`, `useDropSettleAnimation`, `onTransitionEnd` (`LocationRow.tsx:1,23,106-139`); `useMeetingRange.ts` is 144 lines; `LocationMenu` closes on outside press/focus through `rootRef.current?.contains` (`LocationMenu.tsx:64,125`).
- ✅ `HourGridSlots` has `renderHourStrip`, `frame`, `meetingRangeOf`, `panelRef`, `panelStyle` (`views/shared/hourGridSlots.ts:12-20`); `PresentedLocationMeetingRange` has `spanLabel`, `dayShiftLabel` (`presenter/locationMeetingRange.ts:14-18`); `MeetingHandleSlider` exists (`views/grid/MeetingHandle.tsx:45`).
- ✅ Model owners: private `isCanonicalTime` in `model/reduceWallTime.ts:33`, `withoutMeetingRange` used by `SET_WALL_TIME` (`reduceWallTime.ts:85`), `resolveWallClock` with `compatible` (`model/wallClock.ts:15-25`), `reduceSetMeetingRange` validating with `isValidMeetingRange` (`model/reduceMeetingRange.ts:32-50`), `WallTimeTarget` and `SET_MEETING_RANGE` in `model/locationCommands.ts:2,26,80`; `useWallTimeInput` parses with `parseWallTimeInput(text, getDayPeriodMarkers(language))` (`controller/useWallTimeInput.ts:41`).
- ✅ i18n keys reused exist: `locations.wallTimeInputError` «Введите время в формате ЧЧ:ММ», `meeting.startHandle` / `meeting.endHandle` «Начало встречи» / «Конец встречи» (`locales/ru.json:34,121-122`).
- ✅ Test helpers and steps named by tasks exist: `setSampleMeeting` (`meetingE2eHelpers.ts:67`), `rowsOf`/`centreOf`/`isTopmostAt` (`hourGridE2eHelpers.ts:22-37`), `menuButton` (`locationsE2eHelpers.ts:122`), `createGridViewWorld` (`main_page/steps/gridViewWorld.tsx:43`), `createSwitchableClock` (`test/switchableClock.ts:9`), `createInMemoryLocationBackend` (`adapters/inMemoryLocationRepository.ts:20`), `locationRowFixture.tsx`, and the step texts "location writes are counted" / "no location write happened" (`locations_reorder_checks_e2e.steps.ts:36,40`), the list/home regex and "the locations interface language is Russian" (`home_location/steps/home_location_e2e.steps.ts:23,36`), "the screen is {int} by {int} px for the locations" (`locations_reorder_drag_e2e.steps.ts:184`), "the locations screen matches the approved screenshot" (`locations_layout_e2e.steps.ts:65`); the E2E device zone is `Asia/Almaty` (`playwright.bdd.config.ts:69`); scripts `test:bdd:gen`, `check:bundle-size`, `check:legacy-build`, `typecheck`, `lint` exist (`packages/client/package.json`).
- ✅ Every MODIFIED requirement exists in `openspec/specs/` under the same name and its restatement keeps the stable text and scenarios, adding only this change's sentences and scenarios: `grid-view` → "Hour frame lies behind texts", "Meeting frame and dimmed cells", "Time selection on the hour strip", "Meeting span in grid rows" (old "The span stays the button that opens the wall-time input."), "Accessible meeting state"; `locations` → "Reorder cards by dragging", "Reorder cards with the keyboard", "Location menu", "Accessible device time location"; `time-selection` → "Wall-time input on every row".
- ✅ Nothing is implemented yet: no `MeetingRangeInput`, `SET_MEETING_RANGE_WALL_TIMES`, `areRowControlsLocked` or `z-page-bar` in `packages/client/src` or `docs`; the archived `add-grid-meeting-range-and-share` (`openspec/changes/archive/2026/11/2026-11-10-…`) built the meeting state this change fixes; the only other active change, `add-pr-preview-deploy`, touches only `app-delivery`.
- ✅ The Add location button is not shown in the meeting state (the meeting bar takes the header's place, `app/MainPage.tsx:12-13,52`), so FR6's "search opened … while no meeting range is set" matches the app.
- ✅ The screenshot design pictures named by H1 exist (`docs/design/screens/grid-desktop-light.png`, `grid-desktop-meeting-light.png`, …).
- ❌ tasks.md:34 (5.2) states that the unchanged scenario "Meeting frame colour and layers" keeps passing, and 4.4 updates only new behaviour; but existing tests find the span by its wall-time name in the meeting state: `grid_view/steps/grid_view_meeting_e2e.steps.ts:175` and `grid_view/steps/grid_view_meeting_spans_e2e.steps.ts:29` use `name: /^Enter time/` (English interface), which the new name "Enter meeting time — {city}, {span}" does not match; `views/shared/LocalDateTime.test.tsx:170-174` asserts that with `meetingRange` the button opens the wall-time input (see R1).

## Coverage

| Id | proposal | spec | task |
|---|---|---|---|
| FR1 | ✅ | ✅ grid-view "Row controls are locked…"; locations ×4; time-selection | ✅ 4.3, 4.5, 5.1 |
| FR2 | ✅ | ✅ grid-view "Row controls are locked…" (scenario: free after it) | ✅ 4.3, 4.5, 5.1 |
| FR3 | ✅ | ✅ grid-view "Meeting range input", "Meeting span in grid rows" | ✅ 3.1, 4.4, 4.5 |
| FR4 | ✅ | ✅ grid-view "Meeting range input" | ✅ 3.2, 4.4, 4.5, 5.1 |
| FR5 | ✅ | ✅ meeting-range "Set a meeting range from wall-clock times" | ✅ 2.1–2.3 |
| FR6 | ✅ | ✅ grid-view "Grid layers stay under…" / "Dialogs cover the grid" | ✅ 4.1, 5.2 |
| FR7 | ✅ | ✅ grid-view "Rows scroll under the date bar", "An open location menu lies above the date bar" | ✅ 4.1, 4.3b, 5.2 |
| FR8 | ✅ | ✅ grid-view "Hour frame lies behind texts", "Meeting frame and dimmed cells" | ✅ 4.2, 5.2 (oracle, see R2) |
| NFR-A1 | ✅ | ✅ grid-view "Accessible meeting state" | ✅ 4.4, 5.1 |
| NFR-A2 | ✅ | ✅ grid-view "Accessible meeting state", "Time selection on the hour strip" | ✅ 5.1 |
| NFR-R1 | ✅ | ✅ grid-view "The open input fits on a phone" | ✅ 5.1 |
| NFR-R2 | ✅ | ✅ grid-view "Approved screenshots with dialogs over the grid" | ✅ 5.3 (projects, see R3) |
| UX1 | ✅ | ✅ grid-view "Row controls are locked…" (opacity 0.4, default cursor) | ✅ 4.3, 4.5 |
| UX2 | ✅ | ✅ grid-view "Meeting range input" | ✅ 4.4 |
| UX3 | ✅ | ✅ grid-view "Hour frame lies behind texts" | ✅ 5.2 |
| G1 | ✅ | n/a — met by FR1, FR2, M1 | n/a |
| G2 | ✅ | n/a — met by FR3–FR5, NFR-A2, M2 | n/a |
| G3 | ✅ | n/a — met by FR6, FR7, M4, M5 | n/a |
| G4 | ✅ | n/a — met by FR8, M6 | n/a |
| NG1 | ✅ | n/a — nothing locks Cards; "Cards keeps its controls" asserts it | n/a |
| NG2 | ✅ | n/a — no artifact builds a cross-day range | n/a |
| NG3 | ✅ | n/a — strip keys untouched | n/a |
| NG4 | ✅ | n/a — the input uses the row's date (D3/D4) | n/a |
| NG5 | ✅ | n/a — D5 adds only z tokens to the date bar and dialogs | n/a |
| M1 | ✅ | n/a | ✅ 4.5, 5.1 |
| M2 | ✅ | n/a | ✅ 2.1, 3.2, 4.5 (4 of 5 pairs literally; the English pair is tested as `10 am`–`12:30 pm`) |
| M3 | ✅ | n/a | ✅ 2.1, 4.5 |
| M4 | ✅ | n/a | ✅ 5.2 |
| M5 | ✅ | n/a | ✅ 5.2 |
| M6 | ✅ | n/a | ✅ 5.2 (oracle, see R2) |

The proposal defines no `Q` ids ("Open Questions: None"); FR8 is driven by UX3 and M6, both covered by 5.2.

## Consistency

None.

## Findings

### R1 — WARNING — Existing span tests break under the new span name and behaviour, and the plan says they keep passing
- Location: `openspec/changes/fix-grid-meeting-range-lock-and-layering/tasks.md:34` (5.2: "The unchanged scenarios of the modified requirements keep passing … Meeting frame colour and layers") and `tasks.md:28` (4.4)
- Rule: `.claude/rules/tdd-workflow.md` ("When modifying existing code: verify a test exists first")
- Problem: In the meeting state the span gets the name `meeting.rangeInputLabel` — English "Enter meeting time — {city}, {span}" (FR3, D4) — and opens the meeting range input instead of the wall-time input. Existing tests rely on the old name and behaviour, and no task updates them: `packages/client/src/test/features/grid_view/steps/grid_view_meeting_e2e.steps.ts:175` (step "where the meeting frame crosses a header text of {string}…", used by "Meeting frame colour and layers") and `grid_view/steps/grid_view_meeting_spans_e2e.steps.ts:29` (step `"…" shows the span "…"`, used by `grid_view_meeting_e2e.feature:18,84-87` and `grid_view_meeting_handles_e2e.feature:29`) find the span with `getByRole("button", { name: /^Enter time/ })` in an English interface; `views/shared/LocalDateTime.test.tsx:170-174` ("should open the wall-time input with the local time", inside the meeting-range block) asserts that with `meetingRange` the button opens the wall-time input, and `LocalDateTime.test.tsx:147-150` finds the span under the wall-time name.
- Impact: Implemented as written, these existing E2E scenarios and unit tests fail, which contradicts task 5.2's "keeps passing" check and the 6.2 `pnpm test` run. The implementer then has to guess whether to change the tests or the name, and could weaken assertions while doing it.
- Fix: In task 4.4, add: "Update `src/views/shared/LocalDateTime.test.tsx`'s meeting-range block: the span is named «Ввести время встречи — {city}, 23:00–01:00» (pass `cityLabel`), and replace 'should open the wall-time input with the local time' with the new test that `MeetingRangeInput` opens". In task 5.1, add: "Change the span locator in `steps/grid_view_meeting_e2e.steps.ts:175` and `steps/grid_view_meeting_spans_e2e.steps.ts:29` to `/^Enter meeting time/` (the meeting state only); run `npx playwright test -c playwright.bdd.config.ts --project chromium --grep \"Meeting frame colour and layers|Spans of the sample meeting|Tap on column 9|Drag the end handle one hour right\"`: passes."
- Fix risk: none — the edits only touch tests of behaviour the change replaces on purpose, and keep their assertions (span text, colour, topmost element). `meetingGridQueries.tsx:66` (`/^Enter time|^Ввести время/`, Russian unit tests) already matches «Ввести время встречи …» and needs no change.
- Status: fixed
- Resolution: tasks.md 4.4 now updates the meeting-range block of `LocalDateTime.test.tsx` (lines 147–150 find the span by «Ввести время встречи — {city}, 23:00–01:00» with `cityLabel`; lines 170–174 are replaced by the "opens `MeetingRangeInput`" test). It also updates `spanOf` in `meetingGridQueries.tsx:66` to `/^Enter meeting time|^Ввести время встречи/`, because the meeting unit session defaults to English (`meetingGridSession.ts:20`), so the review's "needs no change" was wrong. 4.4 then runs `grid_view_meeting_unit.steps.tsx` and `grid_view_meeting_share_unit.steps.tsx`. Task 5.1 changes the span locators at `grid_view_meeting_e2e.steps.ts:175` and `grid_view_meeting_spans_e2e.steps.ts:29` to `/^Enter meeting time/` and runs the four affected scenarios. Task 5.2's "keep passing" check now points to those updated locators.

### R2 — WARNING — The frame-border coverage check of D7 counts elements painted below the frame, so it cannot pass
- Location: `openspec/changes/fix-grid-meeting-range-lock-and-layering/design.md:157` (D7) and `tasks.md:34` (5.2, "the in-page `elementsFromPoint` check of D7, sampling every 2 px along both borders")
- Rule: `.claude/rules/test-planning.md` (every FR must have a working automated test)
- Problem: D7 defines the FR8/M6 check as "every element from `document.elementsFromPoint` inside a grid row with a non-transparent `background-color` must hold the point in the client rect of one of its text nodes, or be a row note or an `input`", sampled along both borders over the whole frame height. `elementsFromPoint` returns every element under the point, including those painted below the frame, and D7's own Negative says it cannot tell above from below. Along a border inside a row there are always such elements with a background that are no text: the hour cells, which have an inline `backgroundColor` per day period (`packages/client/src/views/grid/HourCellView.tsx:58-59`), and the row `<li>` itself, which has `bg-surface` (`views/shared/LocationRow.tsx:146`). Both lie below the frame (they are not positioned; the frame is `z-[1]`).
- Impact: Implemented as written, the scenario "The frame border runs through the empty parts of the header" fails on all 4 examples whatever D6 does. The implementer either cannot finish 5.2 or loosens the check ad hoc, and FR8/M6/UX3 end up with no real test.
- Fix: In D7 and task 5.2, limit the check to what is painted above the frame: sample only the parts of each border that cross a row's sticky header box or notes box (`headerBox` / `notesBox` of `locationRowVariant.ts`). For each point, check only the elements of `elementsFromPoint` that are descendants of that box. Every such element with a non-transparent `background-color` must hold the point in the client rect of one of its text nodes, or be a row note or an `input`. Reword M6's "covered by a non-transparent background" check accordingly in D7 ("inside the header and notes boxes").
- Fix risk: Low. The sticky boxes (`z-grid-box`) are the only parts of a row that `HourFrame.tsx:9-12` and D5 place above the frame, so restricting to them loses no case FR8 covers. The meeting handles lie outside the rows and stay excluded as before.
- Status: fixed
- Resolution: design.md D7 (Decision) now samples only the border points inside a row's sticky `headerBox` / `notesBox` (`locationRowVariant.ts`, `z-grid-box` by D5). At each point it inspects only that box's descendants among the elements `elementsFromPoint` returns, and states that the hour cells and the row `<li>` below the frame are never inspected. The D7 Negative explains why. Task 5.2 restates the same limit and adds a guard: at least one sampled point per row must lie in an empty part of the header box, so the check cannot pass vacuously. The spec scenario ("covered by an element with a background") and M6 already speak of covering and needed no edit.

### R3 — WARNING — Screenshot baselines are written for chromium only, but checked on every project
- Location: `openspec/changes/fix-grid-meeting-range-lock-and-layering/tasks.md:35` (5.3) and `tasks.md:49` (H1)
- Rule: `.claude/rules/test-planning.md` (visual regression in CI); `.gnomish/stages/specify/handoff.md` (every `- [ ]` task must be finishable by the implement stage)
- Problem: Baselines are stored per project (`SCREENSHOT_PATH_TEMPLATE = "src/test/features/__screenshots__/{projectName}/{arg}{ext}"`, `packages/client/playwright.bdd.config.ts:63-64`). The config has the projects `chromium` and `mobile-chrome` (`playwright.bdd.config.ts:131-141`), and both folders hold the existing Grid baselines (84 files each). Task 5.3 writes the 2 new baselines and re-approves the changed Grid/meeting baselines only with `--project chromium`. It then requires `npx playwright test -c playwright.bdd.config.ts --grep "Approved screenshots"` to pass "on every project". H1 lists only `__screenshots__/chromium/…`.
- Impact: The final command of 5.3 fails on `mobile-chrome`: the 2 new baselines are missing there, and its Grid/meeting baselines still show the frame broken beside texts. The task cannot be ticked, or mobile baselines get written unreviewed outside the H1 list.
- Fix: In task 5.3, drop `--project chromium` from both `--update-snapshots` commands so that `chromium` and `mobile-chrome` baselines are written and re-approved. In H1 and the 7.1 README section, list the new and re-written files under both `__screenshots__/chromium/` and `__screenshots__/mobile-chrome/`.
- Fix risk: H1 has twice as many images to review. The scenario's "the screen is {int} by {int} px for the locations" step sets the viewport on both projects, so the shots stay comparable. No rule or spec is affected.
- Status: fixed
- Resolution: task 5.3 now writes the new baselines and re-approves the changed Grid/meeting baselines without `--project`, so both `chromium` and `mobile-chrome` get them (baselines are per project via `SCREENSHOT_PATH_TEMPLATE`). It lists the re-written files of both `__screenshots__/` folders in the H1 README section. Task 7.1's Verify line and the H1 follow-up now name the new baselines under both `chromium/` and `mobile-chrome/` (2 per project) and the re-written baselines of either project.

## Verdict

Needs revision. None of the findings blocks the design: the change matches the task (all five defects), the stable specs, ADR-0002/0003/0004/0009/0011 and the layering rules. Before implementation, R1, R2 and R3 (all WARNING) should be fixed in `tasks.md` and `design.md`. Each of them otherwise leaves a task whose own verification command cannot pass.
