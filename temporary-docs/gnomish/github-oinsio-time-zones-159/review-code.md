# Review: keep-location-menu-in-view-and-clear-range-after-share

## Summary

| Item | Value |
|---|---|
| Tasks verified | 18/19 |
| Requirements traced | 46/49 |
| CRITICAL | 1 |
| WARNING | 2 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `docs/glossary/locations.md:17` (Location menu: where it opens; *Code:* `getLocationMenuPlacement`, `LocationMenuSide`, `useLocationMenuPlacement`), `docs/glossary/time-selection.md:31` (Share meeting: a shared outcome clears the range; `onMeetingShared`).
- ✅ 1.2 — `docs/architecture/views.md:91` ("opens where it fits") and `:46` ("A share whose outcome is shared clears the range").
- ✅ 2.1 — `packages/client/src/views/shared/locationMenuPlacement.test.ts`: `it.each` over the "Choosing the side" rows (100/144, 360/404, 420/464, 550/594) and the "No room on either side" rows (148, 152), plus the exact-fit, one-pixel-over and equal-rooms boundaries.
- ✅ 2.2 — `packages/client/src/views/shared/locationMenuPlacement.ts:7-49`. `LOCATION_MENU_VIEWPORT_MARGIN_PX = 4` is in `packages/client/src/constants/locationMenu.ts:9`, not `grid.ts`, and is exported from `constants/index.ts:62`. The comment at `locationMenu.ts:1` explains the move: it keeps the constants out of the initial chunk (NFR-P1). The deviation is documented and harmless.
- ✅ 3.1 — `useFixedMenuPosition.ts` and its test were deleted. `packages/client/src/views/shared/useLocationMenuPlacement.ts:52-114` takes the trigger ref, menu ref, open flag and fixed flag. Its tests in `useLocationMenuPlacement.test.ts` cover: the fixed BELOW `top` (:64), the fixed ABOVE `bottom` (:112), the side change after a scroll (:125), one read per opening and per event (:137, :145, :157), the resize re-read (:184), no `ResizeObserver` (:194), and cleanup (:205).
- ✅ 3.2 — `packages/client/src/views/shared/LocationMenu.tsx:71-80` (menu ref and the `useLocationMenuPlacement` call) and `:221-223` (`ref={menuRef}`, `placement.style`, `placement.positionClassName`). The file is 250 lines. `LocationMenu.placement.test.tsx` covers `top-full`, `bottom-full`, the limited height and the fixed `bottom`.
- ✅ 3.3 — `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature` contains every scenario of the delta. It reuses the date-bar step and adds new steps in `steps/locations_menu_placement_e2e.steps.ts` (scroll offset noted/compared at :39-52, last/first/middle row at :53, button in the middle of the viewport at :101, above/under at :65/:132). The weak date-bar assertion is reported as R3.
- ❌ 3.4 — The step was replaced and "the menu of {string} lies under its button" was added (`grid_view/steps/grid_view_layers_e2e.steps.ts:142-163` scroll step, `:164-170` under-its-button step). But the task says the scenario "keeps London", and `grid_view_layers_e2e.feature:41` swaps London for a second "Tokyo", which `parseStoredLocations.ts:78` (`if (knownIds.has(id)) continue;`) drops. The scenario therefore runs with 11 locations, not the 12 its spec scenario requires. The task is ticked but not done (R1).
- ✅ 4.1 — `packages/client/src/controller/useMeetingShare.ts:30-72`; `finishShare` (:52-60) calls `onMeetingShared` only on `ShareOutcome.SHARED` (:57). `useMeetingShareSending.test.tsx:109` has the `it.each` over the four outcomes, and `:139` covers closing.
- ✅ 4.2 — `packages/client/src/app/AppShell.tsx:119-123`: one `clearMeetingAndFocusAddLocation`, passed as `onMeetingShared` at :123 and as `onClear` at :183. Tests: `src/app/AppShell.meetingShared.test.tsx:59, 80, 98`.
- ✅ 4.3 — `meeting_share_dialog_unit.feature:38-50` has the `range` column and the tags. `grid_view_meeting_share_unit.feature:43-62` holds "The ways out of the share dialog" (six rows) and "A shared meeting stores nothing", with steps in `grid_view_meeting_share_unit.steps.tsx`.
- ✅ 5.1 — `grid_view_meeting_share_e2e.feature:13` ("Share where the browser can share" now ends with "no meeting range is set" and focus on "Add location"), `:31` (back to normal) and `:43` (close button keeps the range). `meeting_share_dialog_e2e.feature:51` covers "Focus after a shared meeting".
- ✅ 6.1 — `main_page/main_page_readme_screenshots_e2e.feature` has ten `@desktop-only` rows (`:18-25` and the second outline from `:39`), and the ten baselines `__screenshots__/chromium/README-screenshot-*.png` are in the diff. Their content is reported as R2.
- ✅ 6.2 — `temporary-docs/gnomish/github-oinsio-time-zones-159/handoff/H1-readme-screenshots.patch`: `git apply --check` passes. It adds 5 `-en` and 5 `-ru` images, keeps the widths, and adds no `docs/design/screens` line. `handoff/README.md` has the `## H1` section.
- ✅ 7.1 — Measured in this review: 100 % for all three files (see Mutation).
- ✅ 7.2 — No change to `scripts/check-bundle-size.mjs` in the diff. CI is green. The constants split (`gridShades.ts`, `locationMenu.ts`) is the bundle measure.
- ✅ 7.3 — The diff adds no baseline other than the ten `README-screenshot-*` files.
- ✅ 7.4 — Every id FR1–FR8, NFR-P1, NFR-A1–A3, NFR-R1, UX1–UX3 and M1–M5 is found as a tag or a `Verifies`/`Implements` comment in the feature, test and source files listed under Requirements.
- ✅ 7.5 — `grep -iE "kebab|context menu|popover"` finds nothing in the three view files.

