# Specs review: fix-location-card-and-header-layout

## Summary

| Item | Value |
|---|---|
| Stale claims | 0 |
| Requirements fully covered | 28/31 |
| Contradictions | 2 |
| CRITICAL | 0 |
| WARNING | 3 |
| SUGGESTION | 1 |

## Freshness

- ✅ `views/shared/LocationRow.tsx` is 185 lines; the `<li>` card is `flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-surface px-4 py-3` and renders `DragHandle`, `ZoneRowContent`, `LocationMenu` in that order (`LocationRow.tsx:141-181`).
- ✅ `views/shared/ZoneRowContent.tsx` is 119 lines, has the `md:w-64` place column, renders `{wallTimeHint !== undefined && <WallTimeHint …/>}` before `DayTrack` (`ZoneRowContent.tsx:59,108-116`), and `LocationRow` is its only user (grep).
- ✅ `views/shared/WallTimeHint.tsx:14-16` is `<p role="status" className="flex w-full …">`.
- ✅ `views/shared/DayTrack.tsx:81` wrapper is `order-last … basis-full … md:order-none md:min-w-0 md:basis-0 md:flex-1`; the visible handle is `h-7 w-7 rounded-full border-2 border-foreground bg-surface …` (`:121`); hour labels are `absolute top-0` spans placed by `left`, the last with `-translate-x-full` (`:21-27,130-138`); a `Stryker disable` comment for label alignment exists (`:20`).
- ✅ `views/shared/LocalDateTime.tsx:67` outer span is `flex shrink-0 flex-col items-end md:items-start` with no width; `WallTimeInput.tsx:88` is `w-24 … md:w-36`.
- ✅ `styles/tokens.css` sets `--color-surface` `#ffffff` / `#16213a` (both `[data-theme="dark"]` and the system-dark media query) and dark `--color-background` `#0f1729`; `tailwind.config.ts:28` maps `surface` to `var(--color-surface)`.
- ✅ Handle and card share `bg-surface` on `main` (`DayTrack.tsx:121`, `LocationRow.tsx:141`), and the theme attribute is set on the document root (`controller/useThemePreference.ts:22-23`), so proposal Q1's "not reproduced from the repository" holds for the code.
- ✅ `app/MainPage.tsx:28-30`: container `mx-auto … max-w-screen-2xl … px-4`; header `grid grid-cols-[auto_1fr_auto] … md:flex md:gap-4`; `<h1>` `order-2 col-start-2 text-center … md:order-1 md:mr-auto md:text-left`.
- ✅ `views/shared/AddLocationButton.tsx:24,30` has `order-1 col-start-1 … justify-self-start md:order-2 … md:border-border md:bg-surface` and `<span className="hidden md:inline">{t("locations.addShort")}</span>`; `app/SettingsButton.tsx:72` is `order-3 col-start-3 … justify-self-end`.
- ✅ `locations.addShort` exists in `locales/en.json:40` ("Add") and `locales/ru.json:40` ("Добавить") and is used only by `AddLocationButton` (grep).
- ✅ `views/shared/AddLocationButton.test.tsx:53-66` holds "should show the short label only from the wide breakpoint" and "should keep the accessible name Add location in both languages of the label".
- ✅ `time_selection_labels_e2e.steps.ts:128-141` checks the handle against `--color-surface` via `readTokenStyle`; its only user is the scenario "The visible handle follows the surface and foreground tokens" (`time_selection_layout_e2e.feature:87-90`).
- ✅ `time_selection_wall_time_input_e2e.steps.ts` is 293 lines and defines "the hint sits below the place column and above the day track" (`:254`), used only at `time_selection_wall_time_input_e2e.feature:99`.
- ✅ `main_page_header_e2e.steps.ts` has the header-order step, "is directly before" with `MAX_ADJACENT_GAP_PX` (`:17,51-61`), "shows no visible text" and "shows the visible text" (`:63-81`); the last two removable steps are used only by "Wide header" in `main_page_header_e2e.feature:19-21`.
- ✅ `locations/steps/locationsStates.ts` is 191 lines with the state enum (`:46-66`); `settings/steps/settingsE2eHelpers.ts` exports `seedPreferences`, `THEME_VALUES`, `HOUR_FORMAT_VALUES`; `listRow`, `visibleHandleOf`, `barOf` exist (`locationsE2eHelpers.ts:77`, `timeSelectionE2eHelpers.ts:22,24`); "the locations screen does not scroll horizontally" and "the locations screen has no accessibility violations" exist.
- ✅ The four MODIFIED requirements exist in `openspec/specs/` as restated (`time-selection/spec.md:460,852`, `locations/spec.md:774`, `main-page/spec.md:157`), and each delta keeps every stable scenario of its requirement.
- ✅ The five archived changes named in `proposal.md:3` are under `openspec/changes/archive/2026/10/`, and `add-pr-preview-deploy` is the only other active change; nothing of this change is implemented yet.
- ✅ The package scripts named in task 7.2 (`typecheck`, `lint`, `test`, `test:bdd`, root `build`) exist under `@time-zones/client`.

