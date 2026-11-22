# Specs review: keep-location-menu-in-view-and-clear-range-after-share

## Summary

| Item | Value |
|---|---|
| Stale claims | 2 |
| Requirements fully covered | 30/30 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Freshness

- ✅ `src/views/shared/LocationMenu.tsx` has 250 lines; the menu is `absolute right-0 top-full mt-1` unless `isMenuFixedToViewport`, then `fixed` (`LocationMenu.tsx:223`).
- ✅ `isMenuFixedToViewport` is `false` for Cards and `true` for Grid; Grid has `headerBoxLayerWithOpenMenu: "z-location-menu"` (`src/views/shared/locationRowVariant.ts:105,112,128`).
- ✅ `useFixedMenuPosition` places the menu at `top = button bottom + LOCATION_MENU_OFFSET_PX`, `right = clientWidth − button right`, re-read on capture `scroll` and `resize`, and never looks at the room below (`src/views/shared/useFixedMenuPosition.ts:31-41`); its test `useFixedMenuPosition.test.ts` exists.
- ✅ `LOCATION_MENU_OFFSET_PX` is exported from `src/constants/index.ts:40`; `LOCATION_MENU_VIEWPORT_MARGIN_PX` does not exist yet.
- ✅ Layers: `page-bar` 10, `location-menu` 20 (`packages/client/tailwind.config.ts:73,75`). The normal header is not sticky; only the meeting bar (`sticky top-0 z-meeting-bar`) and the date bar (`sticky bottom-0 z-page-bar`) are (`src/app/MainPage.tsx:20,92`).
- ✅ `useMeetingShare.finishShare` returns on `CANCELLED`, otherwise closes the dialog and sets the notice; it never clears the meeting range (`src/controller/useMeetingShare.ts:48-52`). The notice is reset on a range change (`useMeetingShare.ts:37`).
- ✅ `AppShell` clears the range for Clear meeting inline (`isFocusAfterClearDue.current = true; clearMeetingRange()`), and an effect focuses `ADD_LOCATION_BUTTON_ID` once `meetingBar` is undefined (`src/app/AppShell.tsx:115-123,176-180`).
- ✅ The share dialog is a child of `AppShellMeeting` and unmounts with the meeting bar (`src/app/AppShellMeeting.tsx:31-38`); `MeetingShareDialog.onCloseAutoFocus` calls `preventDefault()` then `returnFocusRef.current?.focus()` (`src/views/shared/MeetingShareDialog.tsx:67-70`).
- ✅ `finishShare` is called with the destination's outcome after `await destination.share(...)` (`src/controller/useMeetingShareDialog.ts:158`).
- ✅ `CLEAR_MEETING_RANGE` exists (`src/model/locations.ts`, `src/controller/useMeetingRange.ts`) and `meeting-range` → "Set and clear a meeting range" keeps the reference moment pinned at the former start (`openspec/specs/meeting-range/spec.md:41`).
- ✅ MODIFIED "Share dialog opens and closes", "Share from the share dialog" and "Accessible share dialog" exist in `openspec/specs/meeting-share-dialog/spec.md:10,121,149`, and the deltas restate them with only the share-outcome changes.
- ✅ `locations` → "Location menu" says "The open menu MUST lie inside the screen", checked only by "Open menu inside the screen" with Almaty and Moscow (`openspec/specs/locations/spec.md:1019,1087-1095`).
- ✅ `grid-view` → "Grid layers stay under the page bars and dialogs" exists (`openspec/specs/grid-view/spec.md:864`).
- ✅ Root `README.md:44-53` and `README.ru.md:44-53` show the five `docs/design/screens/*.png` with widths 300/720.
- ✅ "the locations screen matches the approved screenshot" names the file after the test title with non-alphanumerics replaced (`src/test/features/locations/steps/locations_layout_e2e.steps.ts:64-78`); outline titles with `<param>` give names such as `Approved-screenshots-of-Grid-at-1180-by-820-px-in-the-dark-theme.png` under `__screenshots__/chromium/`.
- ✅ `DESKTOP_ONLY_TAG_PATTERN` is excluded only from `mobile-chrome`; view-contract projects run only `@view-contract` (`playwright.bdd.config.ts:53,95-150`).
- ✅ The steps D4 and tasks 3.3/5.1 name exist: "the list has 12 locations", "the user scrolls to the end" (`date_selection_layout_e2e.steps.ts:27,73`), "the open menu lies inside the screen" (`locations_menu_button_e2e.steps.ts:182`), "the locations screen uses the … theme", "the locations screen has no accessibility violations" (`locations_view_a11y_e2e.steps.ts:18,34`), "the screen is {int} by {int} px for the locations" (`locations_reorder_drag_e2e.steps.ts:166`), "the user opens the locations app", "the view mode is Grid/Cards", "the locations interface language is English/Russian", "the current time is {string}", "the list holds … and home is …", "a browser with a system share", "the user chooses Share meeting", "the user chooses Share in the dialog", "no share notice is shown", "the user sets the sample meeting", "the meeting range is from {string} to {string}", "no meeting range is set", 'focus is on the "Add location" action'.
- ✅ The test files tasks 4.x name exist: `src/controller/useMeetingShareSending.test.tsx`, `src/app/AppShell.meeting.test.tsx`, `createInMemoryTextSharing` from `@/adapters` (`src/adapters/index.ts:39`), `createMeetingGridSession` (`src/test/features/grid_view/steps/meetingGridSession.ts`), the outline "Outcomes of a share from the dialog" (`meeting_share_dialog_unit.feature:39`), "Share where the browser can share" (`grid_view_meeting_share_e2e.feature:13`) and "Focus returns after a share" (`meeting_share_dialog_e2e.feature:43`). The unit worlds open the whole app (`meetingShareDialogWorld.tsx:148`, `meetingGridSession.ts:32`), so the AppShell wiring of D3 is reached.
- ✅ Glossary: **Location menu** (*Code:* `LocationMenu`, *Never:* context menu, kebab) and **Share meeting** (*Code:* `useMeetingShare` (open flag and notice), `TextSharing`) exist (`docs/glossary/locations.md:17`, `docs/glossary/time-selection.md:31`); `docs/architecture/views.md:46,91` hold the Meeting bar paragraph and the Location menu row.
- ❌ Task 3.3 reuses "the page has not scrolled" to check FR4/M2 in "The menu of the last row opens above its button", whose page is scrolled to the end. That step asserts `window.scrollX/scrollY` equal `{ x: 0, y: 0 }` (`src/test/features/time_selection/steps/time_selection_pointer_e2e.steps.ts:90-96`), so it cannot pass on a scrolled page (R2).
- ❌ Task 3.4 says the existing "An open location menu lies above the date bar" still passes. That scenario scrolls London's menu button to 4 px above the date bar and asserts "at least one menu item lies over the date bar" (`src/test/features/grid_view/grid_view_layers_e2e.feature:37-47`, `steps/grid_view_layers_e2e.steps.ts:37,138-147,172-178`). Under D1, the room below is only about the date bar's height, so the menu flips above and no item lies over the date bar (R1).

