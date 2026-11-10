# Specs review: add-grid-meeting-range-and-share

## Summary

| Item | Value |
|---|---|
| Stale claims | 1 |
| Requirements fully covered | 45/45 |
| Contradictions | 5 |
| CRITICAL | 1 |
| WARNING | 5 |
| SUGGESTION | 1 |

## Freshness

- ✅ `proposal.md:3`: no meeting range in the code — `grep -rn "MeetingRange\|MEETING_RANGE\|getMeetingSpan" packages/client/src` finds nothing; the archived `add-grid-hour-cells-and-hour-frame/proposal.md:51` defers it in NG1; the only other active change, `add-pr-preview-deploy`, has only `specs/app-delivery`.
- ✅ `proposal.md:9`, REMOVED `grid-view` → "Hour cells take no pointer selection yet" exists at `openspec/specs/grid-view/spec.md:162` with the scenario "A tap on a cell changes nothing" (`:165`).
- ✅ MODIFIED `grid-view` → "Hour frame" restates `openspec/specs/grid-view/spec.md:112-151` word for word plus the meeting sentence and one new scenario (diffed).
- ✅ MODIFIED `main-page` → "Header actions" restates `openspec/specs/main-page/spec.md:121-187` word for word plus the meeting sentence and two new scenarios (diffed).
- ✅ design D1: `WorldClockState` has `locations`, `deviceTimeZoneId`, `reference`, `homeLocationId` (`src/model/locations.ts:50-58`); `LocationCommandType` has no meeting command and no `SHIFT_TIME` (`src/model/locationCommands.ts:12-25`); `reduceLocations` wraps every outcome in `followReferenceZone(state, outcome.state)` (`locations.ts:75-83`).
- ✅ design D1: `reduceSelectInstant` returns the same state when the instant is already pinned (`src/model/reduceSelectInstant.ts:41-46`), which is why D1 restricts that early return; `moveToDate` re-resolves the wall time with `resolveWallClock` (`src/model/reduceReferenceMoment.ts:35-62`); `RESET_TO_NOW` sets `LIVE_REFERENCE_MOMENT` (`:88-91`).
- ✅ design D1: `flushWrite` saves only `{ locations, homeLocationId }` (`src/controller/createLocationsActions.ts:55-59`).
- ✅ design D2: `ReferenceDay` has `start`, `end`, `lengthMinutes` (`src/model/dayTrack.ts:26-31`); `TrackMove` has `NEXT_STEP`, `PREVIOUS_STEP`, `HOUR_FORWARD`, `HOUR_BACK`, `DAY_START`, `DAY_END` (`dayTrack.ts:33-40`); `getInstantAfterTrackMove`, `getHourCells`, `getHourCellCount`, `getHourFrameIndex`, `HOUR_CELL_DURATION` exist (`src/model/index.ts`, `src/model/hourCells.ts`, `src/constants/grid.ts`).
- ✅ design D3: `formatLocalTime` / `formatLocalDate` exist in `src/presenter/localDateTime.ts:16,33` on `getDateTimeFormatter`; `presentDateBar` returns `fullDateLabel` (`src/presenter/dateBar.ts:52-80`) with `FULL_DATE_FORMAT_OPTIONS` = long weekday, day, long month, year (`src/constants/date.ts:14-19`), matching M6's "Sunday, March 8, 2026"; `tsconfig.app.json:7` has `ES2020`, `ES2022.Intl`, `DOM`, `DOM.Iterable` (no `Intl.DurationFormat`).
- ✅ design D4: the `StorageAvailability` pattern exists: `src/ports/storageAvailability.ts`, `src/adapters/localStorageAvailability.ts`, `inMemoryStorageAvailability.ts`, `storageAvailability.contract.ts`.
- ❌ design D4/intro (`design.md:5`, `:72`): "ADR-0009 (… iOS Safari 12 has no Pointer Events and no `navigator.clipboard`)" — `docs/adr/0009-supported-browser-engines.md` says nothing about the clipboard or the share API; the fact itself (no `navigator.clipboard` on iOS 12) is harmless to the design, so this attribution is not raised as a finding.
- ✅ design D5: `useTimeSelection` dispatches `SELECT_INSTANT` straight to the store (`src/controller/useTimeSelection.ts:17,35`); `LocationsContext` is provided by `src/controller/LocationsProvider.tsx:23`; `createSwitchableClock` is `src/test/switchableClock.ts`; `createInMemoryLocationBackend` is used by the `useLocations.*.test.tsx` files.
- ✅ design D6: `HourStrip.tsx` is a `role="slider"` (`src/views/grid/HourStrip.tsx:109`) with no `onPointer*` / `onClick`; `useHourStripScroll` returns `{ panelRef, panelStyle, layout }` (`useHourStripScroll.ts:97`) with `layout.isScrollable`; `HourGridCssVariable.ROW_PADDING = "--grid-row-padding"`, `CELL_PITCH = "--hour-cell-pitch"` (`src/constants/grid.ts:26-27`); the design HTML has the grips as `li style="position: absolute; z-index: 3"` (`docs/design/screens/grid-desktop-meeting-light.html:2698,2715`), the start one on the lower row.
- ✅ design D6: `IS_POINTER_EVENTS_SUPPORTED` is exported from `@/lib/legacy` (`src/lib/legacy/index.ts:3`); `TRACK_TOUCH_START_LISTENER_OPTIONS` / `TRACK_TOUCH_MOVE_LISTENER_OPTIONS` are in `src/constants/timeSelection.ts:29-34`; `getTrackMoveForKey` is `src/views/shared/dayTrackKeys.ts`; the grid header box is `focus-within:z-[3]` (`src/views/shared/locationRowVariant.ts:66`).
- ✅ design D6/D8: `HourGridSlots` has `renderHourStrip`, `frame`, `panelRef`, `panelStyle` (`src/views/shared/hourGridSlots.ts:10-15`) and the frame is the panel's last child (`LocationList.tsx:167`), so handles in that slot come after the rows in Tab order; `LocationRow.tsx` is 199 lines; `views/shared/RowNotes.tsx` does not exist yet (to be created).
- ✅ design D7: `AppShellContent` builds `MainPage` with `headerActions` and owns the notices (`src/app/AppShell.tsx`, 121 lines); `MainPage` has a polite notices region (`src/app/MainPage.tsx:43`); `Notice` already dismisses on Esc (`src/app/Notice.tsx:23`); `ViewDefinition` has `id`, `titleKey`, `icon`, `component` only (`src/views/viewDefinition.ts:19-24`); `resolveActiveView` and `useViewMode` exist; `ADD_LOCATION_BUTTON_ID` exists in `@/constants`.
- ✅ design D10: `HourStrip.test.tsx:92` is "should do nothing on a pointer down or a click on a cell"; `grid_view_hour_frame_unit.feature:37` is "A tap on a cell changes nothing"; `main_page_header_e2e.feature` exists.
- ✅ design D11: `playwright.bdd.config.ts:42,49,76-79` has `VIEW_CONTRACT_TAG_PATTERN = /@view-contract/`, an empty `VIEW_CONTRACT_PENDING_TAGS` documented as the scenarios a view "cannot pass yet", and `viewContractProjects` mapping `viewRegistry` with `grepInvert: VIEW_CONTRACT_PENDING_TAGS[view.id]`; the registry is loaded at run time (`:37`), so `showsMeetingRange` is readable there.
- ✅ tasks: helpers named exist — `createGridViewWorld` (`src/test/features/main_page/steps/gridViewWorld.tsx:32`, no arguments today), `startWorkCount` (`src/test/workCounters.ts:33`), `readThemeColours` (`main_page/steps/themeTokens.ts:52`), `isTopmostAt` (`grid_view/steps/hourGridE2eHelpers.ts`), `openOtherTab()` (`locations/steps/locations_ui_e2e.fixtures.ts:95`), the `test` of `view_contract_e2e.fixtures.ts:38`, the steps of 8.6 (`home_location/steps/home_location_e2e.steps.ts:23,36`, `locations_reorder_drag_e2e.steps.ts:184`, `locations_layout_e2e.steps.ts:65`), `PointerEvent` stubbed in `DayTrack.touchFallback.test.tsx:10`, `src/test/benchmarks/` with other `*.bench.ts`; the scripts `test:bdd:gen`, `check:bundle-size`, `check:legacy-build`, `typecheck`, `lint` exist in `package.json`; projects `chromium`, `mobile-chrome`, `view-contract-<id>` exist.
- ✅ docs: the glossary entries Meeting range, Meeting frame, Meeting handle, Meeting bar, Share meeting (`docs/glossary/time-selection.md:23-27`) and Day shift (`time.md:25`) are *(planned)*; Hour cell says "A tap does nothing yet" (`time-selection.md:20`); Q8 is in the open table of `docs/architecture/open-questions.md:7`; `docs/architecture/views.md:139` says "Grid also passes the meeting scenarios"; `docs/architecture/domain-model.md:108-109` plans `getMeetingSpan(state)` and `getLocationMeetingRange(row)`.
- ✅ sample data: `2026-03-08T04:00Z` is 09:00 Almaty (UTC+5), 07:00 Moscow, 09:30 Kolkata, 23:00 on 7 March in New York (US DST starts 8 March 2026 at 07:00Z, so `06:00Z` is 01:00 EST); New York's 8 March is 23 hours; Lord Howe's 2026-04-05 day ends with a 30-minute cell — M1, M6 and the clamp scenarios are arithmetically right.

