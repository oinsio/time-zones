# Review: keep-location-menu-in-view-and-clear-range-after-share

## Summary

| Item | Value |
|---|---|
| Tasks verified | 18/19 |
| Requirements traced | 46/49 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Tasks

- ✅ 1.1 — `docs/glossary/locations.md:17` (Location menu: where it opens; *Code:* `getLocationMenuPlacement`, `LocationMenuSide`, `useLocationMenuPlacement`), `docs/glossary/time-selection.md:31` (Share meeting: a shared outcome clears the range; `onMeetingShared`).
- ✅ 1.2 — `docs/architecture/views.md:91` ("opens where it fits") and `:46` ("a share whose outcome is shared clears the range").
- ✅ 2.1 — `packages/client/src/views/shared/locationMenuPlacement.test.ts`: `it.each` over the "Choosing the side" rows (100/144, 360/404, 420/464, 550/594) and "No room on either side" rows (148, 152), plus the exact-fit, one-pixel-over and equal-rooms boundaries.
- ✅ 2.2 — `packages/client/src/views/shared/locationMenuPlacement.ts:7-49`. `LOCATION_MENU_VIEWPORT_MARGIN_PX = 4` is in `packages/client/src/constants/locationMenu.ts:9`, not `grid.ts`, and is exported from `constants/index.ts:59-62`. The comment at `locationMenu.ts:1` explains the move: it keeps the constants out of the initial chunk (NFR-P1). The deviation is documented and harmless.
- ✅ 3.1 — `useFixedMenuPosition.ts` and its test were deleted. `packages/client/src/views/shared/useLocationMenuPlacement.ts:101-163` takes the trigger ref, menu ref, open flag and fixed flag. Its tests in `useLocationMenuPlacement.test.ts` cover: BELOW `top` (:64), ABOVE `bottom` (:112), the side change after a scroll (:125), one read per opening and per event (:137, :145, :157), no `ResizeObserver` (:194), and cleanup (:205).
- ✅ 3.2 — `packages/client/src/views/shared/LocationMenu.tsx:71-80, 221-223` (menu ref, `placement.style`, `placement.positionClassName`). The file is 250 lines. `LocationMenu.placement.test.tsx` covers `top-full`, `bottom-full`, the limited height and the fixed `bottom`.
- ✅ 3.3 — `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature` contains every scenario of the delta. It reuses the date-bar step and adds new steps in `steps/locations_menu_placement_e2e.steps.ts` (scroll offset noted/compared at :39-52, last/first/middle row at :53, above/under at :65/:132). The weak date-bar assertion is reported as R3.
- ❌ 3.4 — The step was replaced and "the menu lies under its button" was added (`grid_view/steps/grid_view_layers_e2e.steps.ts:142-173`). But the task says the scenario "keeps London", and `grid_view_layers_e2e.feature:41` swaps London for a second "Tokyo", which the storage parser drops. The scenario therefore runs with 11 locations, not the 12 its spec scenario requires (R2).
- ✅ 4.1 — `packages/client/src/controller/useMeetingShare.ts:30-61` (`onMeetingShared` is called only on `ShareOutcome.SHARED`). `useMeetingShareSending.test.tsx:109` has the `it.each` over the four outcomes, and `:139` covers closing.
- ✅ 4.2 — `packages/client/src/app/AppShell.tsx:119-123, 183` has one `clearMeetingAndFocusAddLocation`, used for Clear and passed as `onMeetingShared`. `src/app/AppShell.meetingShared.test.tsx:59, 80, 98`.
- ✅ 4.3 — `meeting_share_dialog_unit.feature:38-45` has the `range` column and the tags. `grid_view_meeting_share_unit.feature:44-62` holds "The ways out of the share dialog" (six rows) and "A shared meeting stores nothing", with steps in `grid_view_meeting_share_unit.steps.tsx`.
- ✅ 5.1 — `grid_view_meeting_share_e2e.feature:13, 31, 43` (shared clears the range and focuses Add location, back to normal, close button keeps the range). `meeting_share_dialog_e2e.feature:51` covers "Focus after a shared meeting".
- ✅ 6.1 — `main_page/main_page_readme_screenshots_e2e.feature` has ten `@desktop-only` rows, and the ten baselines `__screenshots__/chromium/README-screenshot-*.png` are in the diff. Their content is reported as R1.
- ✅ 6.2 — `temporary-docs/gnomish/github-oinsio-time-zones-159/handoff/H1-readme-screenshots.patch`: `git apply --check` passes. It adds 5 `-en` and 5 `-ru` images, keeps the widths, and adds no `docs/design/screens` line. `handoff/README.md` has the `## H1` section.
- ✅ 7.1 — Measured in this review: 100 % for all three files (see Mutation).
- ✅ 7.2 — No change to `scripts/check-bundle-size.mjs` in the diff. CI is green. The constants split (`gridShades.ts`, `locationMenu.ts`) is the bundle measure.
- ✅ 7.3 — The diff adds no baseline other than the ten `README-screenshot-*` files.
- ✅ 7.4 — Every id FR1–FR8, NFR-P1, NFR-A1–A3, NFR-R1, UX1–UX3 and M1–M5 is found as a tag or a `Verifies` comment in the feature and test files listed under Requirements.
- ✅ 7.5 — `grep -iE "kebab|context menu|popover"` finds nothing in the three view files.

