# Specs review: refine-meeting-range-entry-and-handles

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 33/34 |
| Contradictions | 3 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 3 |

## Freshness

- ✅ `isValidMeetingRange` requires both ends on the track step through `isOnTrackStep` (proposal.md Why 1) — `packages/client/src/model/meetingRange.ts:44-59`.
- ✅ `getMeetingHandleLimits` keeps a minimum length of one `TRACK_STEP_MINUTES` (design D1) — `model/meetingRange.ts:86-95`.
- ✅ `getMeetingRangeAfterHandleMove` moves `NEXT_STEP` / `PREVIOUS_STEP` by `± TRACK_STEP_MINUTES` from the current value (design D1) — `model/meetingRange.ts:129-131`.
- ✅ `getMeetingRangeAtHandleMinutes` already rounds to the nearest step (design D1) — `model/meetingRange.ts:147-149`.
- ✅ `moveMeetingRangeToDay` floors the new start to the step (design D1) — `model/meetingRange.ts:176-179`; the start comes from `reduceReferenceMoment.ts:68`.
- ✅ `reduceSetMeetingRange` calls `isValidMeetingRange` (design D1) — `model/reduceMeetingRange.ts:50`.
- ✅ `reduceMeetingRangeWallTimes` moves the end to the next date with `<= 0` and refuses with `INVALID_MEETING_RANGE` through `isInShownDay` (design D2) — `model/reduceMeetingRangeWallTimes.ts:29-40, 77-85`.
- ✅ `LocationErrorCode` lives in `model/locationCommands.ts` (proposal Impact, design D2) — `model/locationCommands.ts:31`.
- ✅ `MeetingRangeInputOutcome.INVALID_RANGE` and the mapping in `confirmMeetingRangeInput` (design D3) — `controller/useMeetingRange.ts:44, 174-177`.
- ✅ `MeetingRangeInput.tsx` lines 81–87 read `INVALID_RANGE` and `meeting.rangeInputError` (tasks 3.2) — `views/shared/MeetingRangeInput.tsx:81-87`; locale text «…с шагом 15 минут» at `locales/ru.json:126`, `en.json:126`.
- ✅ The test lines tasks 3.2 names: `MeetingRangeInput.test.tsx:155, 186`, `LocalDateTime.meetingInput.test.tsx:83`, `useMeetingRange.input.test.tsx:49` (`9:10`/`11` → `INVALID_RANGE`).
- ✅ Both inputs open with their text selected and request `inputMode="numeric"` (proposal Why 2) — `WallTimeInput.tsx:38, 70`; `MeetingRangeInput.tsx:49, 91` (the start field is selected on open).
- ✅ `getMeetingHandleRow(handle, rowCount)` places the end handle on ⌈n / 2⌉ (proposal Why 3) — `views/grid/meetingHandleRow.ts:10-16`.
- ✅ The handle `<li>` is `h-12 w-6`, the grip `h-9 w-3` (proposal Why 4, design D6) — `views/grid/MeetingHandle.tsx:91, 112`.
- ✅ The touch fallback never prevents the default of `touchend` and the drag uses the pointer's absolute position (proposal Why 4, design D7, D8) — `views/grid/useMeetingHandleDrag.ts:44-51, 91-94, 119`.
- ✅ A click on an hour cell sets a one-hour range unless the strip's own drag ran (proposal Why 4) — `views/grid/useHourCellSelection.ts:64-70`.
- ✅ `MeetingHandle.tsx` already uses `ResizeObserver` (design D5), polyfilled for iOS Safari 12 — `MeetingHandle.tsx:75`, `lib/legacy/installLegacySupport.ts:12`.
- ✅ `TRACK_TOUCH_MOVE_LISTENER_OPTIONS` is `passive: false` (design D8) — `constants/timeSelection.ts:34`.
- ✅ The date bar sits in the sticky `<footer>` of `MainPage.tsx` and no `data-date-bar` / `DATE_BAR_SELECTOR` exists in `src` except the local `"footer"` constant of the layers E2E steps (design D5) — `app/MainPage.tsx:65`, `test/features/grid_view/steps/grid_view_layers_e2e.steps.ts:35`.
- ✅ The test helpers and fixtures the tasks reuse exist: `isTopmostAt`/`centreOf` (`hourGridE2eHelpers.ts:27, 37`), the 12-location list and "the user sets the sample meeting" (`grid_view_layers_e2e.feature`), `FingerDrag`/`lastX`/`CELLS_PITCH_FRACTION`/`EDGE_INSET_PX` and the step "within a quarter of a cell of the finger" (`grid_view_meeting_handles_e2e.steps.ts:30-49, 247`), the fixture's `valueMinutes: 660` and the `100`→`256` drag (`meetingHandleFixture.tsx:10`, `useMeetingHandleDrag.test.tsx:47-48`).
- ✅ Every other test, step and feature file the tasks name as existing is present (`meetingRangeWorld.ts`, `meetingGridSession.ts`, `grid_view_meeting_unit.steps.tsx`, `meeting_range_*.steps.ts`, `time_selection_wall_time_input_unit.steps.tsx`, `MainPage.test.tsx`, `HourStrip.selection.test.tsx`, `useMeetingHandleDrag.edges.test.tsx`, `referenceMoment.test.ts`, `reduceMeetingRange.test.ts`), and the scripts `test:bdd:gen`, `check:bundle-size`, `check:legacy-build`, `typecheck`, `lint` and the projects `chromium`, `mobile-chrome` exist (`package.json`, `playwright.bdd.config.ts:133, 138`).
- ✅ The MODIFIED requirements exist in `openspec/specs/` under the restated names: `meeting-range` (invariants, set and clear, commands that remove or move, handle moves, wall-clock times) and `grid-view` (tap or Enter, handles on the frame, drag a handle, handle drag scrolls, handles are sliders, meeting range input); the delta keeps every stable scenario of each (the old 15-minute rows changed as declared).
- ✅ No "Time separator while typing" requirement exists in `openspec/specs/time-selection/spec.md`, and nothing of the change is implemented in code or in an archived change (no `MEETING_START_EQUALS_END`, `formatTypedWallTimeText`, `useVisibleStripRows`, `data-date-bar` in `packages/client/src` or `openspec/changes/archive`).
- ✅ `docs/architecture/overview.md:20`, `domain-model.md:49` and `views.md:3` already link a non-existent ADR-0012 (design D9's reason for 0013); `docs/adr/` holds 0001–0011, all `Accepted`.
- ✅ The glossary texts tasks 1.1 rewrites exist: "inside the reference day, on the track step, chosen" (`docs/glossary/time-selection.md:23`), "moves the start or the end by the track step" (`:25`), **Date bar** with *Never:* footer (`date-selection.md:5`); `domain-model.md:58` invariant 5 and `:75` errors cell; `views.md:42` Meeting handles.
- ✅ The only other active change, `add-pr-preview-deploy`, touches `app-delivery` only (proposal intro) — `openspec/changes/add-pr-preview-deploy/specs/`.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ meeting-range "Meeting range invariants", "Set and clear" | ✅ 2.1, 2.2, 2.4, 2.5 |
| FR2 | ✅ | ✅ meeting-range "Set a meeting range from wall-clock times" | ✅ 2.3, 2.4, 3.2 |
| FR3 | ✅ | ✅ grid-view "Meeting range input" | ✅ 3.2, 4.2, 5.2 |
| FR4 | ✅ | ✅ meeting-range "Meeting handle moves", grid-view sliders | ✅ 2.1, 2.5, 5.1 |
| FR5 | ✅ | ✅ meeting-range "Next day keeps a meeting off the track step" | ✅ 2.1, 2.5 |
| FR6 | ✅ | ✅ time-selection "Time separator while typing" (see R2) | ✅ 3.1, 4.1, 4.2, 5.2 |
| FR7 | ✅ | ✅ grid-view "Meeting handles on the frame" (see R1) | ✅ 4.3, 4.5, 5.1 |
| FR8 | ✅ | ✅ grid-view "Drag a meeting handle", "Tap or Enter", "Handle drag scrolls" | ✅ 4.4, 4.5, 5.1 |
| NFR-P1 | ✅ | ❌ tagged on "Meeting handles on the frame", but no SHALL and no scenario state the per-frame bound (R4) | ✅ 4.3 |
| NFR-A1 | ✅ | ✅ "No accessibility violations with each range message" | ✅ 3.2, 5.2 |
| NFR-A2 | ✅ | ✅ "Slider values off the track step", "The hit area is at least 44 by 44 px" | ✅ 4.4, 5.1 |
| NFR-R1 | ✅ | ✅ "Handles stay on screen in a long list" | ✅ 5.1 |
| NFR-R2 | ✅ | ✅ stable "Approved screenshots of the meeting state", unchanged | ✅ 6.3, 7.2 |
| UX1 | ✅ | ✅ "Digits typed one by one", "Backspace removes the separator" | ✅ 4.1, 4.2, 5.2 |
| UX2 | ✅ | ✅ sliders: "Its visible grip MUST keep its size" | ✅ 4.4 |
| UX3 | ✅ | ✅ "No message mentions a step" | ✅ 3.2, 4.2 |
| G1 | ✅ | n/a met by FR1, FR2, M1 | n/a |
| G2 | ✅ | n/a met by FR2, FR3, M2 | n/a |
| G3 | ✅ | n/a met by FR6, M3 | n/a |
| G4 | ✅ | n/a met by FR7, NFR-R1, M4 | n/a |
| G5 | ✅ | n/a met by FR8, M5 | n/a |
| NG1 | ✅ | n/a nothing changes the step of handles, taps or strip keys | n/a |
| NG2 | ✅ | n/a nothing crosses the day's end | n/a |
| NG3 | ✅ | n/a parsing unchanged; the separator's effect on `HMM` texts is R2 | n/a |
| NG4 | ✅ | n/a no horizontal reach work | n/a |
| NG5 | ✅ | n/a Cards gets only the separator | n/a |
| NG6 | ✅ | n/a no segmented or native time field | n/a |
| M1 | ✅ | n/a | ✅ 2.3, 4.2, 5.2 |
| M2 | ✅ | n/a | ✅ 2.3, 3.2, 4.2 |
| M3 | ✅ | n/a | ✅ 3.1, 4.2, 5.2 |
| M4 | ✅ | n/a | ✅ 5.1 |
| M5 | ✅ | n/a | ✅ 4.5, 5.1 |
| M6 | ✅ | n/a | ✅ 2.5, 5.1 |
| M7 | ✅ | n/a | ✅ 6.1 |

## Consistency

- `specs/time-selection/spec.md:192` says "the accepted and the rejected texts of 'Accepted wall-time text' … keep their meaning", but the rule of the same requirement (`:187-190`, proposal.md:91 FR6) turns the accepted `HMM` text `130` (01:30, stable `openspec/specs/time-selection/spec.md:644`) typed digit by digit into `13:0`, which is rejected (R2).
- `specs/meeting-range/spec.md:82` says "The target of each move lies on the track step", while the row `09:05–11:00 | start | an hour back | 08:05–11:00` of the same requirement (`:119`) and design.md:41 ("Hour moves stay `± TRACK_HOUR_MOVE_MINUTES`") keep an off-step minute (R5).
- proposal.md:201 lists `src/views/grid/useHourCellSelection.ts` as changed, while design.md:109 decides "`useHourCellSelection` does not learn about handles" and no task touches it; `GridView.tsx`, changed by tasks.md 4.3 and mutated in 6.1, is missing from proposal.md:197-202 (R6).

## Findings

### R1 — WARNING — Candidate rows use the strip box, but the handle is taller than the strip
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/design.md:91`; `proposal.md:92` (FR7), `proposal.md:108` (NFR-R1); `specs/grid-view/spec.md:20`
- Rule: —
- Problem: FR7 and D5 pick as candidates the rows whose hour strip lies fully in the viewport above the date bar (`top >= 0` and `bottom <= barTop`). The handle centred on that strip is 48 px high (`h-12`, `MeetingHandle.tsx:91`), while a strip is 44 px high below 768 px and 38 px high from 768 px (`h-11 md:h-[38px]`, `HourCellView.tsx:53`). At 844 × 390 (the `md` breakpoint) a candidate strip whose top is 0–4 px gives a handle whose top is up to 5 px above the viewport, and a strip ending 0–4 px above the date bar gives a handle reaching under the bar. NFR-R1 and the scenario "Handles stay on screen in a long list" require each handle to "lie fully inside the viewport and above the date bar".
- Impact: implemented as written, the E2E of task 5.1 fails or flakes at the "middle" scroll position, where strip positions are arbitrary, and a user can get a handle partly under the date bar, which is the defect of task item 3.
- Fix: in FR7, the grid-view requirement "Meeting handles on the frame" and D5, define a candidate row as one whose meeting handle box would lie fully in the viewport above the date bar: strip centre − half the handle height ≥ 0 and strip centre + half the handle height ≤ the date bar's top (the handle height read from the rendered handle, or a named constant beside the handle's size). Add a case to task 4.3's `useVisibleStripRows.test.tsx`: a strip whose top is 2 px with a 38 px height and a 48 px handle is not a candidate.
- Fix risk: low. The "Handle rows among the visible rows" table is written in candidate rows and stays valid. At 1440 × 900 with 4 rows every strip is far from the edges, so "Handles of the sample meeting" is unaffected.
- Status: open

### R2 — WARNING — The separator rule turns accepted three-digit early-morning texts into rejected ones, undeclared
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/specs/time-selection/spec.md:187-192`; `proposal.md:53` (NG3), `proposal.md:91` (FR6)
- Rule: —
- Problem: the stable "Accepted wall-time text" accepts `HMM` (`openspec/specs/time-selection/spec.md:644`; `WALL_TIME_INPUT_PATTERNS` `/^(\d{1,2})(\d{2})$/` backtracks so `130` → 01:30, `045` → 00:45, `200` → 02:00). Under FR6, typing those digits one by one gives `1`, `13`, `13:0`, then `0`, `04`, `04:5`, then `2`, `20`, `20:0`. Each `HH:M` text is rejected (`9:3` is a rejected text, stable spec `:680`). Pasting `130` at the end gives the same result. The delta still says "the accepted and the rejected texts … keep their meaning". NG3 only hints at it ("other than what the separator produces"). No scenario, M3 sequence or task shows this case: M3 and the tables use `930`, `0930` and `1030` only.
- Impact: today a user can type `130` and get 01:30. After the change they get «Введите время в формате ЧЧ:ММ», in both the wall-time input and the meeting range input. No artifact says so and no test pins it, so the implementer and the reviewer cannot tell whether this is intended.
- Fix: declare the trade-off instead of claiming nothing changes. In the time-selection delta, replace "keep their meaning" with a sentence saying that a three-digit time whose hour is 0, 1 or 2 must be typed with a leading zero or a separator (`0130`, `1:30`), because the digits typed one by one read as `13:0`. Add that case to FR6 and NG3. Add a row `130` → `1`, `13`, `13:0` to "Digits typed one by one", and `130` to "Rejected texts stay rejected". Add the same `130` → `13:0` case to task 3.1's `formatTypedWallTimeText.test.ts`.
- Fix risk: none for the code. Parsing and the stable "Accepted wall-time text" stay as they are, because a confirmed text `130` (typed inside the text, or pasted into a field that already holds text after the caret) still means 01:30. Adding the row adds one example to the unit BDD of task 4.2 and the E2E of task 5.2.
- Status: open

### R3 — WARNING — D1 adds a second owner of the "next / previous track step" rule
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/design.md:41`
- Rule: `.claude/rules/glossary.md` ("Duplicated logic: a second function that computes what an owner already computes"), `.claude/rules/antipatterns.md` ("Second owner of a concept")
- Problem: D1 adds the private helpers `getNextTrackStep` = `(Math.floor(current / step) + 1) * step` and `getPreviousTrackStep` = `(Math.ceil(current / step) - 1) * step` to `model/meetingRange.ts`. The **Track move** concept (`docs/glossary/time-selection.md:13`, *Code:* `TrackMove`) already applies exactly this rule to off-step values in `getInstantAfterTrackMove`: `floorStep + TRACK_STEP_MINUTES` and `ceilStep - TRACK_STEP_MINUTES` (`model/dayTrack.ts:115-120`).
- Impact: two model functions would own the meaning of "next / previous track step" for an off-step value. A later change to one, for example stepping from the track end, silently leaves the other behind. This is the duplication the glossary rule exists to stop.
- Fix: in D1 and task 2.2, extract the step part of `getInstantAfterTrackMove` into one exported pure model function in `model/dayTrack.ts`, for example `getTrackStepMinutes(minutes, move)` returning the next or previous step position. Make `getInstantAfterTrackMove` and `getMeetingRangeAfterHandleMove` both call it, and drop the two private helpers. Add `model/dayTrack.ts` to proposal Impact. Add `npx vitest run src/model/dayTrack.test.ts` to task 2.2's runs and `src/model/dayTrack.ts` to Stryker run 1 of task 6.1, which then holds 5 files, the limit. Add the function to the *Code:* part of **Track move** in task 1.1.
- Fix risk: low. The refactor touches the day track's keyboard moves. Their tests in `dayTrack.test.ts:142` (`getInstantAfterTrackMove`) must stay green, and Stryker run 1 reaches the 5-file cap.
- Status: open

### R4 — WARNING — NFR-P1 has no spec statement or scenario
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/specs/grid-view/spec.md:20-24`; `proposal.md:99`
- Rule: `.claude/rules/traceability.md` (every NFR has an implementing entity), `.claude/rules/test-planning.md` (work bounds as blocking unit BDD)
- Problem: the requirement "Meeting handles on the frame" carries `NFR-P1 of refine-meeting-range-entry-and-handles` in its trace comment. Its text only says the handles "MUST move to the rows of the new candidates" on scroll or resize. It says nothing about measuring at most once per animation frame or re-rendering a handle only when its row changes, and none of its scenarios checks it. Only task 4.3's Vitest file tests the bound.
- Impact: after archive, the stable `grid-view` spec carries no work bound for the scroll path. A later change can measure on every scroll event and still meet every spec scenario. `test-planning.md` asks for work bounds as blocking unit BDD, and no Gherkin covers this one.
- Fix: add to "Meeting handles on the frame" the sentence "Re-placing the handles on scroll MUST measure the strips at most once per animation frame and MUST re-render a handle only when its row changes." Add the scenario "Scrolling re-places the handles cheaply": GIVEN the Grid view with 12 locations and a meeting range, WHEN three scroll events arrive before the next animation frame, THEN the strips are measured once AND a scroll that leaves the candidate rows unchanged re-renders no handle. Implement it in task 4.5's unit feature `grid_view_meeting_handle_reach_unit.feature` (`@NFR-P1`), with a stubbed `requestAnimationFrame` counter as in task 4.3.
- Fix risk: none. It is a work bound in jsdom, with no timing assertion, as ADR-0008 and `test-planning.md` require. Task 4.3 already builds the same stubs.
- Status: open

### R5 — SUGGESTION — "The target of each move lies on the track step" is false for hour moves and limited moves
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/specs/meeting-range/spec.md:82`; `proposal.md:83` (FR4)
- Rule: —
- Problem: the requirement opens with "The target of each move lies on the track step". Its own row `09:05–11:00 | start | an hour back | 08:05–11:00` (`:119`) and D1 ("Hour moves stay `± TRACK_HOUR_MOVE_MINUTES`") keep the off-step minute. The limits can also stop a move off the step: from 09:05–09:28 the start's next step 09:15 is limited to 09:13 (end − 15 min).
- Impact: low. The scenario table and D1 tell the implementer what to build, but the archived stable spec will state a rule that its own example breaks.
- Fix: reword `:82` and FR4 as "A step move and a drag land on the track step; an hour move keeps the minute; the day start and end are exact. The limits below may then stop a move off the step." Optionally add the row `09:05–09:28 | start | next step | 09:13–09:28`.
- Fix risk: none. The behaviour and the tests of tasks 2.1 and 2.5 are unchanged.
- Status: open

### R6 — SUGGESTION — Proposal Impact lists an untouched file and omits touched ones
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/proposal.md:197-202`
- Rule: —
- Problem: Impact lists `useHourCellSelection.ts`, which design.md:109 explicitly leaves unchanged and no task edits. It omits `views/grid/GridView.tsx` (wiring of task 4.3, Stryker run 3), `views/shared/typedTimeFieldText.ts` (new, D4), and `constants/timeSelection.ts` (`WALL_TIME_SEPARATOR`, task 3.1).
- Impact: low. A reviewer of the pull request may expect a change to the hour-cell selection that never comes, and miss the new view helper.
- Fix: in Impact, drop `useHourCellSelection.ts`; add `GridView.tsx` under `src/views/grid/`, `typedTimeFieldText.ts` (new) under `src/views/shared/`, and `src/constants/timeSelection.ts`.
- Fix risk: none.
- Status: open

### R7 — SUGGESTION — The class diagram of `domain-model.md` keeps "on the track step"
- Location: `openspec/changes/refine-meeting-range-entry-and-handles/tasks.md:32` (task 1.2)
- Rule: `.claude/rules/glossary.md` ("A change that shifts a term's meaning … updates the entry in the same change")
- Problem: task 1.2 rewrites invariant 5 of `docs/architecture/domain-model.md:58`, but the `MeetingRange` class of the same file still reads `Instant start "on the track step of the reference day"` (`docs/architecture/domain-model.md:28`).
- Impact: the architecture doc contradicts itself after the change.
- Fix: add to task 1.2: `domain-model.md:28` becomes `"a whole minute of the reference day"`, verified by `grep -c "on the track step of the reference day" docs/architecture/domain-model.md` printing 0.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. No CRITICAL findings. The WARNINGs R1 (handle rows can leave a handle partly off-screen), R2 (undeclared loss of `HMM` texts with hours 0–2), R3 (a second owner of the track-step move) and R4 (NFR-P1 has no spec) should be fixed before implementation. R5–R7 are polish.