## Coverage

| Requirement | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ meeting-range → Meeting range invariants | ✅ 2.1, 2.3, 6.1 |
| FR2 | ✅ | ✅ Set and clear a meeting range | ✅ 2.3, 6.1 |
| FR3 | ✅ | ✅ Commands that remove or move the meeting range | ✅ 2.3, 6.1 |
| FR4 | ✅ | ✅ Reference zone change removes the meeting range | ✅ 2.3, 6.1 |
| FR5 | ✅ | ✅ grid-view → Tap or Enter sets a one-hour meeting range | ✅ 5.1, 6.4, 7.2, 8.1 |
| FR6 | ✅ | ✅ Drag across hour cells sets a meeting range | ✅ 7.2, 8.1 |
| FR7 | ✅ | ✅ Meeting frame and dimmed cells; Hour frame (MODIFIED) | ✅ 6.4, 7.2, 8.1 |
| FR8 | ✅ | ✅ Meeting span in grid rows; Day shift of a location | ✅ 2.1, 3.1, 6.2, 6.4, 7.3, 8.1 |
| FR9 | ✅ | ✅ Meeting handles on the frame | ✅ 7.2, 8.2 |
| FR10 | ✅ | ✅ Meeting handle moves; Drag a meeting handle | ✅ 2.1, 6.2, 7.2, 8.2 |
| FR11 | ✅ | ✅ Handle drag scrolls the strips | ✅ 7.2, 8.2 |
| FR12 | ✅ | ✅ Meeting handles are sliders | ✅ 2.1, 3.1, 6.2, 7.2, 8.2 |
| FR13 | ✅ | ✅ Meeting bar; main-page → Header actions (MODIFIED) | ✅ 3.1, 5.1, 7.3, 7.4, 8.1, 8.5 |
| FR14 | ✅ | ✅ Share meeting text | ✅ 3.1, 6.3 |
| FR15 | ✅ | ✅ Share meeting outcome; Share meeting from the meeting bar | ✅ 4.1, 5.1, 6.3, 6.4, 8.3 |
| FR16 | ✅ | ✅ Share meeting text (text only, no link) | ✅ 1.1, 1.2, 6.3 |
| FR17 | ✅ | ✅ Meeting scenarios of the view contract | ✅ 8.4 (see R1) |
| NFR-P1 | ✅ | ✅ Meeting state is fast | ✅ 6.5 |
| NFR-A1 | ✅ | ✅ Accessible meeting state; Meeting handles are sliders | ✅ 7.3, 8.2, 8.3 |
| NFR-A2 | ✅ | ✅ Accessible meeting state; Tap or Enter; Share from the bar | ✅ 8.1, 8.2, 8.3 |
| NFR-R1 | ✅ | ✅ Meeting handles on the frame; Meeting bar on a narrow phone | ✅ 8.1, 8.2 |
| NFR-R2 | ✅ | ✅ Approved screenshots of the meeting state | ✅ 8.6 (and H1) |
| UX1 | ✅ | ✅ frame, spans, handles, bar, screenshots | ✅ 8.1, 8.6 |
| UX2 | ✅ | ✅ Drag a meeting handle | ✅ 8.2 |
| UX3 | ✅ | ✅ Share meeting text | ✅ 6.3 |
| M1 | ✅ | n/a | ✅ 6.4, 8.2 |
| M2 | ✅ | n/a | ✅ 6.4 |
| M3 | ✅ | n/a | ✅ 2.1, 6.2 |
| M4 | ✅ | n/a | ✅ 2.1, 2.3 |
| M5 | ✅ | n/a | ✅ 2.3, 6.1 |
| M6 | ✅ | n/a | ✅ 3.1, 6.3, 8.3 |
| M7 | ✅ | n/a | ✅ 4.1, 6.3 |
| M8 | ✅ | n/a | ✅ 8.3, 8.6 |
| M9 | ✅ | n/a | ✅ 6.5 |
| M10 | ✅ | n/a | ✅ 1.1, 1.2 (verification greps) |
| G1 | ✅ | n/a — met by FR5, FR6, FR10, FR12 | n/a |
| G2 | ✅ | n/a — met by FR8, FR10 | n/a |
| G3 | ✅ | n/a — met by FR14, FR15, M6, M7 | n/a |
| G4 | ✅ | n/a — met by FR17, NFR-R2, M8 | n/a |
| NG1 | ✅ | n/a — no artifact builds a link; 8.3 asserts no `url` | n/a |
| NG2 | ✅ | n/a — the invariant and the clamp keep the range in one day | n/a |
| NG3 | ✅ | n/a — nothing builds a colouring setting | n/a |
| NG4 | ✅ | n/a — Cards is untouched (D7, D8) | n/a |
| NG5 | ✅ | n/a — nothing stores or syncs the range (D1, 6.1) | n/a |
| NG6 | ✅ | n/a — no undo is built | n/a |