## Requirements

- ✅ FR1 — `locationMenuPlacement.ts:43-48` and `useLocationMenuPlacement.ts:118-145`. Tests: `locationMenuPlacement.test.ts` and the e2e outlines "The menu of the last row opens above its button" / "…first row opens under its button" (`locations_menu_placement_e2e.feature:5-36`).
- ✅ FR2 — larger side with `maxHeightPx` (`locationMenuPlacement.ts:47-48`) and `overflowY: auto` (`useLocationMenuPlacement.ts:142-144`). Tests: "No room on either side" table tests, `LocationMenu.placement.test.tsx`, and the e2e "Every item of a limited menu can be reached by the keyboard".
- ✅ FR3 — capture `scroll` and `resize` listeners (`useLocationMenuPlacement.ts:149-150`), with fixed `right` kept. Tests: `useLocationMenuPlacement.test.ts:125, 145, 184` and e2e "The menu follows a scroll".
- ✅ FR4 — the placement does not scroll the page. Tested by the e2e steps "the page scroll offset is noted / is the same as before the menu opened" in both outlines.
- ✅ FR5 — `useMeetingShare.ts:57` and `AppShell.tsx:119-123`. Tests: `useMeetingShareSending.test.tsx:109`, `AppShell.meetingShared.test.tsx:59`, unit BDD "The ways out of the share dialog", and e2e `grid_view_meeting_share_e2e.feature:13, 31`.
- ✅ FR6 — the existing AppShell effect focuses `ADD_LOCATION_BUTTON_ID` (`AppShell.tsx:125-129`). Tests: `AppShell.meetingShared.test.tsx:59` and e2e "Focus after a shared meeting" (`meeting_share_dialog_e2e.feature:51`).
- ✅ FR7 — `finishShare` returns early on CANCELLED and calls `onMeetingShared` only for SHARED (`useMeetingShare.ts:52-58`). Tests: the unit outline rows (close button, Esc, cancelled, copied, failed), `AppShell.meetingShared.test.tsx:80, 98`, and e2e "Closing with the close button keeps the meeting".
- ✅ FR8 — ten approved baselines from `main_page_readme_screenshots_e2e.feature` and the H1 patch that links them. Their content is reported as R1.
- ✅ NFR-P1 — one `getBoundingClientRect` and one `scrollHeight` read per opening and per event, with no `ResizeObserver` and no timer. Tests: `useLocationMenuPlacement.test.ts:137-200`. Bundle budget unchanged.
- ⚠️ NFR-A1 — axe-core runs with the menu opened above (`locations_menu_placement_e2e.feature:98-114`) and the topmost check runs over the date bar. But the locations date-bar scenario never asserts that any item lies over the bar, so its topmost check can pass vacuously (R3). The topmost check for a menu opened above or with a limited height is not tested at all (R4).
- ✅ NFR-A2 — the keyboard handling is unchanged (`LocationMenu.tsx:139-155`). Tests: e2e "the menu items can be reached one by one with the arrow keys inside the screen", and Arrow Up wrap in `LocationMenu.placement.test.tsx`.
- ✅ NFR-A3 — focus goes to Add location after a shared outcome. Tests: `AppShell.meetingShared.test.tsx:59` and e2e `meeting_share_dialog_e2e.feature:51`.
- ✅ NFR-R1 — both outlines run over 320×568, 390×844 and 844×390 with 12 locations, in Cards and Grid.
- ✅ UX1 — the same classes; `bottom-full mb-1` mirrors `top-full mt-1` (`useLocationMenuPlacement.ts:87-89`), and the fixed variant uses `LOCATION_MENU_OFFSET_PX` (:130-135). Tagged on the e2e outlines.
- ✅ UX2 — `maxHeight` on the bordered menu element itself, so the border and shadow wrap the visible part (`LocationMenu.tsx:221-223`). Tests: `LocationMenu.placement.test.tsx` and the e2e limited-menu outline.
- ✅ UX3 — normal header, no notice (`NOTICE_BY_OUTCOME` has no SHARED entry, `useMeetingShare.ts:12-15`). Test: e2e "After a shared meeting the Grid view is back to normal" (`grid_view_meeting_share_e2e.feature:31`).
- ✅ M1 — 12 cases: two outlines × six Examples rows, each with "the open menu lies inside the screen".
- ✅ M2 — the same 12 cases assert an unchanged scroll offset.
- ✅ M3 — six rows in `grid_view_meeting_share_unit.feature:49-55`.
- ✅ M4 — the patch adds 5 + 5 `README-screenshot-*` links and no `docs/design/screens` link; there are 10 baselines.
- ✅ M5 — four rows (Cards/Grid × light/dark) in `locations_menu_placement_e2e.feature:110-114`.
- ✅ M6 — measured: `locationMenuPlacement.ts` 100 %, `useMeetingShare.ts` 100 % (see Mutation).
- ✅ Scenario: Dialogs cover the grid — unchanged existing outline, `grid_view_layers_e2e.feature:6`.
- ✅ Scenario: Rows scroll under the date bar — unchanged, `grid_view_layers_e2e.feature:24`.
- ⚠️ Scenario: An open location menu lies above the date bar — `grid_view_layers_e2e.feature:37-48` asserts "under its button", "on top" and "at least one item over the bar". But it seeds 11 distinct locations (a duplicate "Tokyo" replaces London), not the 12 the spec's GIVEN names (R2).
- ✅ Scenario: The menu of the last row opens above its button — `locations_menu_placement_e2e.feature:5-19`.
- ✅ Scenario: The menu of the first row opens under its button — `locations_menu_placement_e2e.feature:21-36`.
- ✅ Scenario: Choosing the side — table rows in `locationMenuPlacement.test.ts` (first `it.each`).
- ✅ Scenario: No room on either side — `locationMenuPlacement.test.ts` (second `it.each`: 148 BELOW, 152 ABOVE).
- ✅ Scenario: The menu follows a scroll — `locations_menu_placement_e2e.feature` "The menu follows a scroll" and `useLocationMenuPlacement.test.ts:125`.
- ✅ Scenario: Every item of a limited menu can be reached by the keyboard — the e2e outline at 844×300 in Cards and Grid.
- ⚠️ Scenario: The menu lies over the date bar — `locations_menu_placement_e2e.feature:79-96` omits the spec's "at least one menu item lies over the date bar" (R3).
- ✅ Scenario: No accessibility violations with the menu opened above — `locations_menu_placement_e2e.feature:98-114`.
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
- ✅ Scenario: The ways out of the share dialog — `grid_view_meeting_share_unit.feature:44-55`.
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

