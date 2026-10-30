# Review: keep-now-button-visible-when-live

## Summary

| Item | Value |
|---|---|
| Tasks verified | 14/15 |
| Requirements traced | 61/66 |
| CRITICAL | 1 |
| WARNING | 1 |
| SUGGESTION | 2 |

## Tasks

- ✅ 1.1 — `packages/client/src/styles/tokens.test.ts:1` has `// Verifies NFR-A3 of keep-now-button-visible-when-live.`, `:9` adds `"muted"` to `NEW_TOKENS`, `:81-87` adds "should give the muted foreground at least 4.5:1 against the muted fill" with `contrastRatio(readRequired(theme, "muted-foreground"), readRequired(theme, "muted"))` inside the `describe.each(["light", "dark"])` block.
- ✅ 1.2 — `packages/client/src/styles/tokens.css:5` traceability line, `:10` `--color-muted: #e4e4e7;` (light), `:30` `--color-muted: #2a3550;` (dark block); `packages/client/tailwind.config.ts:18` maps `muted: "var(--color-muted)"` next to `muted-foreground`.
- ✅ 2.1 — `packages/client/src/views/shared/DateBar.test.tsx:40-99`: renamed live test asserts `toBeDisabled()`; "should activate Now after the next day and deactivate it after Now" asserts enabled → disabled and focus on `/^Choose date/`; "should keep the moment live when the inactive Now is clicked"; `it.each(["live", "pinned"])` icon + label; "should style the inactive Now with the muted tokens". `CalendarDialog.test.tsx:73,85` expect the Now button `toBeDisabled()`. Both files carry `// Verifies FR1, FR2, FR3, FR4 of keep-now-button-visible-when-live (D1, D2).`
- ✅ 2.2 — `packages/client/src/views/shared/DateBar.tsx:64-72`: the button is always rendered with `disabled={!dateBar.isPinned}` and `disabled:cursor-default disabled:bg-muted disabled:text-muted-foreground`; `handleReturnToNow` unchanged (`:33-36`); JSDoc updated with `Implements FR1, FR2, FR3, FR4, NFR-A1 of keep-now-button-visible-when-live (D1, D2).` (`:13-20`).
- ✅ 3.1 — `dateSelectionQueries.tsx:14-25` defines `nowButtonOfBar`, `isNowActive`, `isNowInactive`; `dateSelectionWorld.tsx` uses them in `expectLive` / `expectPinnedTo` and shrank from 217 to 210 lines; `referenceMomentStepHelpers.ts` has `thenNowActive` / `thenNowInactive`; `timeSelectionWorld.tsx` renames to `isNowActive` (`dateBar.isPinned`). `grep -rn isNowShown packages/client/src` prints nothing.
- ✅ 3.2 — step texts "the Now button is active / inactive" with `@keep-now-button-visible-when-live` tags in `date_selection_reference_moment.feature:5,13,66,79-88` (new "An inactive Now changes nothing", `@FR2 @M5`), `date_selection_calendar.feature:28`, `time_selection_moment.feature:6`, `time_selection_wall_time_input_unit.feature:89`, `locations_here_entry_changes_unit.feature:21`, `date_selection_date_bar.feature:36-39` ("… and an inactive Now", step asserts `toBeDisabled()` at `date_selection_date_bar.steps.tsx:183-185`). The new step handler lives in `referenceMomentStepHelpers.ts:23-24`, but the steps file still grew past 200 lines (see R4).
- ✅ 4.1 — `dateSelectionE2eHelpers.ts:47` `showNextDay` waits for `toBeEnabled()`; `computedColourOfVariable` moved to `dateSelectionE2eHelpers.ts:50-62` and imported back in `date_selection_theme_e2e.steps.ts:8`; `date_selection_e2e.steps.ts` and `date_selection_view_contract_e2e.steps.ts` assert `toBeDisabled()`; `time_selection_pointer_e2e.steps.ts` steps "the Now button is active / inactive" with `// Verifies FR2, FR3 of keep-now-button-visible-when-live.`; `time_selection_touch_e2e.feature:6,19` and `time_selection_wall_time_input_e2e.feature:37` tagged.
- ✅ 4.2 — `date_selection/date_selection_now_e2e.feature` holds all five scenarios ("Tab skips an inactive Now", "Now is named in English/Russian …", "An inactive Now changes nothing", "An inactive Now is grey …", "Now keeps its place …") with their tags; steps in `steps/date_selection_now_e2e.steps.ts` (97 lines), each with a `// Verifies … of keep-now-button-visible-when-live.` comment.
- ✅ 4.3 — `date_selection_e2e.feature:6` (`@NFR-A2` on "Tab order of the bar"), `:92` (`@NFR-A1 @M4` on the axe-core outline with live/pinned × light/dark rows); `date_selection_layout_e2e.feature:96` (`@NFR-R1` on "No horizontal scrolling at <width> px …").
- ❌ 4.4 — the tag `@keep-now-button-visible-when-live @NFR-R2` is at `locations_ui_e2e.feature:132`, but no baseline under `packages/client/src/test/features/__screenshots__/` was re-approved: the branch diff touches no `.png`, and `__screenshots__/chromium/Screenshot-of-the-home-state-at-375-px-in-the-dark-theme.png` (a live state) still shows the bar without any Now button. Ticked but not done (R1).
- ✅ 4.5 — Stryker scoped to `src/views/shared/DateBar.tsx` measured 91.67% in this review: above the minimum acceptable 90%, below the 95% target because the added `Stryker disable` comment is misplaced (R3).
- ✅ 5.1 — the M7 loop, run from `packages/client/`, prints nothing (re-run in this review).
- ✅ 5.2 — `openspec/changes/keep-now-button-visible-when-live/handoff/H1-docs-now-button-always-shown.patch` and `handoff/README.md` exist; `git apply --check` on the patch succeeds (re-run in this review).
- ✅ 5.3 — CI is green per the stage input; no test still expects Now to be missing (`grep -rniE "now (control|button is (not )?shown)|today button" packages/client/src` prints nothing).
- ✅ 5.4 — both greps (`now (control|button is (not )?shown)|today button` and `isPinned &&` in `src/views`) print nothing (re-run in this review).

