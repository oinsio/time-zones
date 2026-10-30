# Tasks

All source paths are under `packages/client/src/`. Commands run from `packages/client/` unless they start with `pnpm --filter`, `git` or say "from the repository root". "design Dn" refers to `design.md`.

- **Running tests:** one command at a time, never in the background. Stryker runs only with `--mutate`, at most 5 files per run, and its report is `reports/mutation/mutation-report.json`.
- **Time in tests:** only `fakeClock(instant, timeZone)` of `@/lib/temporal`. Never `vi.setSystemTime()` or `vi.useFakeTimers()`.
- **E2E runs:** every Playwright command after a `.feature` edit starts with `npx bddgen -c playwright.bdd.config.ts && ` (the order of the `test:bdd` script).
- **Traceability:** every new or changed test, step file and feature carries `keep-now-button-visible-when-live`:
  - `@keep-now-button-visible-when-live @FR-X` tags above scenarios, and `// @keep-now-button-visible-when-live @FR-X` before `f.Scenario`;
  - `// Verifies NFR-X of keep-now-button-visible-when-live` in E2E steps;
  - `Implements FR-X of keep-now-button-visible-when-live` in the JSDoc of changed production code.
- **Glossary:** use the terms of `docs/glossary/date-selection.md` and `docs/glossary/time.md`: Now button, date bar, live, pinned, reference moment. Never "Now control", "Today button" or "reset" for the Now button. Never "frozen", "paused" or "locked" for pinned.
- **File size:** every file stays under 200 lines. `dateSelectionWorld.tsx` already has 217 lines, so it must not grow.

## 1. Design token (no TDD: tokens and config)

- [x] 1.1 RED: in `styles/tokens.test.ts`, add `"muted"` to `NEW_TOKENS`. In the `describe.each` block, add `it("should give the muted foreground at least 4.5:1 against the muted fill")` using `contrastRatio(readRequired(theme, "muted-foreground"), readRequired(theme, "muted"))` and `MIN_TEXT_CONTRAST`. Start the file comment with `// Verifies NFR-A3 of keep-now-button-visible-when-live.` above the existing line (design D3, M2). Run `npx vitest run src/styles/tokens.test.ts` and see it fail.
- [x] 1.2 GREEN: add `--color-muted: #e4e4e7;` to the light block and `--color-muted: #2a3550;` to the dark block of `styles/tokens.css`. Add `Implements FR4, NFR-A3 of keep-now-button-visible-when-live (D3).` to its header comment. Map `muted: "var(--color-muted)"` in `packages/client/tailwind.config.ts` (outside `src/`) next to `"muted-foreground"`. Verify, one at a time: `npx vitest run src/styles/tokens.test.ts`, then `pnpm --filter @time-zones/client typecheck`.

## 2. View: Now is always rendered (TDD)

- [x] 2.1 RED: in `views/shared/DateBar.test.tsx` (design D1, D2; FR1–FR4):
  - rename "should show the date without Now while live" to "should show the date with an inactive Now while live". It expects `screen.getByRole("button", { name: "Now" })` to be disabled;
  - rename "should show Now after the next day and hide it after Now" to "should activate Now after the next day and deactivate it after Now". It expects the button enabled after "Next day", disabled after "Now", and `document.activeElement` to be the date button (`/^Choose date/`);
  - add "should keep the moment live when the inactive Now is clicked": click the disabled Now, then `shownIsoDate` is still `2026-03-08` and the button is still disabled;
  - add `it.each` over `["live", "pinned"]` "should give Now the clock icon and the label in the %s mode": one `svg` in the button and text `Now`;
  - add "should style the inactive Now with the muted tokens": the button's `className` contains `disabled:bg-muted` and `disabled:text-muted-foreground`, and still `bg-accent` and `text-accent-foreground`.

  - in `views/shared/CalendarDialog.test.tsx`, "should keep a live moment live when the shown date is picked" and "should change nothing when the calendar is closed without a pick" expect `screen.getByRole("button", { name: "Now" })` to be disabled instead of `not.toBeInTheDocument()`.

  Put `// Verifies FR1, FR2, FR3, FR4 of keep-now-button-visible-when-live (D1, D2).` under the existing first line of both files. Run `npx vitest run src/views/shared/DateBar.test.tsx src/views/shared/CalendarDialog.test.tsx` and see the new expectations fail.