### R1 — WARNING — README screenshots show the one-time offline-ready notice over the app
- Location: `packages/client/src/test/features/main_page/main_page_readme_screenshots_e2e.feature:14`
- Rule: — (FR8 / G3 of this change: the READMEs must show the app as it is)
- Problem: Both outlines open the app and take the screenshot right away. The app has just installed its service worker, so all ten baselines (for example `__screenshots__/chromium/README-screenshot-cards-phone-light-ru.png` and `…-cards-phone-dark-en.png`) show the transient "The app is ready to work offline. / Dismiss" toast. The glossary (`docs/glossary/app-shell.md:7`) defines this Offline-ready notice as "shown at most once per installation".
- Impact: The phone images in both READMEs have the toast covering the lower part of the New York card. The desktop images show it floating above the date bar. Every reader of the README sees a one-time first-run notice as if it were part of the main screen, and the phone shots hide the content they should show. The user asked for up-to-date screenshots of the app, and these show something a returning user never sees.
- Fix: Add a step to `main_page/steps/` (for example `When the offline-ready notice is dismissed`) that calls the existing `dismissOfflineReadyNotice(page)` from `packages/client/src/test/features/time_selection/steps/timeSelectionE2eHelpers.ts`. Put it after "When the user opens the locations app" in both outlines, after "the user sets the sample meeting" in the second. Then re-approve the ten `README-screenshot-*` baselines with `--update-snapshots`. The H1 patch's paths do not change.
- Fix risk: The ten baselines must be regenerated, and each scenario may wait up to `OFFLINE_NOTICE_WAIT_MS` (1.5 s). The helper first awaits `navigator.serviceWorker.ready` and ignores a missing button, so it cannot fail a run where the notice does not appear. No other baseline is affected.
- Status: open