## Coverage

| Id | Proposal | Spec | Task |
|---|---|---|---|
| FR1 | ✅ | ✅ Wall-time input layout, "The hint is the bottom line of its card" | ✅ 1.1, 1.2, 5.1 |
| FR2 | ✅ | ✅ Day track layout, "The handle is filled with its card's fill" | ✅ 3.2, 5.2 |
| FR3 | ✅ | ✅ Header actions, "Narrow/Wide header" | ✅ 2.1, 2.2, 4.1 |
| FR4 | ✅ | ✅ Header actions, "Wide header", "No Add location button on an unreadable list" | ✅ 2.2, 4.1, 4.2 |
| FR5 | ✅ | ✅ Day track layout "Equal tracks…", Local time and date layout "One time column width…" | ✅ 3.1, 5.3 |
| FR6 | ✅ | ✅ "Equal tracks…", "Hour labels on one line in Russian" | ✅ 3.1, 5.3 |
| NFR-A1 | ✅ | ❌ header part in "Header sizes and accessibility"; no scenario for axe on the Cards view with a hint in the 12-hour format (R4) | ✅ 4.1, 5.3 |
| NFR-A2 | ✅ | ✅ "The hint is the bottom line of its card" (polite status) | ✅ 1.1, 5.1 |
| NFR-R1 | ✅ | ✅ "No horizontal scrolling" (hint, 320/2560), "Tracks in the 12-hour format fit…" (320/768/2560) | ❌ no run combines a hint with the 12-hour format, hint never at 768 px (R2) |
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
| NG3 | ✅ | n/a D5 adds only `whitespace-nowrap`; label count, positions, texts unchanged | n/a |
| NG4 | ✅ | n/a D4/D5 classes are `md:` only | n/a |
| NG5 | ✅ | n/a no token added; D2's conditional fix reuses the existing token | n/a |
| M1 | ✅ | n/a | ✅ 5.1 (375, 1024) |
| M2 | ✅ | n/a | ❌ the without-button case is measured at 375 and 1024 px only, not at 5 widths (R3) |
| M3 | ✅ | n/a | ✅ 5.3 (768, 1024, 1440) |
| M4 | ✅ | n/a | ✅ 5.3 |
| M5 | ✅ | n/a | ✅ 5.2 |
| M6 | ✅ | n/a | ✅ 7.1 |
| M7 | ✅ | n/a | ✅ 7.3 |
| Q1 | ✅ | n/a answered in `design.md` D2 (pin handle-to-card fill by E2E; owner's report stays open for a follow-up) | n/a |

## Consistency

- `proposal.md:127` (M2) measures the title centre "at 5 of 5 widths (375, 768, 1024, 1440, 2560 px), with and without the Add location button", but `tasks.md:34` and `specs/main-page/spec.md:102-112` run the unreadable-list (no button) case at 375 and 1024 px only.
- `proposal.md:86` (NFR-R1) requires no horizontal scrolling "with a hint shown and in the 12-hour format" at 320, 768 and 2560 px, but `tasks.md:42` ("Tracks in the 12-hour format fit <width> px") shows no hint, and the only hint scroll check (`time_selection_wall_time_input_e2e.feature:90-104`, kept by the delta `specs/time-selection/spec.md:246-255`) runs in the 24-hour format at 320 and 2560 px.

## Findings

### R1 — WARNING — The fixed 176 px time column makes 24-hour hour labels collide at 768 px, undeclared
- Location: `openspec/changes/fix-location-card-and-header-layout/design.md:40`
- Rule: `.claude/rules/antipatterns.md` (Unspoken UX criteria) / `—`
- Problem: D4 gives the time column `md:w-44` (176 px) in both hour formats. Today the 24-hour time column is about 100 px wide (approved `wall-time-hint` 1024 px screenshot: `12:30` spans x≈357–457). At 768 px the card's inner width is 768 − 2×16 (page `px-4`) − 2×1 − 2×16 (card) ≈ 702 px; the fixed parts are drag handle 44 + place 256 + time 176 + menu 44 + four 12 px gaps = 568 px, so the slider is ≈134 px and the bar, inset by 22 px each side (`DayTrack.tsx:108`), ≈90 px. The five labels then stand ≈22.5 px apart. 24-hour labels with minutes (Kolkata `00:30 06:30 12:30 …`, Kathmandu `…:45`, `text-xs` ≈32 px wide) overlap their neighbours; today, with a ≈100 px time column, the bar is ≈166 px and labels stand ≈41 px apart and do not touch. D4's Negative consequence (`design.md:61`) says only "each track is shorter", and NG3 (`proposal.md:51`) speaks of labels touching, implicitly in the 12-hour case this change addresses, not of a new 24-hour regression.
- Impact: Implemented as written, every 24-hour user with a :30/:45 zone sees overlapping, unreadable hour labels between 768 px and roughly 820 px, a regression of the default format that no artifact names and no test catches (no existing scenario checks label overlap), so the owner approves the PR without knowing.
- Fix: Declare it. In `design.md` D4 and its Negative consequences, add: "From 768 px to about 820 px, 24-hour hour labels with minutes (`00:30`) now touch or overlap, as 12-hour labels already do; accepted for equal tracks." Extend NG3 in `proposal.md:51` to "in both hour formats, including 24-hour labels with minutes that the wider time column brings closer between 768 and about 820 px".
- Fix risk: The regression stays, only declared; the owner may reject it in review. Making the width format-dependent instead was rejected in `design.md:69` for ADR-0002 reasons and would cost a presenter change.
- Status: open

### R2 — WARNING — NFR-R1's "hint shown and 12-hour format" condition is never tested
- Location: `openspec/changes/fix-location-card-and-header-layout/tasks.md:42`
- Rule: `.claude/rules/test-planning.md` ("Every FR/NFR/UX from proposal must have at least one automated test covering it")
- Problem: NFR-R1 (`proposal.md:86`) requires no horizontal scrolling at 320, 768 and 2560 px "with a hint shown and in the 12-hour format". Task 5.3's outline "Tracks in the 12-hour format fit <width> px" (320, 768, 2560) shows no hint; the existing hint scroll scenario runs in the 24-hour format at 320 and 2560 px only. The hint moves to a new `w-full order-last` place (D1) and the time column gets a fixed width (D4), and no run checks that combination, nor the hint at 768 px.
- Impact: The NFR is ticked by tasks that never create its stated condition; an overflow caused by the moved hint together with 12-hour times at 768 px would pass every check.
- Fix: In task 5.3, make the outline "Tracks in the 12-hour format fit <width> px" pin the current time to `2026-03-08T07:30:00Z` and add `And the page shows a GAP hint` (the existing step, `time_selection_wall_time_input_e2e.steps.ts:148-165`, types `02:30` in New York, which the outline's list already contains) before "the locations screen does not scroll horizontally"; add the same Given and "AND New York shows a wall-time hint" to the delta scenario "Tracks in the 12-hour format fit narrow and wide screens" (`specs/time-selection/spec.md:237-241`).
- Fix risk: `GAP_HINT_PATTERN` (`/does not exist on this day/`, `wallTimeE2eHelpers.ts:5`) is format-agnostic, but the step types `0230` (`GAP_TYPED_TEXT`); if the wall-time input in the 12-hour format reads that differently, the implementer must type `2:30 AM` instead. Three E2E runs get slightly longer.
- Status: open

### R3 — WARNING — M2's "without the Add location button at 5 widths" has no test
- Location: `openspec/changes/fix-location-card-and-header-layout/proposal.md:127`
- Rule: `.claude/rules/test-planning.md`
- Problem: M2 counts the title centre "at 5 of 5 widths (375, 768, 1024, 1440, 2560 px), with and without the Add location button". Task 4.1 (`tasks.md:34`) and the delta scenario "No Add location button on an unreadable list" (`specs/main-page/spec.md:102-112`) measure the without-button case at 375 and 1024 px only.
- Impact: The metric cannot be reported as written; the grid-without-button case (two occupied columns of three) stays unmeasured at 768, 1440 and 2560 px.
- Fix: In task 4.1 and in the delta scenario's table, run "No Add location button on an unreadable list" at 375, 768, 1024, 1440 and 2560 px.
- Fix risk: Three more E2E examples; none otherwise.
- Status: open

### R4 — SUGGESTION — NFR-A1's Cards-view axe check has no spec scenario
- Location: `openspec/changes/fix-location-card-and-header-layout/specs/time-selection/spec.md:243`
- Rule: `.claude/rules/delta-specs.md`
- Problem: NFR-A1 (`proposal.md:81`) covers two pages: the header (in "Header sizes and accessibility") and "the Cards view with a hint, in the 12-hour format" at 375/1024 px in both themes. Task 5.3 adds "No accessibility violations with a hint in the 12-hour format", but no delta scenario states it, so the requirement survives archiving only in the test.
- Impact: The stable spec after archiving does not say the hint/12-hour layout is axe-clean; a later change may drop the test without contradicting any spec.
- Fix: Add to the delta "Wall-time input layout" a scenario "No accessibility violations with a hint in the 12-hour format" (12-hour, New York shows the GAP hint, 375/1024 px, light/dark, axe-core reports no violations), and add NFR-A1 to its traceability comment.
- Fix risk: none
- Status: open

## Verdict

Needs revision — no CRITICAL finding; R1, R2 and R3 (WARNING) should be resolved before implementing, R4 is optional polish.