`proposal.md` defines no `Q` id (Open Questions: "None"; Q8 of `docs/architecture/open-questions.md` is answered by FR16 and design intro).

## Consistency

- `design.md:199-201` (D11: `@meeting-range` contract scenarios never run for a view without `showsMeetingRange`; "it is no new global decision") contradicts `openspec/specs/main-page/spec.md:333` ("The view-contract scenarios SHALL run once for every view of the registry … MAY be excluded for that view only … a scenario that a view cannot pass yet … that names the view and the change that brings the scenario back") and `docs/adr/0005-view-registry.md:62` ("A new view cannot skip the contract scenarios"); no delta modifies that requirement — R1.
- `design.md:133` (D7: the meeting bar title is the `h1`) and `proposal.md` FR13 (title not shown) contradict `openspec/specs/main-page/spec.md:9` ("a header with the app title as the only page heading") and `openspec/specs/app-shell/spec.md:10` ("The shell SHALL render the app title as the only page heading"); neither is in a delta — R2.
- `tasks.md:244` (6.4: unit BDD that clicks cells, reads the meeting bar and the notices, passes `textSharing` to `AppShell`, "pass") depends on later tasks `tasks.md:250-252` (7.2 cell click, 7.3 `MeetingBar`, 7.4 `AppShell` `textSharing` prop and notices) — R5.
- `design.md:110` maps a cell column from the strip's `getBoundingClientRect()` and the pitch, while `design.md:114` maps a handle position as `(clientX − strip left + panel scrollLeft) / pitch × 60` — two different pixel-to-time rules for the same panel — R4.
- `tasks.md:216` adds the glossary term **Meeting share text**, while the specs call the same thing "the meeting text" (`specs/meeting-range/spec.md:132,161-162`, `specs/grid-view/spec.md:166,176`) — R7.