- [x] 2.2 GREEN: in `views/shared/DateBar.tsx`, drop the `dateBar.isPinned &&` condition. Render the button always with `disabled={!dateBar.isPinned}`, and add `disabled:cursor-default disabled:bg-muted disabled:text-muted-foreground` to its class list. Keep `handleReturnToNow` as it is. In the JSDoc, change "and, while pinned, Now" to "and Now (active while pinned, inactive while live)", and add `Implements FR1, FR2, FR3, FR4, NFR-A1 of keep-now-button-visible-when-live (D1, D2).` Verify `npx vitest run src/views/shared/DateBar.test.tsx src/views/shared/CalendarDialog.test.tsx`.

## 3. Unit BDD: shown/not shown becomes active/inactive (design D4)

- [x] 3.1 Helpers: in `test/features/date_selection/steps/dateSelectionQueries.tsx`, replace `isNowShown` with `nowButtonOfBar()` (the `date.now` button of the bar, or `null`), `isNowActive()` (present and not `disabled`) and `isNowInactive()` (present and `disabled`). In `dateSelectionWorld.tsx`, replace `isNowShown` with `isNowActive` in the import and in the returned world. `expectLive` asserts `expect(isNowInactive()).toBe(true)`, and the multi-line `within(barElement()).getByRole(…)` lookup in `expectPinnedTo` becomes `expect(isNowActive()).toBe(true)`, so the file does not grow past its current 217 lines. In `referenceMomentStepHelpers.ts`, rename `thenNowShown` / `thenNowNotShown` to `thenNowActive` / `thenNowInactive`; `thenNowInactive` calls `isNowInactive` from `dateSelectionQueries.tsx` directly. In `time_selection/steps/timeSelectionWorld.tsx`, rename `isNowShown` to `isNowActive`, still `current().reference.dateBar.isPinned`. Update the callers: `date_selection/steps/date_selection_calendar.steps.tsx`, `selectTimeSteps.ts`, `time_selection_moment.steps.tsx`, `wallTimeStepHandlers.ts`, `time_selection_legacy_tap.steps.tsx`. Verify `pnpm --filter @time-zones/client typecheck`, then `grep -rn "isNowShown" src` prints nothing.
- [x] 3.2 Features and steps (FR1, FR2, FR3). In each, "the Now button is shown" becomes "the Now button is active" and "the Now button is not shown" becomes "the Now button is inactive". Add the tags `@keep-now-button-visible-when-live @FR<n>` to each touched scenario:
  - `date_selection/date_selection_reference_moment.feature` + `steps/date_selection_reference_moment.steps.tsx`: "The app opens live" (`@FR1`) and "Now after browsing dates" (`@FR3`). Add the scenario "An inactive Now changes nothing" from the spec delta (`@FR2 @M5`). Its step "the user activates the inactive Now button" clicks the disabled button with `userEvent.click`, then "the moment is still live" and the existing row and date steps apply. If the steps file passes 200 lines, put the new step handlers into `referenceMomentStepHelpers.ts`;
  - `date_selection/date_selection_calendar.feature` + `steps/date_selection_calendar.steps.tsx` (`@FR3`);
  - `time_selection/time_selection_moment.feature` + `steps/time_selection_moment.steps.tsx` (`@FR3`);
  - `time_selection/time_selection_wall_time_input_unit.feature` + `steps/time_selection_wall_time_input_unit.steps.tsx` (`@FR3`);
  - `locations/locations_here_entry_changes_unit.feature` + `steps/locations_here_entry_changes_unit.steps.tsx` (`@FR3`). The step asserts `expect(world.nowButton()).toBeEnabled()`;
  - `date_selection/date_selection_date_bar.feature` + `steps/date_selection_date_bar.steps.tsx`: "Bar in each state" (spec delta requirement "Date bar on every page state") becomes "Then the date bar is shown with the previous-day, date and next-day buttons and an inactive Now" (`@keep-now-button-visible-when-live @FR1`). The step also expects the `date.now` button in the bar to be disabled.

  Verify, one at a time: `npx vitest run src/test/features/date_selection`, `npx vitest run src/test/features/time_selection`, `npx vitest run src/test/features/locations/steps/locations_here_entry_changes_unit.steps.tsx`.