## Coverage

| id | proposal | spec | task |
|---|---|---|---|
| G1 | ✅ | n/a (met by FR1–FR4, NFR-R1, M1) | n/a (met by FR1–FR4, M1) |
| G2 | ✅ | n/a (met by FR5, FR6, M3) | n/a (met by FR5, FR6, M3) |
| G3 | ✅ | n/a (met by FR8, M4) | n/a (met by FR8, M4) |
| NG1 | ✅ | n/a | n/a (nothing clears on copied/failed; 4.1–4.3 assert it is kept) |
| NG2 | ✅ | n/a | n/a (3.2 keeps the items and the keyboard) |
| NG3 | ✅ | n/a | n/a (no other popup touched) |
| NG4 | ✅ | n/a | n/a (D4 leaves `docs/design/screens/` alone) |
| NG5 | ✅ | n/a | n/a (no Cards meeting work) |
| FR1 | ✅ | ✅ locations "opens where it fits" | ✅ 2.1–2.2, 3.1–3.3 |
| FR2 | ✅ | ✅ "No room on either side", keyboard scenario | ✅ 2.1, 3.2, 3.3 |
| FR3 | ✅ | ✅ "The menu follows a scroll" | ✅ 3.1, 3.3 |
| FR4 | ✅ | ✅ "the page has not scrolled" in both outlines | ✅ 3.3 (step reuse is wrong, R2) |
| FR5 | ✅ | ✅ meeting-share-dialog ADDED + MODIFIED | ✅ 4.1–4.3, 5.1 |
| FR6 | ✅ | ✅ "Focus after a shared meeting" | ✅ 4.2, 5.1 |
| FR7 | ✅ | ✅ "The ways out of the share dialog" | ✅ 4.1–4.3, 5.1 |
| FR8 | ✅ | ✅ main-page "README screenshots of the running app" | ✅ 6.1, 6.2 + H1 |
| NFR-P1 | ✅ | ✅ in the locations requirement text | ✅ 3.1, 7.2 |
| NFR-A1 | ✅ | ✅ axe and topmost scenarios | ✅ 3.3 (date-bar overlap not exercised, R1) |
| NFR-A2 | ✅ | ✅ keyboard limited menu | ✅ 3.2, 3.3 |
| NFR-A3 | ✅ | ✅ "Accessible share dialog" MODIFIED | ✅ 5.1 |
| NFR-R1 | ✅ | ✅ outlines over 3 sizes × 2 views | ✅ 3.3 |
| UX1 | ✅ | ✅ | ✅ 3.2, 3.3 |
| UX2 | ✅ | ✅ | ✅ 3.2, 3.3 |
| UX3 | ✅ | ✅ "back to normal" | ✅ 4.2, 5.1 |
| M1 | ✅ | n/a | ✅ 3.3 |
| M2 | ✅ | n/a | ✅ 3.3 (step reuse is wrong, R2) |
| M3 | ✅ | n/a | ✅ 4.3 |
| M4 | ✅ | n/a | ✅ 6.1, 6.2 |
| M5 | ✅ | n/a | ✅ 3.3 |
| M6 | ✅ | n/a | ✅ 7.1 |