## Requirements

- ✅ FR1 — `DateBar.tsx:64-72` always renders Now; tests `DateBar.test.tsx:40-51`, unit BDD "Bar in each state" (`date_selection_date_bar.feature:36-39`, six page states, asserts the disabled Now) and "The app opens live" (`date_selection_reference_moment.feature:5-13`).
- ✅ FR2 — native `disabled={!dateBar.isPinned}` (`DateBar.tsx:66`); tests `DateBar.test.tsx` "should keep the moment live when the inactive Now is clicked", unit BDD "An inactive Now changes nothing" (`date_selection_reference_moment.feature:79-88`), E2E forced click (`date_selection_now_e2e.feature:32-38`), `time_selection_touch_e2e.feature:6-15`.
- ✅ FR3 — `handleReturnToNow` unchanged (`DateBar.tsx:33-36`); `DateBar.test.tsx` "should activate Now after the next day and deactivate it after Now" (incl. focus on the date button); "the Now button is active" scenarios in `date_selection_reference_moment.feature:66`, `date_selection_calendar.feature:28`, `time_selection_moment.feature:6`, `time_selection_wall_time_input_unit.feature:89`, `locations_here_entry_changes_unit.feature:21`.
- ✅ FR4 — `disabled:bg-muted disabled:text-muted-foreground` (`DateBar.tsx:67`), tokens `tokens.css:10,30`, `tailwind.config.ts:18`; E2E "An inactive Now is grey in the <theme> theme" compares computed colours with `--color-muted` / `--color-muted-foreground` and, after the next day, with the accent tokens (`date_selection_now_e2e.feature:40-52`).
- ✅ NFR-A1 — `date_selection_now_e2e.feature:12-30` (English live/pinned, Russian live, `toBeDisabled()` / `toBeEnabled()`), axe-core outline `date_selection_e2e.feature:92-106`.
- ✅ NFR-A2 — `date_selection_now_e2e.feature:6-10` "Tab skips an inactive Now"; `date_selection_e2e.feature:5-12` "Tab order of the bar" while pinned; focus after Now in `DateBar.test.tsx`.
- ✅ NFR-A3 — `tokens.test.ts:81-87` asserts ≥ 4.5:1 for the muted foreground on `--color-muted` in both themes.
- ✅ NFR-R1 — `date_selection_now_e2e.feature:54-66` (375/1024 × light/dark, ≤ 1 px, ≥ 44 px) and `date_selection_layout_e2e.feature:96` (320/2560, live and pinned). The tested date (8 → 9 March) does not hit the wrap of R2.
- ❌ NFR-R2 — tagged (`locations_ui_e2e.feature:132`) but the live-state baselines were not re-approved; they still show no Now (R1).
- ✅ UX1 — `date_selection_now_e2e.feature:40-52` asserts the muted fill and foreground, not the accent, in both themes.
- ⚠️ UX2 — `date_selection_now_e2e.feature:54-66` checks Now's box for 8 → 9 March, but the new fixed date-button width wraps long dates from 768 px, which changes the bar's height and moves Now (R2).
- ✅ M1 — measured by the "An inactive Now is grey" outline (computed `background-color` / `color` vs. tokens, live and after the next day, light and dark).
- ✅ M2 — `tokens.test.ts:81-87` (both themes); planned 5.30:1 / 5.08:1 values are the ones in `tokens.css`.
- ✅ M3 — "Now keeps its place" outline, 4 rows (375/1024 × light/dark), x/y/width/height within 1 px.
- ✅ M4 — `date_selection_e2e.feature:92-106` rows live/pinned × light/dark tagged `@M4`.
- ✅ M5 — jsdom click (`date_selection_reference_moment.feature:79-88`, `DateBar.test.tsx`) and forced click in a real browser (`date_selection_now_e2e.feature:32-38`).
- ⚠️ M6 — measured 91.67% on `DateBar.tsx` (1 survivor), above the 90% minimum but below the 95% target named by M6 (R3).
- ✅ M7 — the task 5.1 loop prints nothing.
- ✅ Scenario: The app opens live — `date_selection_reference_moment.feature:6-13` ("the Now button is inactive" = present and disabled).
- ✅ Scenario: Date changes store nothing — unchanged, `date_selection_reference_moment.feature:16`.
- ✅ Scenario: The pinned moment survives a list change in another tab — unchanged, `date_selection_reference_moment.feature:23` (`expectPinnedTo` now checks an active Now).
- ✅ Scenario: A home change keeps the pinned moment — unchanged, `date_selection_reference_moment.feature:91`.
- ✅ Scenario: Now after browsing dates — `date_selection_reference_moment.feature:67-78` (active, then inactive after Now).
- ✅ Scenario: An inactive Now changes nothing — unit `date_selection_reference_moment.feature:79-88` (moment live, `shownIsoDate` checked by `expectLive`, row `12:30`/`Sun, Mar 8`), E2E `date_selection_now_e2e.feature:33-38`.
- ✅ Scenario: Date text by screen width and language — unchanged, `date_selection_date_bar.feature:6`.
- ✅ Scenario: Another year — unchanged, `date_selection_date_bar.feature:22` (375 px; the 1024 px wrap is R2).
- ✅ Scenario: Live date changes at midnight — unchanged, `date_selection_date_bar.feature:30`.
- ✅ Scenario: Bar in each state — `date_selection_date_bar.feature:37-48` with the inactive-Now assertion at `date_selection_date_bar.steps.tsx:183-185`.
- ✅ Scenario: Notice above the bar — unchanged, `main_page/main_page_e2e.feature:63`.
- ✅ Scenario: Next day and Now with the keyboard — unchanged, `date_selection_e2e.feature:28`.
- ✅ Scenario: Tab order of the bar — `date_selection_e2e.feature:7-12`, tagged `@NFR-A2`.
- ✅ Scenario: Tab skips an inactive Now — `date_selection_now_e2e.feature:7-10`; the step asserts neither the next-day button nor Now is focused.
- ✅ Scenario: Space activates the bar and the calendar — unchanged, `date_selection_e2e.feature:16`.
- ✅ Scenario: Pick a date with the keyboard — unchanged, `date_selection_e2e.feature:38`.
- ✅ Scenario: Focus crosses into the next month — unchanged, `date_selection_e2e.feature:49`.
- ✅ Scenario: Page keys and week ends — unchanged, `date_selection_e2e.feature:58`.
- ✅ Scenario: Esc closes without change — unchanged, `date_selection_e2e.feature:66`.
- ✅ Scenario: Names and marks — unchanged, `date_selection_e2e.feature:76`.
- ✅ Scenario: Now is named in both modes — `date_selection_now_e2e.feature:13-30` (English outline live/pinned + Russian live).
- ✅ Scenario: Date change is announced — unchanged, `date_selection_e2e.feature:85`.
- ✅ Scenario: No accessibility violations — `date_selection_e2e.feature:93-106`, six rows incl. live and pinned in both themes.
- ✅ Scenario: Bar on a narrow screen — unchanged, `date_selection_layout_e2e.feature:6`.
- ✅ Scenario: Bar on a wide screen — unchanged, `date_selection_layout_e2e.feature:15`.
- ✅ Scenario: Last card above the bar — unchanged, `date_selection_layout_e2e.feature:23`.
- ✅ Scenario: Calendar on a narrow and a wide screen — unchanged, `date_selection_layout_e2e.feature:32`.
- ✅ Scenario: Bar controls look as approved — unchanged, `date_selection_layout_e2e.feature:47` (pinned, accent colours).
- ✅ Scenario: An inactive Now is grey — `date_selection_now_e2e.feature:41-52`.
- ⚠️ Scenario: Now keeps its place — `date_selection_now_e2e.feature:55-66` passes for 8 → 9 March, but a long date (e.g. Russian «понедельник, 28 сентября») wraps in the fixed-width date button from 768 px and shifts Now (R2).
- ✅ Scenario: The date is the most prominent text of the bar — unchanged, `date_selection_layout_e2e.feature:61`.
- ✅ Scenario: Touch targets — `date_selection_layout_e2e.feature:78` ("each bar control is at least 44 by 44 px", now incl. the always-present Now).
- ✅ Scenario: Calendar days fit the narrowest screen — unchanged, `date_selection_layout_e2e.feature:88`.
- ✅ Scenario: No horizontal scrolling — `date_selection_layout_e2e.feature:98`, tagged `@NFR-R1`.
- ✅ Scenario: Time selection from the Here entry — `locations_here_entry_changes_unit.feature:21-30`, step asserts `toBeEnabled()`.
- ✅ Scenario: Now after selecting a time — `time_selection_moment.feature:6-13` ("the Now button is active").
- ✅ Scenario: A date change keeps the selected time — unchanged, `time_selection_moment.feature:20`.
- ✅ Scenario: Track under the text on a narrow screen — unchanged, `time_selection_layout_e2e.feature:7`.
- ✅ Scenario: Track beside the time on a wide screen — unchanged, `time_selection_layout_e2e.feature:15`.
- ✅ Scenario: Handle centre matches the instant — unchanged, `time_selection_layout_e2e.feature:33`.
- ✅ Scenario: Drag without scrolling or reordering — unchanged, `time_selection_e2e.feature:18`.
- ✅ Scenario: The handle stays clear of the time and the menu — unchanged, `time_selection_layout_e2e.feature:93`.
- ✅ Scenario: A vertical swipe on a track scrolls without selecting a time — `time_selection_touch_e2e.feature:6-15` ("the Now button is inactive", `@FR2`).
- ✅ Scenario: A finger tap on a track selects a time — `time_selection_touch_e2e.feature:19-27` ("the Now button is active", `@FR3`).
- ✅ Scenario: Touch targets — unchanged, `time_selection_layout_e2e.feature:46`.
- ✅ Scenario: Tracks fit narrow and wide screens — unchanged, `time_selection_layout_e2e.feature:58`.
- ❌ Scenario: Screenshots show the tracks — `locations_ui_e2e.feature:133` passes only because the 2.5% tolerance (`playwright.bdd.config.ts:32`) absorbs the missing Now; the live "list" baselines were not re-approved (R1).
- ✅ Scenario: The typed instant leaves the reference day — `time_selection_wall_time_input_unit.feature:89-99` ("the Now button is active").