## 4. Real browser (playwright-bdd)

- [ ] 4.1 Existing E2E steps (design D4; FR2, FR3): in `dateSelectionE2eHelpers.ts`, `showNextDay` waits for `toBeEnabled()`. Move `computedColourOfVariable` from `date_selection_theme_e2e.steps.ts` into `dateSelectionE2eHelpers.ts`, export it, and import it back (design D5). In `date_selection_e2e.steps.ts`, "the bar is live" expects `nowButton(page)` `toBeDisabled()`. In `date_selection_view_contract_e2e.steps.ts`, "the user returns to now with the bar" expects `toBeDisabled()` after the click. In `time_selection/steps/time_selection_pointer_e2e.steps.ts`, rename the steps to "the Now button is active" (`toBeEnabled()`) and "the Now button is inactive" (`toBeDisabled()`), with `// Verifies FR2, FR3 of keep-now-button-visible-when-live.` Rename the step texts in `time_selection/time_selection_touch_e2e.feature` and `time_selection/time_selection_wall_time_input_e2e.feature`, and add `@keep-now-button-visible-when-live @FR2` or `@FR3` above each touched scenario. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@keep-now-button-visible-when-live|@view-contract|@select-date-with-calendar-and-now"`.
- [ ] 4.2 New feature `date_selection/date_selection_now_e2e.feature` with `steps/date_selection_now_e2e.steps.ts` (design D5). It implements the spec-delta scenarios below, every one at `2026-03-08T07:30:00Z` after "the user opens the locations app":
  - "Tab skips an inactive Now" (`@NFR-A2`): focus the next-day button, press Tab; the next-day button and Now are not focused;
  - "Now is named in both modes" (`@NFR-A1`), an outline with English live / English pinned / Russian live. Russian uses the existing step "the locations interface language is Russian". The step finds the button in the bar by role and name `Now` / `Сейчас` and asserts `toBeDisabled()` or `toBeEnabled()`;
  - "An inactive Now changes nothing" (`@FR2 @M5`): `nowButton(page).click({ force: true })`, then the bar shows the date `2026-03-08` and Now is still disabled;
  - "An inactive Now is grey" (`@FR4 @UX1 @M1`), light and dark: one `svg`, text `Now`, `background-color` equals `computedColourOfVariable(page, "--color-muted")` and `color` equals `--color-muted-foreground`. After `showNextDay` they equal `--color-accent` and `--color-accent-foreground`;
  - "Now keeps its place" (`@NFR-R1 @UX2 @M3`), 375/1024 × light/dark: `requireBox(nowButton(page))` while live and after `showNextDay` differ by at most 1 px in x, y, width and height, and both are at least `MIN_TOUCH_TARGET_PX` wide and high.

  Every step carries `// Verifies <ids> of keep-now-button-visible-when-live.` with the ids of its scenario. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "@keep-now-button-visible-when-live"`.
- [ ] 4.3 Existing a11y and layout scenarios (NFR-A1, NFR-A2, NFR-R1, M4): add `@keep-now-button-visible-when-live @NFR-A1 @M4` above "No accessibility violations in the <bar state> state in the <theme> theme" and `@keep-now-button-visible-when-live @NFR-A2` above "Tab order of the bar" in `date_selection/date_selection_e2e.feature`. Add `@keep-now-button-visible-when-live @NFR-R1` above "No horizontal scrolling at <width> px in the <bar state> state" in `date_selection/date_selection_layout_e2e.feature`. Verify `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "No accessibility violations in the|Tab order of the bar|No horizontal scrolling at"`.
- [ ] 4.4 Screenshots (NFR-R2): add `@keep-now-button-visible-when-live @NFR-R2` above the outline "Screenshot of the <state> state at <width> px in the <theme> theme" in `locations/locations_ui_e2e.feature`. Re-approve the baselines once, in Linux: `npx bddgen -c playwright.bdd.config.ts && npx playwright test -c playwright.bdd.config.ts --grep "Screenshot of the" --update-snapshots`. Then `git status --short src/test/features/__screenshots__ | grep -E "pinned-state|time-selected-state"` must print nothing, because those states are pinned and their bar does not change. Run the outline once more without `--update-snapshots` and see it pass.
- [ ] 4.5 Mutation (M6): `npx stryker run --mutate 'src/views/shared/DateBar.tsx'`. Read `reports/mutation/mutation-report.json`: the file scores at least 95% (minimum acceptable 90%). Kill survivors with tests in `DateBar.test.tsx`. Class strings that only E2E can check get a `// Stryker disable next-line StringLiteral` comment that names the covering scenario ("An inactive Now is grey").