## Consistency

- Task 3.4 (`tasks.md`, group 3, item 3.4) expects "An open location menu lies above the date bar" to pass unchanged, but D1 (`design.md`, D1) and the locations delta (`specs/locations/spec.md:4`) make a menu with no room below open above its button. That is exactly the set-up of `grid_view_layers_e2e.feature:44-47`, whose "at least one menu item lies over the date bar" then fails (R1).
- `proposal.md:17` ("What Changes") and `proposal.md:32` ("Capabilities") list two MODIFIED requirements of `meeting-share-dialog`, but `specs/meeting-share-dialog/spec.md:42` also modifies a third, "Accessible share dialog" (R3).

## Findings

### R1 — WARNING — The flip breaks the existing date-bar layering test, and no new scenario puts the menu over the date bar
- Location: `openspec/changes/keep-location-menu-in-view-and-clear-range-after-share/tasks.md` task 3.4; `specs/locations/spec.md:72-80`
- Rule: `.claude/rules/test-planning.md`
- Problem: `packages/client/src/test/features/grid_view/grid_view_layers_e2e.feature:37-47` scrolls so that London's menu button lies 4 px above the date bar (`GAP_ABOVE_DATE_BAR_PX = 4`, `grid_view_layers_e2e.steps.ts:37,138-147`), opens the menu and asserts "at least one menu item lies over the date bar" (`steps:172-178`, `toBeGreaterThan(0)`). Under D1, the room below is the date bar's height minus 4 px, which is less than the four-item menu, so the menu opens above. No item lies over the date bar any more, yet task 3.4 requires this scenario to pass unchanged. The new scenario "The menu lies over the date bar" (`specs/locations/spec.md:72-80`) opens the last row's menu with the page scrolled to the end, which is again the flipped case. So the requirement's clause "the topmost element MUST be that item, also over the date bar" and `grid-view` → "An open location menu MUST still lie above the date bar" (`openspec/specs/grid-view/spec.md:865`) end up with no scenario in which the menu really overlaps the date bar.
- Impact: task 3.4's verification fails as written, and the implementer either stops or edits an existing test with no task telling them how. Even after a fix of the old test, the layer order of a menu over the date bar is left untested by the change, which the stable `grid-view` requirement relies on.
- Fix: in task 3.4, replace the plain re-run with an edit of `grid_view_layers_e2e.feature` "An open location menu lies above the date bar" and its step. The scroll step becomes "the page is scrolled so that the menu of {string} opens under its button and reaches over the date bar": it places the button's bottom at `viewport height − (menu height + 2 × 4 px)`, which is still above the date bar's top. Tag the scenario `@keep-location-menu-in-view-and-clear-range-after-share @NFR-A1`. Add `## MODIFIED Requirements` → "Grid layers stay under the page bars and dialogs" to a new `specs/grid-view/spec.md`, with the requirement text restated verbatim and the scenario GIVEN "the page is scrolled so that a row's location menu opens under its button and reaches over the date bar". List `grid-view` under "Modified Capabilities" and "What Changes". Give the locations scenario "The menu lies over the date bar" the same GIVEN, so the Cards view is covered too.
- Fix risk: the MODIFIED block must copy the stable requirement text in full, or the archive merge drops lines. The new scroll position depends on the menu being taller than the date bar, which holds today (four 44 px items against one bar). The step file `grid_view_layers_e2e.steps.ts` gains a `// Verifies` line.
- Status: fixed
- Resolution: added specs/grid-view/spec.md (MODIFIED "Grid layers stay under the page bars and dialogs", text copied in full) whose scenario "An open location menu lies above the date bar" now scrolls so the menu opens under its button and reaches over the date bar and asserts at least one item over it; the locations scenario "The menu lies over the date bar" uses the same GIVEN; task 3.4 rewrites the grid_view_layers step (button bottom at viewport height − (menu height + offset + margin)) and tags it @NFR-A1; design D1, proposal What Changes, Capabilities and Behavior list grid-view.