## Mutation

Measured in this review, one run at a time, from `packages/client/`:

- `src/views/shared/DateBar.tsx` — **91.67%** (11 killed, 1 survived, 0 no coverage). Survivor: `StringLiteral` at line 11 (`arrowButtonClassName` → `""`). The `// Stryker disable next-line StringLiteral` comment added at line 9 targets line 10 (`const arrowButtonClassName =`), not the literal on line 11, so it has no effect (R3).
- `src/views/shared/CalendarDialog.tsx` — **98.00%** (49 killed, 1 survived, 1 runtime error). The survivor (`StringLiteral`, line 29) and the runtime error (line 21) are in lines this branch did not change.

`styles/tokens.css` and `tailwind.config.ts` hold no mutable TypeScript and were not measured.

## Findings

### R1 — CRITICAL — Live-state screenshot baselines were not re-approved (task 4.4 ticked)
- Location: `packages/client/src/test/features/locations/locations_ui_e2e.feature:132`
- Rule: `.claude/rules/process-invariants.md` / `tasks.md` 4.4, NFR-R2 of the proposal
- Problem: Task 4.4 is ticked and the outline is tagged `@keep-now-button-visible-when-live @NFR-R2`, but the branch changes no file under `packages/client/src/test/features/__screenshots__/`. The live-state baseline `__screenshots__/chromium/Screenshot-of-the-home-state-at-375-px-in-the-dark-theme.png` still shows the date bar with only the arrows and "Sun, March 8" and no Now button. The outline still passes because `toHaveScreenshot` allows `maxDiffPixelRatio: 0.025` (`playwright.bdd.config.ts:32`), and the grey Now plus the moved date button stay under 2.5% of the page.
- Impact: NFR-R2 ("the approved screenshots of states with a live moment are re-approved with the grey Now") and the spec sentence "the screenshots of states with a live moment MUST show the inactive Now" are not met; the approved images document the old behaviour. Any later regression of the inactive Now (wrong colour, missing again) stays within the same tolerance against a baseline that never contained it, so visual regression no longer guards this button.
- Fix: After R2 is fixed (it changes the 1024 px bar), run from `packages/client/` in Linux, alone: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the" --update-snapshots`, commit the changed `.png` files, inspect one live baseline per width/theme to confirm the grey Now is visible, then re-run the outline without `--update-snapshots`.
- Fix risk: The 4.4 check "pinned-state / time-selected-state baselines stay unchanged" will not hold at 1024 px: the date button width change in `CalendarDialog.tsx:85` (R2) moves the centred group in every state, so those 1024 px baselines change too and must be re-approved together, with that reason stated in the commit. Baselines rendered outside Linux would mismatch CI fonts.
- Status: fixed
- Resolution: re-generated all 84 screenshot baselines on Linux (chromium and mobile-chrome) incl. the live states, which now show the grey Now (checked the 375 px dark home baseline); the 1024 px baselines also moved with the wider date button of R2; the outline passes against them (104 passed).