## Findings

### R1 — CRITICAL — Capability-scoped contract scenarios break the stable view-contract requirement and ADR-0005 undeclared
- Location: `openspec/changes/add-grid-meeting-range-and-share/design.md:199-201`, `tasks.md:259`
- Rule: `.claude/rules/delta-specs.md`; `docs/adr/0005-view-registry.md:45,62`; `.claude/rules/design-decisions.md` ("If the decision applies beyond this change, it belongs in `docs/adr/`")
- Problem: D11 and task 8.4 exclude every `@meeting-range` scenario from the contract project of each view whose registry entry lacks `showsMeetingRange` (Cards today, and every future view by default), permanently. The stable requirement `openspec/specs/main-page/spec.md:332-333` "View contract runs every scenario for every registered view" says the scenarios "SHALL run once for every view of the registry" and allows exclusion only for a scenario "that a view cannot pass yet", "by a marker on the scenario that names the view and the change that brings the scenario back". ADR-0005 says "the view-contract BDD E2E scenarios are parameterized by the registry and run for every registered view" and "A new view cannot skip the contract scenarios"; ADR-0002 `:80` "A new view cannot silently drop a capability". The change has no MODIFIED delta for that requirement, and D11 calls itself "no new global decision" although it sets a rule for every future view.
- Impact: Implemented as written, the archived specs keep a requirement the config then violates (Cards' run omits `@view-contract` scenarios with no pending marker), and a future view that simply omits the flag silently skips the meeting scenarios — the exact failure ADR-0005 forbids. A later change that checks the config against `main-page` finds two contradicting rules.
- Fix: (1) Add to `specs/main-page/spec.md` a `## MODIFIED Requirements` entry "View contract runs every scenario for every registered view", restating `openspec/specs/main-page/spec.md:332-345` in full and adding: "A scenario tagged `@meeting-range` belongs to the meeting range capability (ADR-0011): it runs for every view whose registry entry shows the meeting range (`showsMeetingRange`) and for no other view; this is not a pending exclusion." plus a scenario "Meeting scenarios run only for views that show the meeting range" (the Grid contract project lists "Set, resize, share and clear", the Cards project does not — the `--list` checks 8.4 already runs), and `FR17 of add-grid-meeting-range-and-share` in its implements comment; list `main-page` → this requirement in `proposal.md` "What Changes" / "Modified Capabilities". (2) Because the rule binds every future view, add handoff item H3 with a checkbox task "write `H3-adr-0005-capability-scoped-contract.patch` and its README section" that appends to ADR-0005's Consequences a "Refined by ADR-0011" note ("contract scenarios of a capability a view does not show, flagged in its registry entry, run only for the views that show it"), `git apply --check` in its verification; under `## Human follow-up`: "Why manual: the factory may not write `docs/adr/`. Automated part: the `--list` counts of task 8.4." Change D11's "no new global decision" sentence accordingly.
- Fix risk: Adds one handoff item and one modified requirement; no checkbox task depends on H3 (8.4 runs without it). The restated requirement must keep "Grid runs every contract scenario" true, which it does since Grid sets the flag.
- Status: open

### R2 — WARNING — The meeting bar title replaces "the app title as the only page heading" without a delta
- Location: `openspec/changes/add-grid-meeting-range-and-share/design.md:133`; `proposal.md` FR13
- Rule: `.claude/rules/delta-specs.md`
- Problem: D7 renders the meeting bar's title «Встреча · 2 ч» as the `h1` and FR13 / the MODIFIED "Header actions" hide the app title while the bar is shown. Two stable requirements say the app title is always the only page heading: `openspec/specs/main-page/spec.md:9` ("a header with the app title as the only page heading") and `openspec/specs/app-shell/spec.md:10` ("The shell SHALL render the app title as the only page heading"). Neither is in a delta; existing tests assert the rule (`src/app/MainPage.test.tsx:31-33` "should show the app title as the only heading", `src/app/AppShell.test.tsx:37,45`).
- Impact: After archive, `main-page` and `app-shell` still require the app title as the only heading in a state where the change removes it; the implementer has no spec saying which heading the meeting state has (one `h1` with the bar title, or none), and the header test changes of 7.4 are unanchored.
- Fix: In `specs/main-page/spec.md` add MODIFIED "Main page regions" (restated in full) with "while the meeting bar is shown, its title is the only page heading in place of the app title"; add `specs/app-shell/spec.md` with MODIFIED "Shell shows the app title in the active language" carrying the same exception; list both in `proposal.md` → Modified Capabilities. In task 7.4 add to `MainPage.test.tsx`: "with `meetingBar` there is exactly one heading, the bar title".
- Fix risk: Adds `app-shell` to the touched capabilities; the restated texts must be copied verbatim from `openspec/specs/` apart from the added sentence.
- Status: open

### R3 — WARNING — The hour-frame auto-scroll keeps running during a meeting and fights the handle drag
- Location: `openspec/changes/add-grid-meeting-range-and-share/design.md:95`, `:114`
- Rule: —
- Problem: `useHourStripScroll(hourFrameIndex, cellCount)` scrolls the panel (smoothly after the first time) whenever `hourFrameIndex` changes and its column is not fully visible (`src/views/grid/useHourStripScroll.ts:53-80`; called in `src/views/grid/GridView.tsx:22-25`). While a meeting range is set the reference moment is pinned at the start, so `hourFrameIndex` follows the start. D5 only adds `hasMeetingRange` to hide the frame; D6's auto-scroll loop owns the panel's `scrollLeft` during a handle drag; nothing says the hour-frame scroll stops while a meeting is set.
- Impact: On a phone in portrait, dragging the start handle into the 32 px left edge zone (FR11) leaves the start's column partly hidden; when the start crosses into the next column, the existing effect smooth-scrolls the panel to centre that column, so the panel jumps about half its width under the finger and the next pointer position maps to a start hours away — against FR10/UX2 ("never jumps"). No task tests a start-handle drag at an edge.
- Fix: In D6 decide that `GridView` does not let `useHourStripScroll` follow the hour frame while a meeting range is set (e.g. a `isFollowingHourFrame` argument false while `hasMeetingRange`), and add to task 7.2 a `useHourStripScroll.test.tsx` case: "with a meeting range, a frame index change to a hidden column does not scroll the panel", plus in 8.2 a phone scenario dragging the start handle to the left edge whose start ends earlier and never jumps more than one track step per move.
- Fix risk: After Clear the hour frame stands on the start column, which the user was just looking at; if it is out of view the effect must run once when following resumes — state that in D6 so the "Clear meeting" scenario still finds the frame visible.
- Status: open

### R4 — WARNING — The handle drag formula adds `scrollLeft` to a position that already moves with the scroll
- Location: `openspec/changes/add-grid-meeting-range-and-share/design.md:114`; `tasks.md:250` (`useMeetingHandleDrag.test.tsx` "minutes from `clientX`, `scrollLeft` and pitch")
- Rule: —
- Problem: D6 maps a handle position as `(clientX − strip left + panel scrollLeft) / pitch × 60`. The strips are children of the horizontally scrolling panel (`locationRowVariant.ts:64` `overflow-x-auto` on the list; `useHourStripScroll.ts` scrolls `panel.scrollLeft`), so a strip's `getBoundingClientRect().left` — the measure D6 itself uses for cells (`design.md:110`) — already shifts by `−scrollLeft`. "strip left" is not defined, and with the rect the scroll is counted twice.
- Impact: With the panel scrolled (phone portrait, the only case FR11 applies), a handle would land `scrollLeft` pixels (often several hours) to the right of the finger. The 7.2 unit test with a stubbed rect passes either way, desktop E2E has `scrollLeft = 0`, and 8.2's phone scenario only checks "the end is after 11:00", so the bug would ship.
- Fix: In D6 write the handle mapping as `minutes = (clientX − strip.getBoundingClientRect().left) / pitch × 60`, re-read after each auto-scroll frame, the same rule as the cells; in task 7.2 test it with a scrolled panel (rect left shifted by the scroll) expecting the minutes under the pointer; in 8.2's phone scenario assert that after the drag the end handle's centre is within one track step of the pointer's last position.
- Fix risk: none — the cells already use this rule.
- Status: open

### R5 — WARNING — Task 6.4 cannot pass before tasks 7.2–7.4
- Location: `openspec/changes/add-grid-meeting-range-and-share/tasks.md:244`
- Rule: `.claude/rules/tdd-workflow.md`; review instructions ("tasks ordered so none depends on a later one")
- Problem: 6.4 renders the app in Grid and clicks a cell (`fireEvent.click`), reads the meeting frame, the dimmed cells, the meeting bar title and the copied / failed notices, and passes `textSharing` through `createGridViewWorld` to `AppShell` — and says "Run …: pass". The click handler and frame come in 7.2, `MeetingBar` in 7.3, and `AppShell`'s `textSharing` prop, `useMeetingBar` and `MeetingShareNotice` in 7.4.
- Impact: The implement stage reaches 6.4 with no view code: either the task stays unticked, or the implementer pulls 7.2–7.4 forward out of order and the RED/GREEN steps of those tasks lose their meaning.
- Fix: Move 6.4 (with its `grid_view_hour_frame_unit.feature` change) after 7.4 as task 7.5 under section 7, or split it: write the feature as RED in 6.4 and make "Run …: pass" part of 7.4.
- Fix risk: none.
- Status: open

### R6 — WARNING — The finger swipe and finger drag E2E steps name tools that cannot scroll the strips
- Location: `openspec/changes/add-grid-meeting-range-and-share/tasks.md:256` (8.1 "A swipe on a scrolling strip sets nothing … `page.touchscreen` / `locator.dispatchEvent` touch events"), `tasks.md:257` (8.2 touch drag on a phone)
- Rule: `.claude/rules/bdd-e2e.md`
- Problem: Playwright's `Touchscreen` has only `tap(x, y)` (`playwright-core/types/types.d.ts:23133`), and touch events sent by `locator.dispatchEvent` are synthetic: the browser does not scroll for them. The scenario's Then is "the strips scroll and no meeting range is set" (`specs/grid-view/spec.md:30-33`). The repository already has a real finger gesture through CDP: `startTouch`, `dispatchTouch`, `dragWithFinger` with `Input.dispatchTouchEvent` in `src/test/features/locations/steps/locationsReorderE2eHelpers.ts:150-175`.
- Impact: With the named tools the swipe scenario cannot pass ("the strips scroll" never holds), or it is weakened to only "no range set", which leaves FR6's "a finger swipe scrolls the strips" untested; 8.2's phone handle drag has the same gap for FR11.
- Fix: In 8.1 and 8.2 replace "`page.touchscreen` / `locator.dispatchEvent` touch events" by "a CDP finger gesture with `startTouch` / `dragWithFinger` (and `dispatchTouch` to hold at the edge) from `src/test/features/locations/steps/locationsReorderE2eHelpers.ts`", run on `mobile-chrome`.
- Fix risk: CDP needs a Chromium project; `chromium` and `mobile-chrome` both are, and the scenarios are already scoped to `mobile-chrome`.
- Status: open

### R7 — SUGGESTION — "meeting text" in the specs vs the new glossary term "Meeting share text"
- Location: `openspec/changes/add-grid-meeting-range-and-share/specs/meeting-range/spec.md:132,161-162`; `specs/grid-view/spec.md:166,176`; `tasks.md:216`
- Rule: `.claude/rules/glossary.md` ("Gherkin steps and spec text use the glossary term")
- Problem: Task 1.1 adds the term **Meeting share text** (*Code:* `presentMeetingShareText`), while every scenario says "the meeting text" ("When the meeting text is built", "the clipboard holds the meeting text").
- Impact: The Gherkin steps written from these scenarios carry a name that is not the glossary term, which the glossary rule counts as a synonym.
- Fix: Either use "meeting share text" in those scenario lines, or name the glossary entry **Meeting text** in task 1.1 (matching the notice «Текст встречи скопирован» / "Meeting text copied") — one word in both places.
- Fix risk: none.
- Status: open

## Verdict

Needs revision. Blocking: R1 (CRITICAL — the view-contract scoping contradicts a stable `main-page` requirement and ADR-0005 without a delta). R2–R6 are WARNINGs that should be fixed in the same revision: a missing delta for the page heading (R2), two gaps in the handle-drag design that would ship broken behaviour on phones (R3, R4), a task ordering defect (R5) and E2E tools that cannot carry out the finger scenarios (R6). R7 is polish.