## 5. Handoff patch and final verification

- [ ] 5.1 Traceability (M7): this loop, run from `packages/client/`, must print nothing.

  ```
  for id in FR1 FR2 FR3 FR4 NFR-A1 NFR-A2 NFR-A3 NFR-R1 NFR-R2 UX1 UX2; do
    grep -rqE "keep-now-button-visible-when-live.*(^|[^A-Za-z0-9-])@?$id([^0-9]|$)|(^|[^A-Za-z0-9-])@?$id([^0-9]|$).*keep-now-button-visible-when-live" src || echo "missing $id"
  done
  ```
- [ ] 5.2 Handoff H1: write `openspec/changes/keep-now-button-visible-when-live/handoff/H1-docs-now-button-always-shown.patch` and its section in `handoff/README.md`, following `.gnomish/stages/specify/handoff.md`. The patch edits:
  - `docs/glossary/date-selection.md`, the **Now button** entry: replace "It is shown only while the moment is pinned." with "It is always shown in the date bar: active while the moment is pinned, inactive while live (grey, skipped by Tab, activating it does nothing)." Replace its *Code:* with "`DateBar` (the button), `RESET_TO_NOW` (the command)";
  - `docs/architecture/views.md`: in the "Now button" building block, "visible only when the moment is pinned" becomes "always shown; active when the moment is pinned, inactive and grey while live". In "Time display", "the Now button signals a pinned moment" becomes "an active Now button signals a pinned moment". Under "Visual style", add after the accent line: "- Inactive control (the Now button while live): fill `#E4E4E7` (light), `#2A3550` (dark), label in the muted foreground colour.";
  - `docs/architecture/open-questions.md` Q6: "the Now button appears only when the moment is pinned" becomes "the Now button is always shown and is active only when the moment is pinned".

  Verify from the repository root, one command at a time: `git apply --check openspec/changes/keep-now-button-visible-when-live/handoff/H1-docs-now-button-always-shown.patch`, then `git status --short docs` prints nothing.
- [ ] 5.3 Run each command alone, in this order: `pnpm --filter @time-zones/client typecheck`, `pnpm --filter @time-zones/client lint`, `pnpm --filter @time-zones/client test`, `pnpm run build`. Then run `pnpm --filter @time-zones/client test:bdd` once, alone, and fix every remaining scenario that still expects Now to be missing.
- [ ] 5.4 Glossary check (`.claude/rules/glossary.md`, "Review checklist"): `grep -rniE "now (control|button is (not )?shown)|today button" src` prints nothing. `grep -rn "isPinned &&" src/views` prints nothing.

## Human follow-up

The operator reviews this item on the pull request the deliver stage opens, then applies the patch.

- H1 (FR1, FR2, FR4): apply `handoff/H1-docs-now-button-always-shown.patch`. It changes the **Now button** entry of `docs/glossary/date-selection.md` to "always shown, active while pinned, inactive while live", and aligns `docs/architecture/views.md` (building blocks, Visual style) and `docs/architecture/open-questions.md` Q6 with it.
  Why manual: the implement stage writes only under `packages/` and the change's `handoff/` folder, and these documents live in `docs/`.
  Automated part: `git apply --check` in task 5.2. The behaviour the entry describes is covered by the tests of sections 2–4.