### R2 — WARNING — Fixed `md:w-56` date button wraps long dates and moves Now
- Location: `packages/client/src/views/shared/CalendarDialog.tsx:85`
- Rule: `.claude/rules/process-invariants.md` (artifact layering: no upward reference) / spec "Date bar layout" (Now keeps its place, UX2)
- Problem: The branch adds `md:w-56 md:justify-center` to the date button. This change is not in `design.md` or `tasks.md`, and it carries no traceability link. `w-56` is 224 px, and `px-2` leaves 208 px for the label. The button is a flex container, so `<time>` wraps once the long label is wider than that. Measured in Chromium with the app's Manrope font at 16 px / weight 600: «понедельник, 28 сентября» 212 px, «понедельник, 30 сентября» 212 px, «понедельник, 8 марта 2027 г.» 230 px, "Wednesday, September 30, 2026" 253 px, «понедельник, 30 сентября 2027 г.» 267 px. Before this change the button had auto width and these labels never wrapped.
- Impact: From 768 px, on Russian Mondays in September and on every long label with a year (any date in another year, spec "Another year"), the date shows on two lines. The date button grows above 44 px, the bar gets taller, and with `items-center` Now moves vertically when the user switches between such a date and a shorter one. This breaks "Now MUST keep the same place … within 1 px" and UX2 ("does not move or resize any control of the bar"). Russian is the app's default language. The E2E "Now keeps its place" only tests 8 → 9 March, so it does not catch this.
- Fix: In `CalendarDialog.tsx:85`, replace `md:w-56` with `md:w-72 whitespace-nowrap` (288 px, 272 px for the label, above the longest measured label of 267 px). Add a scenario to `date_selection/date_selection_now_e2e.feature` tagged `@keep-now-button-visible-when-live @NFR-R1 @UX2`: Russian, 1024 px, current time `"2026-09-27T07:30:00Z"` (Sunday; the next day is «понедельник, 28 сентября»). It reuses "the locations interface language is Russian", "the screen is 1024 px wide for the locations", "the user opens the locations app" and "Now keeps its place and size when the user moves to the next day". Add one new step in `steps/date_selection_now_e2e.steps.ts` asserting that `dateButton(page)`'s box height is at most `MIN_TOUCH_TARGET_PX` + 1 after the move. Add `Implements NFR-R1, UX2 of keep-now-button-visible-when-live.` to the `CalendarDialog` JSDoc.
- Fix risk: The centred group gets 64 px wider at ≥ 768 px, so the 1024 px screenshots change (they need re-approval anyway, R1). At 768 px the group (≈ 44 + 288 + 44 + gap + Now ≈ 500 px) still fits, and "No horizontal scrolling" stays green. `whitespace-nowrap` would overflow instead of wrap if a future locale's label exceeded 272 px. Below 768 px nothing changes (`md:` only).
- Status: fixed
- Resolution: CalendarDialog.tsx date button is now md:w-72 whitespace-nowrap, plus an Implements NFR-R1, UX2 line in its JSDoc; new E2E outline "A long date stays on one line at <width> px" (Russian, 27 to 28 September, 768 and 1024 px) failed with md:w-56 and passes now.