### R2 — WARNING — The date-bar layering scenario seeds a duplicate Tokyo and runs with 11 locations
- Location: `packages/client/src/test/features/grid_view/grid_view_layers_e2e.feature:41`
- Rule: the change's `grid-view` delta ("GIVEN the Grid view at 390 by 844 px with 12 locations"); tasks.md 3.4 ("keeps London and its title")
- Problem: The branch replaced the twelfth stored location "London" with a second "Tokyo". `buildStoredLocations` gives both entries the same id, and `parseStoredLocations.ts:78` (`if (knownIds.has(id)) continue;`) drops the duplicate. The scenario therefore runs with 11 locations, while its feature text claims 12 and the modified spec scenario requires 12. Task 3.4 is ticked although it says London is kept.
- Impact: The Gherkin no longer describes the state it tests. Its seed line reads as twelve locations, but the page has eleven, and a reader cannot tell that one entry is discarded. The spec's "with 12 locations" GIVEN is not what is verified, and the ticked task 3.4 does not match the code.
- Fix: Replace the trailing `"Tokyo"` at line 41 with `"London"`, so the list is the same twelve-city list that `locations_menu_placement_e2e.feature`'s "The menu lies over the date bar" seeds. Keep "Tokyo" as the row whose menu is opened, as that scenario already does and passes.
- Fix risk: Low. The new scroll step positions any row from its measured menu height, and the identical seed with Tokyo as target already passes in `locations_menu_placement_e2e.feature` for the Grid view. Targeting Tokyo instead of London still departs from task 3.4's wording, but the delta spec scenario names no city.
- Status: open

### R3 — WARNING — "The menu lies over the date bar" can pass without any item over the date bar
- Location: `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature:90`
- Rule: `.claude/rules/test-planning.md` (every NFR covered by a test); the `locations` delta scenario "The menu lies over the date bar" ("THEN the menu lies under its button and at least one menu item lies over the date bar")
- Problem: The scenario ends with "every menu item over the date bar has that menu item on top". That step (`grid_view/steps/grid_view_layers_e2e.steps.ts:186-194`) loops only over the items whose centre lies inside the date bar's box. The spec's "at least one menu item lies over the date bar" is missing, though the step exists (`grid_view_layers_e2e.steps.ts:197`) and the Grid layers scenario uses it.
- Impact: If no item centre lands inside the bar, the topmost loop runs zero times and the scenario passes. For example, a layout change could make the date bar shorter or move it, or the scroll step could land off target in the Cards view. A regression where the date bar covers the menu (the NFR-A1 defect this scenario exists to catch) then goes unnoticed in both views.
- Fix: Add `And at least one menu item lies over the date bar` after line 90, as `grid_view_layers_e2e.feature:48` does.
- Fix risk: The step already exists and passes in the Grid layers scenario with the same seed and scroll step. If it fails in the Cards row, that exposes a real gap between the scroll target and the Cards date bar, which is what the scenario is meant to prove.
- Status: open

### R4 — SUGGESTION — No topmost check for a menu opened above its button
- Location: `packages/client/src/test/features/locations/locations_menu_placement_e2e.feature:98`
- Rule: `.claude/rules/traceability.md` (every NFR has a test); NFR-A1 ("At the centre of every menu item that is inside the menu's visible box, the topmost element is that item")
- Problem: NFR-A1 and the `locations` requirement both require that, with the menu opened above its button or with a limited height, the topmost element at every visible item's centre is that item. The only topmost check runs for a menu opened under its button over the date bar. The "opened above" outline runs axe-core only, and axe-core does not detect a menu painted under the previous card or row.
- Impact: Suppose a later change gives a Cards row a stacking context (the sortable `transform`) or changes the sticky header layering of the Grid rows. An opened-above menu could then be partly covered by the row above it, and no test would fail. Today's code layers correctly (`headerBoxLayerWithOpenMenu: "z-location-menu"`), so this is a coverage gap, not a live defect.
- Fix: In `locations/steps/locations_menu_placement_e2e.steps.ts`, add a step "every menu item has that menu item on top" that uses `isTopmostAt` from `grid_view/steps/hourGridE2eHelpers.ts`. Run it at the centre of each `menuitem` inside the menu's box, and add it to the "No accessibility violations with the menu opened above" outline after "the menu lies above its button".
- Fix risk: Adds one new step. The outline must stay in the e2e feature (`bdd-e2e.md`: layering needs a real browser). It costs a few element lookups per row.
- Status: open

## Verdict

Ready. No finding blocks: there is no CRITICAL finding, and the menu placement and the clearing of the meeting range after a shared outcome both work as specified. The fix stage should still fix the three WARNINGs, none of which is a functional defect of the app:

- R1: the README images show the offline-ready toast.
- R2: the layering scenario runs with 11 locations instead of 12.
- R3: the date-bar check can pass without any item over the bar.

R4 is optional.