### R2 — WARNING — "the page has not scrolled" cannot verify FR4/M2 on a scrolled page
- Location: `openspec/changes/keep-location-menu-in-view-and-clear-range-after-share/tasks.md` task 3.3; `specs/locations/spec.md:6-12`
- Rule: `.claude/rules/test-planning.md`
- Problem: task 3.3 reuses the existing step "the page has not scrolled" in "The menu of the last row opens above its button", which first scrolls the page to the end. That step asserts `{ x: window.scrollX, y: window.scrollY }` equals `{ x: 0, y: 0 }` (`packages/client/src/test/features/time_selection/steps/time_selection_pointer_e2e.steps.ts:90-96`), so it checks an absolute position, not "did not scroll since opening". M2 asks for the scroll offset to change by 0 px when the menu opens.
- Impact: as written, the six last-row cases of the outline always fail, even with a correct implementation. Or the implementer drops the assertion, and FR4/M2 go untested exactly in the case the task is about: a menu at the bottom of a scrolled page.
- Fix: in task 3.3, add the missing steps "the page scroll offset is noted" (before the menu opens) and "the page scroll offset is unchanged", which compare `window.scrollX/scrollY` with the noted values. Use them in both outlines in place of "the page has not scrolled", and change the delta scenario line to "the page scroll offset is the same as before the menu opened".
- Fix risk: none. The existing step stays as it is for its own scenarios in `time_selection`.
- Status: fixed
- Resolution: task 3.3 no longer reuses "the page has not scrolled" and adds the steps "the page scroll offset is noted" and "the page scroll offset is the same as before the menu opened"; both outlines in specs/locations/spec.md now end with "the page scroll offset is the same as before the menu opened".

### R3 — SUGGESTION — The proposal does not list the third MODIFIED requirement
- Location: `openspec/changes/keep-location-menu-in-view-and-clear-range-after-share/proposal.md:17,32`
- Rule: `.claude/rules/proposal-format.md`
- Problem: "What Changes" and "Capabilities" name only "Share dialog opens and closes" and "Share from the share dialog" as MODIFIED in `meeting-share-dialog`. The delta also modifies "Accessible share dialog" (`specs/meeting-share-dialog/spec.md:42-58`: the focus after the outcome shared, and the new scenario "Focus after a shared meeting").
- Impact: a reader of the proposal misses that the accessibility requirement's focus rule changes, so the archive review can't trace that edit back to the proposal.
- Fix: in `proposal.md:17` and `proposal.md:32`, add "Accessible share dialog" (the focus after the outcome shared goes to Add location) to the MODIFIED list.
- Fix risk: none.
- Status: fixed
- Resolution: proposal.md "What Changes" and "Modified Capabilities" now list "Accessible share dialog" as MODIFIED (focus to Add location after the outcome shared, new scenario "Focus after a shared meeting").

## Verdict

Needs revision: R1 and R2 block, because tasks 3.3 and 3.4 can't pass as written. R3 is polish.