### R3 — SUGGESTION — Misplaced `Stryker disable` comment leaves DateBar.tsx below the 95% M6 target
- Location: `packages/client/src/views/shared/DateBar.tsx:9`
- Rule: `CLAUDE.md` "Mutation testing … target >=95%" / M6 of the proposal
- Problem: The added `// Stryker disable next-line StringLiteral: …` stands above line 10 (`const arrowButtonClassName =`), but the string literal is on line 11. Stryker therefore still mutates the literal, and the mutant survives. The comment also names a scenario "Each bar control is at least 44 by 44 px" that does not exist: that text is the step of scenario "Touch targets" in `date_selection_layout_e2e.feature:78`.
- Impact: Measured score is 91.67% instead of the ≥ 95% target M6 names. The comment misleads readers into thinking the literal is excluded.
- Fix: Move the comment to sit directly above line 11 (the string literal line), and name the covering scenario correctly: `// Stryker disable next-line StringLiteral: the arrow classes are checked by the "Touch targets" scenario of date_selection_layout_e2e.feature`. Re-run `npx stryker run --mutate 'src/views/shared/DateBar.tsx'` and confirm 100%.
- Fix risk: none — Prettier keeps a line comment above a string continuation line, and the "Touch targets" E2E scenario already checks the arrow buttons' 44 × 44 px size.
- Status: fixed
- Resolution: moved the Stryker disable comment onto the string literal line and named the Touch targets scenario correctly; scoped Stryker on DateBar.tsx now gives 100% (11 killed, 1 ignored).