## Requirements

- ✅ FR1 — `locationMenuPlacement.ts:43-48` (side choice) and `useLocationMenuPlacement.ts:65-98` (reads the button box and the menu's `scrollHeight`, sets the side), with the side classes at `:33-41`. Tests: `locationMenuPlacement.test.ts` and the e2e outlines "The menu of the last row opens above its button" / "…first row opens under its button" (`locations_menu_placement_e2e.feature:5-26`, `:28-48`).
- ✅ FR2 — larger side with `maxHeightPx` (`locationMenuPlacement.ts:47-48`) and `maxHeight` with `overflowY: "auto"` (`useLocationMenuPlacement.ts:93-95`). Tests: the "No room on either side" table tests, `LocationMenu.placement.test.tsx`, and the e2e "Every item of a limited menu can be reached by the keyboard" (`locations_menu_placement_e2e.feature:63`).
- ✅ FR3 — capture `scroll` and plain `resize` listeners (`useLocationMenuPlacement.ts:100-101`, removed at `:103-104`), with the fixed `right` kept (`:79`). Tests: `useLocationMenuPlacement.test.ts:125, 145, 184` and the e2e "The menu follows a scroll" (`locations_menu_placement_e2e.feature:51`).
- ✅ FR4 — the placement does not scroll the page. Tested by the e2e steps "the page scroll offset is noted / is the same as before the menu opened" in both outlines (`locations_menu_placement_e2e.feature:13, 17, 35, 39`).
- ✅ FR5 — `useMeetingShare.ts:57` and `AppShell.tsx:119-123`. Tests: `useMeetingShareSending.test.tsx:109`, `AppShell.meetingShared.test.tsx:59`, the unit BDD "The ways out of the share dialog", and e2e `grid_view_meeting_share_e2e.feature:13, 31`.
- ✅ FR6 — the existing AppShell effect focuses `ADD_LOCATION_BUTTON_ID` (`AppShell.tsx:125-129`). Tests: `AppShell.meetingShared.test.tsx:59` and the e2e "Focus after a shared meeting" (`meeting_share_dialog_e2e.feature:51`).
- ✅ FR7 — `finishShare` returns early on CANCELLED (`useMeetingShare.ts:54`) and calls `onMeetingShared` only for SHARED (`:57`). Tests: the unit outline rows (close button, Esc, cancelled, copied, failed), `AppShell.meetingShared.test.tsx:80, 98`, and the e2e "Closing with the close button keeps the meeting" (`grid_view_meeting_share_e2e.feature:43`).
- ✅ FR8 — ten approved baselines from `main_page_readme_screenshots_e2e.feature` and the H1 patch that links them. Their content is reported as R2.
- ✅ NFR-P1 — one `getBoundingClientRect` and one `scrollHeight` read per opening and per event (`useLocationMenuPlacement.ts:66, 72`), with no `ResizeObserver` and no timer. Tests: `useLocationMenuPlacement.test.ts:137-203`. Bundle budget unchanged.
- ⚠️ NFR-A1 — axe-core runs with the menu opened above (`locations_menu_placement_e2e.feature:97-115`) and the topmost check runs over the date bar. But the locations date-bar scenario never asserts that any item lies over the bar, so its topmost check can pass vacuously (R3). The topmost check for a menu opened above or with a limited height is not tested at all (R4).
- ✅ NFR-A2 — the keyboard handling is unchanged (`LocationMenu.tsx:139-170`). Tests: the e2e step "the menu items can be reached one by one with the arrow keys inside the screen" (`locations_menu_placement_e2e.steps.ts:114`), and the Arrow Up wrap in `LocationMenu.placement.test.tsx`.
- ✅ NFR-A3 — focus goes to Add location after a shared outcome. Tests: `AppShell.meetingShared.test.tsx:59` and e2e `meeting_share_dialog_e2e.feature:51`.
- ✅ NFR-R1 — both outlines run over 320×568, 390×844 and 844×390 with 12 locations, in Cards and Grid (`locations_menu_placement_e2e.feature:20-26`, `:42-48`).
- ✅ UX1 — the same classes; `bottom-full mb-1` mirrors `top-full mt-1` (`useLocationMenuPlacement.ts:38-40`), and the fixed variant uses `LOCATION_MENU_OFFSET_PX` for `top` and `bottom` (`:80-87`). Tagged on the e2e outlines (`locations_menu_placement_e2e.feature:5, 28`).
- ✅ UX2 — `maxHeight` on the bordered menu element itself, so the border and shadow wrap the visible part (`LocationMenu.tsx:222-223`). Tests: `LocationMenu.placement.test.tsx` and the e2e limited-menu outline.
- ✅ UX3 — normal header, no notice (`NOTICE_BY_OUTCOME` has no SHARED entry, `useMeetingShare.ts:12-15`). Test: e2e "After a shared meeting the Grid view is back to normal" (`grid_view_meeting_share_e2e.feature:31`).
- ✅ M1 — 12 cases: two outlines × six Examples rows (`locations_menu_placement_e2e.feature:21-26`, `:43-48`), each with "the open menu lies inside the screen".
- ✅ M2 — the same 12 cases assert an unchanged scroll offset.
- ✅ M3 — six rows in `grid_view_meeting_share_unit.feature:51-56`.
- ✅ M4 — the patch adds 5 + 5 `README-screenshot-*` links and no `docs/design/screens` link; there are 10 baselines.
- ✅ M5 — four rows (Cards/Grid × light/dark) in `locations_menu_placement_e2e.feature:112-115`.
- ✅ M6 — measured: `locationMenuPlacement.ts`, `useLocationMenuPlacement.ts` and `useMeetingShare.ts` 100 % each (see Mutation).
- ✅ Scenario: Dialogs cover the grid — unchanged existing outline, `grid_view_layers_e2e.feature:6`.
- ✅ Scenario: Rows scroll under the date bar — unchanged, `grid_view_layers_e2e.feature:24`.
- ⚠️ Scenario: An open location menu lies above the date bar — `grid_view_layers_e2e.feature:37-48` asserts "under its button", "on top" and "at least one menu item lies over the date bar". But it seeds 11 distinct locations (a duplicate "Tokyo" replaces London at :41), not the 12 the spec's GIVEN names (R1).
- ✅ Scenario: The menu of the last row opens above its button — `locations_menu_placement_e2e.feature:5-26`.
- ✅ Scenario: The menu of the first row opens under its button — `locations_menu_placement_e2e.feature:28-48`.
- ✅ Scenario: Choosing the side — table rows in `locationMenuPlacement.test.ts` (first `it.each`).
- ✅ Scenario: No room on either side — `locationMenuPlacement.test.ts` (second `it.each`: 148 BELOW, 152 ABOVE).
- ✅ Scenario: The menu follows a scroll — `locations_menu_placement_e2e.feature:51` and `useLocationMenuPlacement.test.ts:125`.
- ✅ Scenario: Every item of a limited menu can be reached by the keyboard — the e2e outline at `locations_menu_placement_e2e.feature:63` (844×300, Cards and Grid).
- ⚠️ Scenario: The menu lies over the date bar — `locations_menu_placement_e2e.feature:79-95` omits the spec's "at least one menu item lies over the date bar" (R3).
- ✅ Scenario: No accessibility violations with the menu opened above — `locations_menu_placement_e2e.feature:97-115`.
- ✅ Scenario: The screenshots are approved screenshots of the app — `main_page_readme_screenshots_e2e.feature`, ten rows.
- ✅ Scenario: The READMEs show the approved screenshots — the H1 patch (`git apply --check` passes, 5 + 5 links).
- ✅ Scenario: The dialog opens with its defaults — `meeting_share_dialog_unit.feature:10`.
- ✅ Scenario: The reference line without a home location — `meeting_share_dialog_unit.feature:16`.
- ✅ Scenario: Closing keeps the meeting — `meeting_share_dialog_e2e.feature:14` (outline: close button and Esc) and the unit outline rows.
- ✅ Scenario: Outcomes of a share from the dialog — `meeting_share_dialog_unit.feature:38-50` with the `range` column.
- ✅ Scenario: Focus enters and returns — `meeting_share_dialog_e2e.feature:35`.
- ✅ Scenario: Focus returns after a share — `meeting_share_dialog_e2e.feature:43` (copied/failed).
- ✅ Scenario: Focus after a shared meeting — `meeting_share_dialog_e2e.feature:51`.
- ✅ Scenario: Controls announce their names and states — `meeting_share_dialog_e2e.feature:59`.
- ✅ Scenario: Esc in the open language list — `meeting_share_dialog_e2e.feature:70`.
- ✅ Scenario: Keyboard only — `meeting_share_dialog_e2e.feature:79`.
- ✅ Scenario: No accessibility violations — `meeting_share_dialog_e2e.feature:87`.
- ✅ Scenario: The ways out of the share dialog — `grid_view_meeting_share_unit.feature:43-56`.
- ✅ Scenario: After a shared meeting the Grid view is back to normal — `grid_view_meeting_share_e2e.feature:31`.
- ✅ Scenario: A shared meeting stores nothing — `grid_view_meeting_share_unit.feature:58-62`.

## Mutation

Each run used `npx stryker run --mutate …` from `packages/client`, one at a time:

- `src/views/shared/locationMenuPlacement.ts` — 100.00 % (22 killed, 0 survived)
- `src/views/shared/useLocationMenuPlacement.ts` — 100.00 % (49 killed, 0 survived)
- `src/controller/useMeetingShare.ts` — 100.00 % (37 killed, 0 survived)
- `src/views/shared/LocationMenu.tsx` — 97.03 % (96 killed, 2 timeout, 2 survived, 1 no coverage). The survivors are at line 61 (the `isMenuFixedToViewport = false` default) and line 195 (the forwarded trigger ref branch), and the no-coverage mutant is also at line 195. These lines are not part of this branch's change.

`src/app/AppShell.tsx` was not mutated separately. Its change is a three-line handler extraction, covered by `AppShell.meetingShared.test.tsx` and `AppShell.meeting.test.tsx`.

## Findings

### R1 — CRITICAL — Task 3.4 is ticked, but the date-bar layering scenario seeds a duplicate Tokyo and runs with 11 locations
- Location: `packages/client/src/test/features/grid_view/grid_view_layers_e2e.feature:41`
- Rule: tasks.md 3.4 ("'An open location menu lies above the date bar' keeps London and its title"); the change's `grid-view` delta ("GIVEN the Grid view at 390 by 844 px with 12 locations")
- Problem: The branch replaced the twelfth stored location "London" with a second "Tokyo": `And the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "Tokyo"`. Both entries get the same id, and `packages/client/src/model/parseStoredLocations.ts:78` (`if (knownIds.has(id)) continue;`) drops the duplicate. The scenario therefore runs with 11 locations, while its text lists twelve and the modified spec scenario requires 12. Task 3.4 is ticked although the scenario no longer keeps London.
- Impact: A ticked task is not done: the scenario does not keep London, and the spec's "with 12 locations" GIVEN is not what is verified. The Gherkin also misstates its own state: a reader sees twelve names and cannot tell that one is silently discarded.
- Fix: Replace the trailing `"Tokyo"` at line 41 with `"London"`, so the seed is the twelve distinct cities that `locations_menu_placement_e2e.feature`'s "The menu lies over the date bar" also uses. Keep "Tokyo" as the row whose menu is opened (lines 44-46); task 3.4 asks to keep London in the scenario, not to open London's menu, and the delta scenario names no city.
- Fix risk: Low. The new scroll step (`grid_view_layers_e2e.steps.ts:142-163`) positions any row from its measured menu height, and the identical twelve-city seed with Tokyo as the target already passes in `locations_menu_placement_e2e.feature` for the Grid view. With London back as the last row, Tokyo moves no further from the end of the page, so the scroll target stays reachable.
- Status: fixed
- Resolution: restored "London" as the twelfth stored location at grid_view_layers_e2e.feature:41, so the scenario runs with 12 distinct locations; the scenario passes in the BDD e2e run.

### R2 — WARNING — README screenshots show the one-time offline-ready notice over the app
- Location: `packages/client/src/test/features/main_page/main_page_readme_screenshots_e2e.feature:14`
- Rule: — (FR8 / G3 of this change: the READMEs must show the app as it is)
- Problem: Both outlines open the app and take the screenshot right away (`:13-14`, `:35-37`). The app has just installed its service worker, so all ten baselines (for example `__screenshots__/chromium/README-screenshot-cards-phone-light-ru.png` and `…-cards-phone-dark-en.png`) show the transient "The app is ready to work offline. / Dismiss" toast. The glossary (`docs/glossary/app-shell.md:7`) defines this Offline-ready notice as "shown at most once per installation".
- Impact: The phone images in both READMEs have the toast covering the lower part of the New York card. The desktop images show it floating above the date bar. Every reader of the README sees a one-time first-run notice as if it were part of the main screen, and the phone shots hide the content they should show. The user asked for up-to-date screenshots of the app, and these show something a returning user never sees.
- Fix: Add a step to `main_page/steps/` (for example `When the offline-ready notice is dismissed`) that calls the existing `dismissOfflineReadyNotice(page)` from `packages/client/src/test/features/time_selection/steps/timeSelectionE2eHelpers.ts:24`. Put it after "When the user opens the locations app" in the first outline, and after "the user sets the sample meeting" in the second. Then re-approve the ten `README-screenshot-*` baselines with `--update-snapshots`. The H1 patch's paths do not change.
- Fix risk: The ten baselines must be regenerated, and each scenario may wait up to `OFFLINE_NOTICE_WAIT_MS` (1.5 s, `timeSelectionE2eHelpers.ts:17`). The helper first awaits `navigator.serviceWorker.ready` and ignores a missing button, so it cannot fail a run where the notice does not appear. No other baseline is affected.
- Status: fixed
- Resolution: added step "the offline-ready notice is dismissed" (main_page_readme_screenshots_e2e.steps.ts, English and Russian button) to both outlines, deleted and regenerated the ten README-screenshot baselines without the toast.

### R3 — WARNING — "The menu lies over the date bar" can pass without any item over the date bar
- Location: `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature:90`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it"); the `locations` delta scenario "The menu lies over the date bar" ("THEN the menu lies under its button and at least one menu item lies over the date bar")
- Problem: The scenario ends with "every menu item over the date bar has that menu item on top". That step (`grid_view/steps/grid_view_layers_e2e.steps.ts:187-195`) loops only over the items whose centre lies inside the date bar's box. The spec's "at least one menu item lies over the date bar" is missing, though the step exists (`grid_view_layers_e2e.steps.ts:197`) and the Grid layers scenario uses it (`grid_view_layers_e2e.feature:48`).
- Impact: If no item centre lands inside the bar, the topmost loop runs zero times and the scenario passes. For example, a layout change could make the date bar shorter or move it, or the scroll step could land off target in the Cards view. A regression where the date bar covers the menu (the NFR-A1 defect this scenario exists to catch) then goes unnoticed in both views.
- Fix: Add `And at least one menu item lies over the date bar` after line 90, as `grid_view_layers_e2e.feature:48` does.
- Fix risk: The step already exists and passes in the Grid layers scenario with the same scroll step. If it fails in the Cards row, that exposes a real gap between the scroll target and the Cards date bar, which is what the scenario is meant to prove.
- Status: fixed
- Resolution: added "And at least one menu item lies over the date bar" to the Cards/Grid outline in locations_menu_placement_e2e.feature; both rows pass.

### R4 — SUGGESTION — No topmost check for a menu opened above its button
- Location: `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature:98`
- Rule: `.claude/rules/traceability.md` (every NFR has a test); NFR-A1 ("At the centre of every menu item that is inside the menu's visible box, the topmost element is that item")
- Problem: NFR-A1 and the `locations` requirement both require that, with the menu opened above its button or with a limited height, the topmost element at every visible item's centre is that item. The only topmost check runs for a menu opened under its button over the date bar. The "opened above" outline (`:97-115`) runs axe-core only, and axe-core does not detect a menu painted under the previous card or row.
- Impact: Suppose a later change gives a Cards row a stacking context (the sortable `transform`) or changes the sticky header layering of the Grid rows. An opened-above menu could then be partly covered by the row above it, and no test would fail. Today's code layers correctly (`z-location-menu` on the menu, `LocationMenu.tsx:223`), so this is a coverage gap, not a live defect.
- Fix: In `locations/steps/locations_menu_placement_e2e.steps.ts`, add a step "every menu item has that menu item on top" that uses `isTopmostAt` from `grid_view/steps/hourGridE2eHelpers.ts:37`. Run it at the centre of each `menuitem` inside the menu's box, and add it to the "No accessibility violations with the menu opened above" outline after "the menu lies above its button".
- Fix risk: Adds one new step. The outline must stay in the e2e feature (`bdd-e2e.md`: layering needs a real browser). It costs a few element lookups per row.
- Status: rejected (not-worth-it)
- Resolution: coverage gap only, no live defect (menu has z-location-menu); the extra topmost step for opened-above menus costs a new step and e2e time for a hypothetical future regression and is optional per the review verdict.

## Verdict

Not ready. R1 blocks: task 3.4 is ticked but not done, since the date-bar layering scenario no longer keeps London and runs with 11 locations instead of the 12 the `grid-view` delta requires. It is a one-line fix in the feature file.

The menu placement and the clearing of the meeting range after a shared outcome work as specified. The fix stage should also fix the two WARNINGs:

- R2: the README images show the offline-ready toast.
- R3: the date-bar check can pass without any item over the bar.

R4 is optional.
