# Specs review: fix-location-card-and-header-layout

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 27/31 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 1 |

## Freshness

- ✅ `views/shared/LocationRow.tsx` is 185 lines; the `<li>` card is `flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-surface px-4 py-3` (`LocationRow.tsx:141`) and renders `DragHandle`, `ZoneRowContent` and `LocationMenu` in that order.
- ✅ `views/shared/ZoneRowContent.tsx` is 119 lines and returns a fragment. The place column is `md:w-64` (`:59`) and is followed by `LocalDateTime`, then `{wallTimeHint !== undefined && <WallTimeHint …/>}` (`:108`), then `DayTrack` (`:110`). `LocationRow` is its only user (grep).
- ✅ `views/shared/WallTimeHint.tsx:14-16` is `<p role="status" className="flex w-full …">`.
- ✅ `views/shared/DayTrack.tsx:81`: the wrapper is `order-last … basis-full … md:order-none md:min-w-0 md:basis-0 md:flex-1`. The visible handle is `h-7 w-7 rounded-full border-2 border-foreground bg-surface …` (`:121`). The label row is `relative hidden h-4 text-xs tabular-nums …` (`:127`). The labels are `absolute top-0` spans placed by `left`, and the last one has `-translate-x-full` (`:21-27,130-138`). A `Stryker disable` comment for label alignment exists (`:20`).
- ✅ `views/shared/LocalDateTime.tsx:45`: the outer span is `flex shrink-0 flex-col items-end md:items-start` with no width. The time button is `min-h-11 min-w-11 … text-2xl font-bold leading-none tabular-nums … md:text-4xl` (`:52`). `WallTimeInput.tsx:88` is `w-24 … md:w-36`.
- ✅ `styles/tokens.css` sets `--color-surface` to `#ffffff` / `#16213a` (`:22,43,64`, for both `[data-theme="dark"]` and the system-dark media query) and the dark `--color-background` to `#0f1729` (`:31,52`). `tailwind.config.ts:28` maps `surface` to `var(--color-surface)`.
- ✅ The handle and the card share `bg-surface` on `main` (`DayTrack.tsx:121`, `LocationRow.tsx:141`), and the theme attribute is set on the document root (`controller/useThemePreference.ts:22-23`). Proposal Q1's "not reproduced from the repository" therefore holds for the code.
- ✅ `app/MainPage.tsx:28-30`: the container is `mx-auto … max-w-screen-2xl … px-4`, the header is `grid grid-cols-[auto_1fr_auto] … md:flex md:gap-4`, and the `<h1>` is `order-2 col-start-2 text-center … md:order-1 md:mr-auto md:text-left`.
- ✅ `views/shared/AddLocationButton.tsx:24,30` has `order-1 col-start-1 … justify-self-start md:order-2 …` and `<span className="hidden md:inline">{t("locations.addShort")}</span>`. `app/SettingsButton.tsx:22` is `order-3 col-start-3 … justify-self-end`.
- ✅ `locations.addShort` exists in `locales/en.json:40` ("Add") and `locales/ru.json:40` ("Добавить") and is used only by `AddLocationButton` (grep).
- ✅ `views/shared/AddLocationButton.test.tsx:53,60` holds "should show the short label only from the wide breakpoint" and "should keep the accessible name Add location in both languages of the label".
- ✅ `time_selection_labels_e2e.steps.ts:129-141` checks the handle against `--color-surface` through `readTokenStyle`. Its scenario is "The visible handle follows the surface and foreground tokens" (`time_selection_layout_e2e.feature:87`).
- ✅ `time_selection_wall_time_input_e2e.steps.ts` is 293 lines and defines "the hint sits below the place column and above the day track" (`:254`), which is used only at `time_selection_wall_time_input_e2e.feature:99`. The "the page shows a GAP hint" step types `GAP_TYPED_TEXT` (`:162-165`; `wallTimeE2eHelpers.ts:5,8`).
- ✅ `main_page_header_e2e.steps.ts` has `MAX_ADJACENT_GAP_PX` (`:17`), the "is directly before" step (`:51-61`) and the visible-text steps (`:63-81`). The two removable steps are used only by "Wide header" (`main_page_header_e2e.feature:20-21`). "No Add location button on an unreadable list" is at `main_page_header_e2e.feature:55`.
- ✅ `locations/steps/locationsStates.ts` is 191 lines, with the state enum at `:45`. `settings/steps/settingsE2eHelpers.ts` exports `seedPreferences` (`:44`), `THEME_VALUES` (`:18`) and `HOUR_FORMAT_VALUES` (`:23`). `listRow` (`locationsE2eHelpers.ts:77`), `visibleHandleOf` and `barOf` (`timeSelectionE2eHelpers.ts:22,24`) exist. "the locations screen does not scroll horizontally" (`locations_layout_e2e.steps.ts:25`) and "the locations screen has no accessibility violations" (`locations_view_a11y_e2e.steps.ts:34`) exist.
- ✅ The four MODIFIED requirements exist in `openspec/specs/` as restated (`time-selection/spec.md:460,852`, `locations/spec.md:774`, `main-page/spec.md:157`). Each delta keeps every stable scenario of its requirement: 11 for "Day track layout", 1 for "Wall-time input layout", 4 for "Local time and date layout" and 7 for "Header actions".
- ✅ The five archived changes named in `proposal.md:3` are under `openspec/changes/archive/2026/10/`, and `add-pr-preview-deploy` is the only other active change. Nothing of this change is implemented yet.
- ✅ The package scripts named in task 7.2 (`typecheck`, `lint`, `test`, `test:bdd`, and the root `build`) exist under `@time-zones/client`.
- ✅ Every `- [ ]` task writes only under `packages/client/` and the checkboxes of `tasks.md`, within the limits of `.gnomish/stages/specify/handoff.md`. There is no `## Human follow-up` and no handoff item. Task 7.1 mutates 4 files, within the 5-file cap.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ Wall-time input layout, "The hint is the bottom line of its card" | ✅ 1.1, 1.2, 5.1 |
| FR2 | ✅ | ✅ Day track layout, "The handle is filled with its card's fill" | ✅ 3.2, 5.2 |
| FR3 | ✅ | ✅ Header actions, "Narrow/Wide header" | ✅ 2.1, 2.2, 4.1 |
| FR4 | ✅ | ✅ Header actions, "Wide header", "No Add location button on an unreadable list" | ✅ 2.2, 4.1, 4.2 |
| FR5 | ✅ | ✅ Day track layout "Equal tracks…", Local time and date layout "One time column width…" | ❌ 3.1, 5.3; 5.3's one-line bound for the time button cannot hold (R4) |
| FR6 | ✅ | ✅ "Equal tracks…", "Hour labels on one line in Russian" | ✅ 3.1, 5.3 |
| NFR-A1 | ✅ | ❌ the header part is in "Header sizes and accessibility"; no scenario covers axe on the Cards view with a hint in the 12-hour format (R5) | ✅ 4.1, 5.3 |
| NFR-A2 | ✅ | ✅ "The hint is the bottom line of its card" (polite status) | ✅ 1.1, 5.1 |
| NFR-R1 | ✅ | ✅ "No horizontal scrolling" (hint, 320/2560), "Tracks in the 12-hour format fit…" (320/768/2560) | ❌ no run combines a hint with the 12-hour format, and the hint is never shown at 768 px (R2) |
| NFR-R2 | ✅ | ✅ "Screenshots show the tracks" (12-hour), "Hint screenshots", Header actions screenshots | ✅ 6.1, 6.2 |
| UX1 | ✅ | ✅ Wall-time input layout | ✅ 1.2, 5.1 |
| UX2 | ✅ | ✅ Header actions | ✅ 2.2, 4.1 |
| UX3 | ✅ | ✅ Day track layout, Local time and date layout | ✅ 3.1, 5.3 |
| UX4 | ✅ | ✅ Day track layout handle fill | ✅ 5.2 |
| G1 | ✅ | n/a met by FR1, M1 | n/a met by FR1, M1 |
| G2 | ✅ | n/a met by FR3, FR4, M2 | n/a met by FR3, FR4, M2 |
| G3 | ✅ | n/a met by FR5, FR6, M3, M4 | n/a met by FR5, FR6, M3, M4 |
| G4 | ✅ | n/a met by FR2, M5 | n/a met by FR2, M5 |
| NG1 | ✅ | n/a nothing changes the hint texts, lifetime or colours (D1 adds only `order-last`) | n/a |
| NG2 | ✅ | n/a the settings page header is untouched | n/a |
| NG3 | ✅ | n/a D5 adds only `whitespace-nowrap`; label count, positions and texts are unchanged | n/a |
| NG4 | ✅ | n/a D4/D5 classes are `md:` only or change no narrow layout | n/a |
| NG5 | ✅ | n/a no token added; D2's conditional fix reuses the existing token | n/a |
| M1 | ✅ | n/a | ✅ 5.1 (375, 1024) |
| M2 | ✅ | n/a | ❌ the without-button case is measured at 375 and 1024 px only, not at 5 widths (R3) |
| M3 | ✅ | n/a | ✅ 5.3 (768, 1024, 1440) |
| M4 | ✅ | n/a | ✅ 5.3 |
| M5 | ✅ | n/a | ✅ 5.2 |
| M6 | ✅ | n/a | ✅ 7.1 |
| M7 | ✅ | n/a | ✅ 7.3 |
| Q1 | ✅ | n/a answered in `design.md` D2 (the handle-to-card fill is pinned by E2E; the owner's report stays open for a follow-up) | n/a |

## Consistency

- `proposal.md:127` (M2) measures the title centre "at 5 of 5 widths (375, 768, 1024, 1440, 2560 px), with and without the Add location button". However, `tasks.md:34` and `specs/main-page/spec.md:56-66` run the unreadable-list (no button) case at 375 and 1024 px only.
- `proposal.md:86` (NFR-R1) requires no horizontal scrolling "with a hint shown and in the 12-hour format" at 320, 768 and 2560 px. However, `tasks.md:42` ("Tracks in the 12-hour format fit <width> px") and the delta scenario `specs/time-selection/spec.md:125-129` show no hint. The only hint scroll check (`time_selection_wall_time_input_e2e.feature:90-104`, kept by the delta `specs/time-selection/spec.md:134-143`) runs in the 24-hour format at 320 and 2560 px.

## Findings

### R1 — WARNING — The fixed 176 px time column makes 24-hour hour labels with minutes collide near 768 px, undeclared
- Location: `openspec/changes/fix-location-card-and-header-layout/design.md:40`
- Rule: `.claude/rules/antipatterns.md` (Unspoken UX criteria)
- Problem: D4 gives the time column `md:w-44` (176 px) in both hour formats. Today the 24-hour time column is about 100 px wide (approved `wall-time-hint` 1024 px screenshot: `12:30` spans x≈357–457). At 768 px the card content is 768 − 2×16 (page `px-4`) − 2×1 (border) − 2×16 (card `px-4`) ≈ 702 px. The fixed parts are the drag handle (44), the place column (256), the inner gap (12), the time column (176), the menu button (44) and three 12 px card gaps, 568 px in total. That leaves a slider of ≈134 px and a bar, inset by 22 px on each side (`DayTrack.tsx:108`), of ≈90 px, so the five labels stand ≈22.5 px apart. A zone whose day boundaries fall at :30 or :45 local time gets labels with minutes such as `05:30`, because `formatHourLabel` switches to the local-time format when the minute is not 0 (`presenter/dayTrack.ts:55-58`). Those labels are about 32 px wide in `text-xs` tabular figures, so they overlap their neighbours until the viewport is about 810–820 px wide. Today the bar is ≈166 px at 768 px and the labels stand ≈41 px apart. D4's Negative consequence (`design.md:61`) says only "each track is shorter", and NG3 (`proposal.md:51`) does not say that 24-hour labels newly collide.
- Impact: Implemented as written, 24-hour users with Kolkata or Kathmandu in the list see overlapping hour labels between 768 px and about 820 px. This regresses the default format, no artifact names it, and no scenario checks label overlap, so the owner approves the PR without knowing.
- Fix: Declare it. In `design.md` D4 and its Negative consequences, add: "From 768 px to about 820 px, 24-hour hour labels with minutes (`05:30`) now touch or overlap, as 12-hour labels already do; accepted for equal tracks." Extend NG3 in `proposal.md:51` with "in both hour formats, including 24-hour labels with minutes that the wider time column brings closer between 768 and about 820 px".
- Fix risk: The regression stays and is only declared, so the owner may reject it in review. Making the width depend on the hour format instead was rejected in `design.md:69` for ADR-0002 reasons and would cost a presenter change.
- Status: fixed
- Resolution: declared the regression as accepted: design.md D4 now states the bar drops to about 90 px at 768 px and 24-hour labels with minutes (`05:30`, from `formatHourLabel`) touch or overlap up to about 820 px; the same line is in its Negative consequences, and proposal NG3 now names this case in both hour formats.

### R2 — WARNING — NFR-R1's "hint shown and 12-hour format" condition is never tested
- Location: `openspec/changes/fix-location-card-and-header-layout/tasks.md:42`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: NFR-R1 (`proposal.md:86`) requires no horizontal scrolling at 320, 768 and 2560 px "with a hint shown and in the 12-hour format". Task 5.3's outline "Tracks in the 12-hour format fit <width> px" (320, 768, 2560) and its delta scenario (`specs/time-selection/spec.md:125-129`) show no hint. The existing hint scroll scenario (delta `specs/time-selection/spec.md:134-143`, `time_selection_wall_time_input_e2e.feature:90-104`) runs in the 24-hour format at 320 and 2560 px only. The hint moves to a new `w-full order-last` place (D1) and the time column gets a fixed width (D4), yet no run checks that combination, and none shows the hint at 768 px.
- Impact: The NFR is ticked by tasks that never create its stated condition. An overflow caused by the moved hint together with 12-hour times at 768 px would pass every check.
- Fix: In task 5.3, make the outline "Tracks in the 12-hour format fit <width> px" pin the current time to `2026-03-08T07:30:00Z`. Add `And the page shows a GAP hint` (the existing step at `time_selection_wall_time_input_e2e.steps.ts:148-165`, which types into New York, already in the outline's list) before "the locations screen does not scroll horizontally". Add the same Given and "AND New York shows a wall-time hint" to the delta scenario "Tracks in the 12-hour format fit narrow and wide screens" (`specs/time-selection/spec.md:125-129`).
- Fix risk: `GAP_HINT_PATTERN` (`/does not exist on this day/`, `wallTimeE2eHelpers.ts:5`) does not depend on the hour format, but the step types `0230` (`GAP_TYPED_TEXT`, `:8`). If the wall-time input reads that differently in the 12-hour format, the implementer must type `2:30 AM` instead. Three E2E runs get slightly longer.
- Status: fixed
- Resolution: the delta scenario "Tracks in the 12-hour format fit narrow and wide screens" (specs/time-selection/spec.md) now pins `2026-03-08T07:30:00Z` and shows the New York wall-time hint; task 5.3 runs that outline with the stored list and the existing "the page shows a GAP hint" step before the no-scroll check, with a `2:30 AM` fallback.

### R3 — WARNING — M2's "without the Add location button at 5 widths" has no test
- Location: `openspec/changes/fix-location-card-and-header-layout/proposal.md:127`
- Rule: `.claude/rules/test-planning.md`
- Problem: M2 counts the title centre "at 5 of 5 widths (375, 768, 1024, 1440, 2560 px), with and without the Add location button". Task 4.1 (`tasks.md:34`) and the delta scenario "No Add location button on an unreadable list" (`specs/main-page/spec.md:56-66`) measure the without-button case at 375 and 1024 px only.
- Impact: The metric cannot be reported as written. The case without the button (two of the three grid columns occupied) stays unmeasured at 768, 1440 and 2560 px.
- Fix: In task 4.1 and in the delta scenario's table (`specs/main-page/spec.md:63-66`), run "No Add location button on an unreadable list" at 375, 768, 1024, 1440 and 2560 px.
- Fix risk: Three more E2E examples; no other cost.
- Status: fixed
- Resolution: the delta scenario "No Add location button on an unreadable list" (specs/main-page/spec.md) and task 4.1 now run at 375, 768, 1024, 1440 and 2560 px, so M2 is measured at 5 widths with and without the button.

### R4 — WARNING — Task 5.3's one-line bound cannot hold for the time button
- Location: `openspec/changes/fix-location-card-and-header-layout/tasks.md:42`
- Rule: `.claude/rules/test-planning.md` (the verification must be a concrete automated check)
- Problem: Task 5.3 asserts that "every time button and every hour label is one line high (box height at most the line height of a 24-hour label, and `scrollWidth <= clientWidth`)". A 24-hour hour label is `text-xs` in the `h-4` label row (`views/shared/DayTrack.tsx:127`), so its line height is 16 px. The time button is `min-h-11 … leading-none … md:text-4xl` (`views/shared/LocalDateTime.tsx:52`), so it is at least 44 px high even with a single line of text. One bound is applied to two elements of different sizes. `scrollWidth <= clientWidth` does not detect wrapping either: wrapped text grows taller, not wider.
- Impact: Taken literally, the FR5 one-line time check fails on a correct implementation, because no time button can be 16 px high. The implementer has to make up a different assertion, so FR5's "shows each time … in full, on one line" (`proposal.md:70`) and the delta's "each time is shown in full on one line" (`specs/locations/spec.md:28`) end up tested by an unplanned check, or not at all.
- Fix: In task 5.3, split the assertion. Each hour label's box height is at most the line height of a 24-hour label (16 px). Each time button's text is on one line: a DOM `Range` over the button's text gives client rects that all share one `top`, within 1 px. Keep `scrollWidth <= clientWidth` only as the "shown in full" (not clipped) check for the time.
- Fix risk: none. The check stays in the playwright-bdd E2E that task 5.3 already plans (layout needs a real browser, `bdd-unit.md`), and no other artifact names this bound.
- Status: fixed
- Resolution: task 5.3 now splits the check: hour labels are at most 16 px high (the 24-hour label line height), each time button has its text on one line (DOM `Range` client rects share one `top` within 1 px), and `scrollWidth <= clientWidth` stays only as the not-clipped check.

### R5 — SUGGESTION — NFR-A1's Cards-view axe check has no spec scenario
- Location: `openspec/changes/fix-location-card-and-header-layout/specs/time-selection/spec.md:131`
- Rule: `.claude/rules/delta-specs.md`
- Problem: NFR-A1 (`proposal.md:81`) covers two pages: the header (in "Header sizes and accessibility", `specs/main-page/spec.md:43-54`) and "the Cards view with a hint, in the 12-hour format" at 375/1024 px in both themes. Task 5.3 (`tasks.md:42`) adds "No accessibility violations with a hint in the 12-hour format", but no delta scenario states it. The delta "Wall-time input layout" requirement (`specs/time-selection/spec.md:131-132`) and its scenarios (`:134-163`) do not mention axe-core, so the requirement survives archiving only in the test.
- Impact: After archiving, the stable spec does not say the hint/12-hour layout is axe-clean, so a later change may drop the test without contradicting any spec.
- Fix: Add to the delta "Wall-time input layout" (`specs/time-selection/spec.md:131`) a scenario "No accessibility violations with a hint in the 12-hour format": 12-hour format, New York shows the GAP hint, 375/1024 px, light/dark, and axe-core reports no violations. Add NFR-A1 to its traceability comment.
- Fix risk: none
- Status: fixed
- Resolution: added the scenario "No accessibility violations with a hint in the 12-hour format" (375/1024 px, light/dark) to the delta "Wall-time input layout" in specs/time-selection/spec.md, an axe-core sentence to its requirement text, and NFR-A1 to its traceability comment; task 5.3 already implements it.

## Verdict

Needs revision. There is no CRITICAL finding. R1, R2, R3 and R4 (WARNING) should be resolved before implementing. R5 is optional polish.