### R4 — SUGGESTION — Reference-moment steps file grew past 200 lines
- Location: `packages/client/src/test/features/date_selection/steps/date_selection_reference_moment.steps.tsx:164`
- Rule: `CLAUDE.md` "Files must stay under 200 lines" / `.claude/rules/process-invariants.md` (target 100–200, hard cap 300)
- Problem: The file grew from 186 to 211 lines with the new "An inactive Now changes nothing" scenario wiring (`:164-183`). Task 3.2 said to avoid passing 200 lines. Moving the handler into `referenceMomentStepHelpers.ts` was not enough.
- Impact: The project's 200-line limit is broken in a file this change touched (AI context quality, per `CLAUDE.md`). The 300-line hard cap still holds.
- Fix: Move the scenario "An inactive Now changes nothing" into a new unit feature `date_selection/date_selection_now_unit.feature`. It takes the `_unit` suffix because `date_selection_now_e2e.feature` already exists (`.claude/rules/bdd-unit.md`, File Naming). Put its steps in `date_selection/steps/date_selection_now_unit.steps.tsx`, which reuses `createDateSelectionWorld` and `createReferenceMomentSteps`. Keep the tags `@keep-now-button-visible-when-live @FR2 @M5` and the `// @keep-now-button-visible-when-live @FR2 @M5` comment.
- Fix risk: The proposal's Behavior section names `date_selection_reference_moment.feature` for this scenario, so the location drifts from the proposal (the scenario name, tags and spec mapping stay the same). The new steps file needs its own `BeforeEachScenario` cleanup, like the reference-moment steps file.
- Status: fixed
- Resolution: moved the scenario into date_selection_now_unit.feature with steps in date_selection_now_unit.steps.tsx; date_selection_reference_moment.steps.tsx is 189 lines; both files pass.

## Verdict

Not ready. Blocking: R1, because task 4.4 is ticked but no live-state screenshot was re-approved, so NFR-R2 is not met. R2 should be fixed in the same round, because it changes the 1024 px baselines that R1 re-approves. R3 and R4 are non-blocking.
